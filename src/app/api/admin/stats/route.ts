import { getDashboardStats } from '@/controllers/admin/statsController';

export const GET = async () => {
  return await getDashboardStats();
};
