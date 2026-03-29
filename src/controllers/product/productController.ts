import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { secureResponse, errorResponse } from '@/lib/apiResponse';

export const getProducts = async (req: Request) => {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const categorySlug = searchParams.get('category');
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '1000000');
    const color = searchParams.get('color');
    const size = searchParams.get('size');
    const sort = searchParams.get('sort') || '-createdAt';
    const onSale = searchParams.get('onSale') === 'true';
    const search = (searchParams.get('search') || '').trim();

    const query: any = {
      price: { $gte: minPrice, $lte: maxPrice }
    };

    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug });
      if (category) {
        const children = await Category.find({ parent: category._id }).select('_id');
        const categoryIds = [category._id, ...children.map(c => c._id)];
        query.category = { $in: categoryIds };
      }
    }

    if (color) {
      query.colors = color;
    }

    if (size) {
      query.sizes = size;
    }

    if (onSale) {
      query.discountPrice = { $gt: 0 };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('category', 'name slug');

    const facetQuery = { ...query };
    delete facetQuery.price;
    const availableColors = await Product.distinct('colors', facetQuery);
    const availableSizes = await Product.distinct('sizes', facetQuery);
    const priceAgg = await Product.aggregate([
      { $match: facetQuery },
      { $group: { _id: null, minPrice: { $min: '$price' }, maxPrice: { $max: '$price' } } }
    ]);
    const minAvailablePrice = priceAgg.length > 0 ? priceAgg[0].minPrice : 0;
    const maxAvailablePrice = priceAgg.length > 0 ? priceAgg[0].maxPrice : 0;

    return secureResponse({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      availableColors,
      availableSizes,
      priceRange: { min: minAvailablePrice, max: maxAvailablePrice }
    });
  } catch (error: any) {
    console.error('Get Products Error:', error);
    return errorResponse(error.message, 500);
  }
};

export const getProductBySlug = async (req: Request, { params }: { params: { slug: string } }) => {
  try {
    await dbConnect();
    const product = await Product.findOne({ slug: params.slug }).populate('category', 'name slug');

    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    // Map to the requested output format in required-apis.md
    return NextResponse.json({
      id: product._id,
      title: product.name,
      description: product.description,
      price: product.price,
      srcUrl: product.images[0],
      gallery: product.images,
      discount: { 
        amount: product.price - (product.discountPrice || product.price), 
        percentage: product.discountPrice ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0 
      },
      rating: product.ratings,
      reviews: product.reviews.map((r: any, i: number) => ({
        id: r?._id ?? i,
        user: r.name,
        comment: r.comment,
        rating: r.rating
      })),
      stock: product.stock,
      attributes: {
        colors: product.colors,
        sizes: product.sizes
      }
    });
  } catch (error: any) {
    console.error('Get Product Detail Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
};
