import { getProductBySlug } from '@/controllers/product/productController';

export const GET = async (req: Request, { params }: { params: { slug: string } }) => {
  return await getProductBySlug(req, { params });
};
