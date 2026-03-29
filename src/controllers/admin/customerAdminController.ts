import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export const getAllCustomersAdmin = async () => {
  try {
    await dbConnect();
    const customers = await User.find({ role: 'user' }).select('-password').sort('-createdAt');
    return NextResponse.json(customers);
  } catch (error: any) {
    console.error('Admin Get Customers Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
};
