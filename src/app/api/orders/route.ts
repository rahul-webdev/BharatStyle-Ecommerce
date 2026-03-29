import { placeOrder, getUserOrders } from '@/controllers/order/orderController';

export const POST = async (req: Request) => {
  return await placeOrder(req);
};

export const GET = async (req: Request) => {
  return await getUserOrders(req);
};
