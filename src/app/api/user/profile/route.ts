import { getProfile, updateProfile } from '@/controllers/user/userController';

export const GET = async (req: Request) => {
  return await getProfile(req);
};

export const PUT = async (req: Request) => {
  return await updateProfile(req);
};
