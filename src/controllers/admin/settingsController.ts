import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SiteSettings from '@/models/SiteSettings';
import Brand from '@/models/Brand';
import FAQ from '@/models/FAQ';
import GlobalReview from '@/models/GlobalReview';
import { secureResponse, errorResponse } from '@/lib/apiResponse';

export const getSiteSettings = async () => {
  try {
    await dbConnect();
    const settings = await SiteSettings.findOne({});
    return secureResponse(settings);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
};

export const updateSiteSettings = async (req: Request) => {
  try {
    await dbConnect();
    const body = await req.json();
    let settings = await SiteSettings.findOne({});
    if (settings) {
      settings = await SiteSettings.findByIdAndUpdate(settings._id, body, { new: true });
    } else {
      settings = await SiteSettings.create(body);
    }
    return secureResponse({ success: true, settings });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
};

export const getBrands = async () => {
  try {
    await dbConnect();
    const brands = await Brand.find({ isActive: true });
    return secureResponse(brands);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
};

export const getFAQs = async () => {
  try {
    await dbConnect();
    const faqs = await FAQ.find({ isActive: true }).sort('order');
    return secureResponse(faqs);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
};

export const getGlobalReviews = async () => {
  try {
    await dbConnect();
    const reviews = await GlobalReview.find({ isActive: true });
    return secureResponse(reviews);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
};
