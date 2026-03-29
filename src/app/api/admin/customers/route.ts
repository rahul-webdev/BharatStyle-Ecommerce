import { getAllCustomersAdmin } from '@/controllers/admin/customerAdminController';

export const GET = async () => {
  return await getAllCustomersAdmin();
};
