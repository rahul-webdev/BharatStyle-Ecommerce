import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { generateAndSaveOTP } from '@/lib/otp';

export const sendOTP = async (req: Request) => {
  try {
    await dbConnect();
    const { mobile } = await req.json();

    if (!mobile) {
      return NextResponse.json({ success: false, message: 'Mobile number is required' }, { status: 400 });
    }

    // Check if user exists, if not create a placeholder user
    let user = await User.findOne({ phone: mobile });
    if (!user) {
      user = await User.create({
        phone: mobile,
        name: `User-${mobile.slice(-4)}`, // Default name
        isVerified: false,
      });
    }

    const otp = await generateAndSaveOTP(mobile);

    // In production, send OTP via SMS provider
    console.log(`Sending OTP ${otp} to mobile ${mobile}`);

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      otpSent: true,
    });
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
};

export const verifyOTP = async (req: Request) => {
  try {
    await dbConnect();
    const { mobile, otp } = await req.json();

    if (!mobile || !otp) {
      return NextResponse.json({ success: false, message: 'Mobile and OTP are required' }, { status: 400 });
    }

    const user = await User.findOne({ phone: mobile });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    if (!user.otp || user.otp.code !== otp || user.otp.expiresAt < new Date()) {
      return NextResponse.json({ success: false, message: 'Invalid or expired OTP' }, { status: 400 });
    }

    // Clear OTP and verify user
    user.otp = undefined;
    user.isVerified = true;
    user.otpAttempts = 0; // Reset attempts on successful verification
    await user.save();

    // Note: In NextAuth, verification usually happens during the authorize callback.
    // This endpoint can be used for manual verification or custom flows.
    // To get a session, the client should still call signIn('credentials', ...)
    
    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      user: {
        id: user._id,
        mobile: user.phone,
        name: user.name,
        address: user.address,
      }
    });
  } catch (error: any) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
};
