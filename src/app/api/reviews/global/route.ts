import { getGlobalReviews } from '@/controllers/admin/settingsController';

export const GET = async () => {
  return await getGlobalReviews();
};
