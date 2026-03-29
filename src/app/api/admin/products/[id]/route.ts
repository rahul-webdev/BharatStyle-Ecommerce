import { updateProductAdmin, deleteProductAdmin } from '@/controllers/admin/productAdminController';

export const PUT = async (req: Request, { params }: { params: { id: string } }) => {
  return await updateProductAdmin(req, { params });
};

export const DELETE = async (req: Request, { params }: { params: { id: string } }) => {
  return await deleteProductAdmin(req, { params });
};
