import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';
import { secureResponse, errorResponse } from '@/lib/apiResponse';

export const getCategories = async (req: Request) => {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const featured = searchParams.get('featured') === 'true';
    const parentSlug = searchParams.get('parent');

    const query: any = {};
    if (featured) query.isFeatured = true;

    if (parentSlug) {
      if (parentSlug === 'root') {
        query.parent = null;
      } else {
        const parent = await Category.findOne({ slug: parentSlug });
        if (parent) query.parent = parent._id;
      }
    }

    const categories = await Category.find(query).sort('name');

    return secureResponse(
      categories.map((cat: any) => ({
        id: cat._id,
        title: cat.name,
        slug: cat.slug,
        image: cat.image,
        description: cat.description,
        isFeatured: !!cat.isFeatured,
        parent: cat.parent || null,
      }))
    );
  } catch (error: any) {
    console.error('Get Categories Error:', error);
    return errorResponse(error.message, 500);
  }
};
