import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';

export const placeOrder = async (req: Request) => {
  try {
    const body = await req.json();
    const { items, total, shippingAddress, paymentMethod, isPaid, customer } = body;

    const session = await getServerSession(authOptions);

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, message: 'No order items' }, { status: 400 });
    }

    await dbConnect();
    
    let userId: string | null = null;
    if (session && session.user) {
      userId = (session.user as any).id;
    } else if (customer?.mobile) {
      let existing = await User.findOne({ phone: customer.mobile });
      if (!existing) {
        existing = await User.create({
          name: [customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'Guest',
          phone: customer.mobile,
          role: 'user',
          isVerified: true,
          address: { street: shippingAddress, city: 'Mumbai', state: '', zipCode: '400001', country: 'India' },
        });
      }
      userId = existing._id.toString();
    }

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Verify stock and prices
    const orderItems: any[] = [];
    const missingItems: string[] = [];
    let serverTotal = 0;
    for (const item of items) {
      const product = await Product.findById(item.id);
      if (!product) {
        missingItems.push(String(item.id));
        continue;
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ success: false, message: `Product ${product.name} out of stock` }, { status: 400 });
      }
      
      orderItems.push({
        name: product.name,
        qty: item.quantity,
        image: product.images[0],
        price: product.discountPrice || product.price,
        product: product._id,
      });
      serverTotal += (product.discountPrice || product.price) * item.quantity;

      // Update stock
      product.stock -= item.quantity;
      await product.save();
    }

    if (orderItems.length === 0) {
      return NextResponse.json({ success: false, message: 'No valid order items' }, { status: 400 });
    }

    const order = await Order.create({
      user: userId,
      orderItems,
      shippingAddress: {
        address: shippingAddress,
        city: 'Mumbai', // Default or extracted from address string
        postalCode: '400001',
        country: 'India',
      },
      paymentMethod,
      totalPrice: serverTotal || total,
      isPaid: Boolean(isPaid),
      paidAt: Boolean(isPaid) ? new Date() : undefined,
      isDelivered: false,
    });

    return NextResponse.json({
      id: order._id,
      date: order.createdAt,
      status: 'pending',
      total: order.totalPrice,
      items: order.orderItems,
      missingItems,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Place Order Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
};

export const getUserOrders = async (req: Request) => {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const mobile = searchParams.get('mobile') || undefined;

    await dbConnect();
    let userId: string | null = null;
    if (session && session.user) {
      userId = (session.user as any).id;
    } else if (mobile) {
      const user = await User.findOne({ phone: mobile });
      userId = user?._id?.toString() || null;
    }

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const orders = await Order.find({ user: userId }).sort('-createdAt');

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('Get User Orders Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
};
