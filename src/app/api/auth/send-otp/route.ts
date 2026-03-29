import { sendOTP } from '@/controllers/auth/authController';

export const POST = async (req: Request) => {
  return await sendOTP(req);
};
