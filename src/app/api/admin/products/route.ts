import { getAllProductsAdmin, createProductAdmin } from '@/controllers/admin/productAdminController';

export const GET = async (req: Request) => {
  return await getAllProductsAdmin(req);
};

export const POST = async (req: Request) => {
  return await createProductAdmin(req);
};
