import { verifyOTP } from '@/controllers/auth/authController';

export const POST = async (req: Request) => {
  return await verifyOTP(req);
};
