import { updateCategoryAdmin, deleteCategoryAdmin } from '@/controllers/admin/categoryAdminController';

export const PUT = async (req: Request, { params }: { params: { id: string } }) => {
  return await updateCategoryAdmin(req, { params });
};

export const DELETE = async (req: Request, { params }: { params: { id: string } }) => {
  return await deleteCategoryAdmin(req, { params });
};
