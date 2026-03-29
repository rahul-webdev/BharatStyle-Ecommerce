import { getAllCategoriesAdmin, createCategoryAdmin } from '@/controllers/admin/categoryAdminController';

export const GET = async (req: Request) => {
  return await getAllCategoriesAdmin(req);
};

export const POST = async (req: Request) => {
  return await createCategoryAdmin(req);
};
