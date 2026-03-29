import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from './dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        identifier: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
        loginType: { label: "Login Type", type: "text" } // 'email-password', 'phone-password', 'phone-otp'
      },
      async authorize(credentials) {
        if (!credentials) return null;
        
        await dbConnect();

        const { identifier, password, loginType } = credentials;

        let user;

        if (loginType === 'email-password') {
          user = await User.findOne({ email: identifier.toLowerCase() }).select('+password');
          if (!user || !user.password) throw new Error('Invalid email or password');
          const isPasswordMatch = await bcrypt.compare(password, user.password);
          if (!isPasswordMatch) throw new Error('Invalid email or password');
        } 
        else if (loginType === 'phone-password') {
          user = await User.findOne({ phone: identifier }).select('+password');
          if (!user || !user.password) throw new Error('Invalid phone or password');
          const isPasswordMatch = await bcrypt.compare(password, user.password);
          if (!isPasswordMatch) throw new Error('Invalid phone or password');
        }
        else if (loginType === 'phone-otp') {
          user = await User.findOne({ phone: identifier });
          if (!user) throw new Error('User not found');
          
          // Check if user is blocked
          if (user.blockedUntil && user.blockedUntil > new Date()) {
            const remainingMinutes = Math.ceil((user.blockedUntil.getTime() - Date.now()) / (60 * 1000));
            throw new Error(`Account blocked. Try again after ${remainingMinutes} minutes.`);
          }

          // OTP verification logic
          if (!user.otp || user.otp.code !== password || user.otp.expiresAt < new Date()) {
            throw new Error('Invalid or expired OTP');
          }

          // Clear OTP after successful login and set verified
          user.otp = undefined;
          user.isVerified = true;
          user.otpAttempts = 0; // Reset attempts on successful login
          await user.save();
        }
        else {
          throw new Error('Invalid login type');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.avatar,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        await dbConnect();
        let existingUser = await User.findOne({ 
          $or: [{ email: user.email }, { googleId: account.providerAccountId }]
        });

        if (!existingUser) {
          // Create a new user for Google login if they don't exist
          existingUser = await User.create({
            name: user.name ?? '',
            email: user.email ?? '',
            avatar: user.image ?? '',
            googleId: account.providerAccountId,
            isVerified: true,
          });
        } else if (!existingUser.googleId) {
          // Link Google account to existing email account
          existingUser.googleId = account.providerAccountId;
          existingUser.avatar = user.image || existingUser.avatar;
          await existingUser.save();
        }
        user.id = existingUser._id.toString();
        (user as any).role = existingUser.role;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/auth/error',
  },
};
