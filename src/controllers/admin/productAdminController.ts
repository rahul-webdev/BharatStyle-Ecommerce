import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export const getAllProductsAdmin = async (req: Request) => {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const query = search 
      ? { name: { $regex: search, $options: 'i' } }
      : {};

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('category', 'name slug');

    return NextResponse.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error('Admin Get Products Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
};

export const createProductAdmin = async (req: Request) => {
  try {
    await dbConnect();
    const body = await req.json();
    const product = await Product.create(body);
    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: any) {
    console.error('Admin Create Product Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
};

export const updateProductAdmin = async (req: Request, { params }: { params: { id: string } }) => {
  try {
    await dbConnect();
    const body = await req.json();
    const product = await Product.findByIdAndUpdate(params.id, body, { new: true });
    if (!product) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('Admin Update Product Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
};

export const deleteProductAdmin = async (req: Request, { params }: { params: { id: string } }) => {
  try {
    await dbConnect();
    const product = await Product.findByIdAndDelete(params.id);
    if (!product) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error: any) {
    console.error('Admin Delete Product Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
};
