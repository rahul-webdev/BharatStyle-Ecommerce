import { getFAQs } from '@/controllers/admin/settingsController';

export const GET = async () => {
  return await getFAQs();
};
