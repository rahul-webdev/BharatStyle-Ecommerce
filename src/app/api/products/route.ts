import { getProducts } from '@/controllers/product/productController';

export const GET = async (req: Request) => {
  return await getProducts(req);
};
