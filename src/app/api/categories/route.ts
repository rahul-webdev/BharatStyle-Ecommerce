import { getCategories } from '@/controllers/category/categoryController';

export const GET = async (req: Request) => {
  return await getCategories(req);
};
