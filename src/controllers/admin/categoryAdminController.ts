import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';

export const getAllCategoriesAdmin = async (req: Request) => {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const nopagination = searchParams.get('nopagination') === 'true';

    const query = search 
      ? { name: { $regex: search, $options: 'i' } }
      : {};

    if (nopagination) {
      const categories = await Category.find(query).sort('-createdAt');
      return NextResponse.json(categories);
    }

    const total = await Category.countDocuments(query);
    const categories = await Category.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      categories,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error('Admin Get Categories Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
};

export const createCategoryAdmin = async (req: Request) => {
  try {
    await dbConnect();
    const body = await req.json();
    if (body.parent) body.isFeatured = false;
    const category = await Category.create(body);
    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error: any) {
    console.error('Admin Create Category Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
};

export const updateCategoryAdmin = async (req: Request, { params }: { params: { id: string } }) => {
  try {
    await dbConnect();
    const body = await req.json();
    if (body.parent) body.isFeatured = false;
    const category = await Category.findByIdAndUpdate(params.id, body, { new: true });
    if (!category) return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error('Admin Update Category Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
};

export const deleteCategoryAdmin = async (req: Request, { params }: { params: { id: string } }) => {
  try {
    await dbConnect();
    const category = await Category.findByIdAndDelete(params.id);
    if (!category) return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (error: any) {
    console.error('Admin Delete Category Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
};
