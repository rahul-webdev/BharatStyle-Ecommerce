import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import Product from '@/models/Product';

export const getAllOrdersAdmin = async (req: Request) => {
  try {
    await dbConnect();
    const orders = await Order.find({})
      .sort('-createdAt')
      .populate('user', 'name phone');
    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('Admin Get Orders Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
};

export const updateOrderStatusAdmin = async (req: Request, { params }: { params: { id: string } }) => {
  try {
    const { status } = await req.json(); // pending, processing, dispatched, delivered, cancelled, rejected
    await dbConnect();
    const order = await Order.findById(params.id);
    if (!order) return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });

    order.status = status;

    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    } else {
      order.isDelivered = false;
      order.deliveredAt = undefined;
    }

    if (status === 'cancelled' || status === 'rejected') {
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.qty;
          await product.save();
        }
      }
    }

    await order.save();
    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('Admin Update Order Status Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
};
