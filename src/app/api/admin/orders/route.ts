import { getAllOrdersAdmin } from '@/controllers/admin/orderAdminController';

export const GET = async (req: Request) => {
  return await getAllOrdersAdmin(req);
};
