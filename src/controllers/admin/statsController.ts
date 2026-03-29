import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import { secureResponse, errorResponse } from '@/lib/apiResponse';

export const getDashboardStats = async () => {
  try {
    await dbConnect();
    
    const totalSalesResult = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const totalSales = totalSalesResult.length > 0 ? totalSalesResult[0].total : 0;
    
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'user' });
    const activeProducts = await Product.countDocuments();

    return secureResponse({
      totalSales,
      totalOrders,
      totalCustomers,
      activeProducts
    });
  } catch (error: any) {
    console.error('Get Stats Error:', error);
    return errorResponse(error.message, 500);
  }
};
