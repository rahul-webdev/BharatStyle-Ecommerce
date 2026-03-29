import { updateOrderStatusAdmin } from '@/controllers/admin/orderAdminController';

export const PUT = async (req: Request, { params }: { params: { id: string } }) => {
  return await updateOrderStatusAdmin(req, { params });
};
