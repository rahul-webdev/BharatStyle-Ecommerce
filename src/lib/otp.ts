import dbConnect from './dbConnect';
import User from '@/models/User';

/**
 * Generate a 6-digit OTP and save it to the user's record
 * @param identifier Phone number or Email
 * @returns The generated OTP (for testing purposes, you would normally send it via SMS/Email)
 */
export async function generateAndSaveOTP(identifier: string): Promise<string> {
  await dbConnect();
  
  // Search for user by phone or email
  const user = await User.findOne({ 
    $or: [{ phone: identifier }, { email: identifier }] 
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Check if user is blocked
  if (user.blockedUntil && user.blockedUntil > new Date()) {
    const remainingMinutes = Math.ceil((user.blockedUntil.getTime() - Date.now()) / (60 * 1000));
    throw new Error(`Your account is blocked due to too many attempts. Please try again after ${remainingMinutes} minutes.`);
  }

  // Check resend cooldown (1 minute)
  if (user.lastOtpSentAt) {
    const timeSinceLastOtp = Date.now() - user.lastOtpSentAt.getTime();
    if (timeSinceLastOtp < 60 * 1000) {
      const remainingSeconds = Math.ceil((60 * 1000 - timeSinceLastOtp) / 1000);
      throw new Error(`Please wait ${remainingSeconds} seconds before requesting a new OTP.`);
    }
  }

  // Reset attempts if block period has passed
  if (user.blockedUntil && user.blockedUntil <= new Date()) {
    user.otpAttempts = 0;
    user.blockedUntil = undefined;
  }

  // Rate limit check: block after 5 attempts
  if ((user.otpAttempts || 0) >= 5) {
    user.blockedUntil = new Date(Date.now() + 60 * 60 * 1000); // Block for 1 hour
    await user.save();
    throw new Error('Too many attempts. Your account has been blocked for 1 hour.');
  }

  // const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const otp = "1234";
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes

  user.otp = {
    code: otp,
    expiresAt,
  };
  user.otpAttempts = (user.otpAttempts || 0) + 1;
  user.lastOtpSentAt = new Date();

  await user.save();

  // In a real application, you would send this OTP via SMS (Twilio, Firebase, etc.)
  console.log(`OTP for ${identifier}: ${otp}`);

  return otp;
}
