import { getBrands } from '@/controllers/admin/settingsController';

export const GET = async () => {
  return await getBrands();
};
