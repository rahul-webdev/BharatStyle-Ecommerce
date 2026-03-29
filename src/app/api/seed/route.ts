import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';
import Product from '@/models/Product';
import User from '@/models/User';
import SiteSettings from '@/models/SiteSettings';
import Brand from '@/models/Brand';
import FAQ from '@/models/FAQ';
import GlobalReview from '@/models/GlobalReview';
import Order from '@/models/Order';

import bcrypt from 'bcryptjs';
import indexData from '@/data/index.json';
import { customers as siteCustomers } from '@/data/siteData';

export const GET = async () => {
  try {
    await dbConnect();

    // 1. Clear existing data sequentially to ensure indexes are ready
    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    await SiteSettings.deleteMany({});
    await Brand.deleteMany({});
    await FAQ.deleteMany({});
    await GlobalReview.deleteMany({});
    await Order.deleteMany({});

    console.log('Database cleared');

    // 2. Seed Parent and Child Categories
    const parents = [
      { name: "Men's Clothes", slug: "men-clothes", description: "Men fashion collections", isFeatured: true },
      { name: "Women's Clothes", slug: "women-clothes", description: "Women fashion collections", isFeatured: true },
      { name: "Kids Clothes", slug: "kids-clothes", description: "Kids fashion collections", isFeatured: true },
      { name: "Bags and Shoes", slug: "bag-shoes", description: "Bags and Shoes", isFeatured: false },
    ];
    await Category.insertMany(parents, { ordered: false }).catch(() => {});
    const parentDocs = await Category.find({ slug: { $in: parents.map(p => p.slug) } });

    const baseChildren = indexData.categories.map((cat: any) => ({
      name: cat.title,
      baseSlug: cat.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
      description: `Collection of ${cat.title}`,
    }));

    const childDocsPayload: any[] = [];
    for (const parent of parentDocs) {
      for (const child of baseChildren) {
        childDocsPayload.push({
          name: child.name,
          slug: `${parent.slug}-${child.baseSlug}`,
          description: child.description,
          parent: parent._id,
        });
      }
    }
    await Category.insertMany(childDocsPayload, { ordered: false }).catch(() => {});

    let createdCategories = await Category.find({});
    console.log(`${createdCategories.length} Categories seeded`);

    // Helper to find category ID
    const getCategoryId = (title: string) => {
      const lowerTitle = title.toLowerCase();
      const menChild = createdCategories.find(c => c.slug.startsWith('men-clothes-') && c.slug.includes(lowerTitle.replace(/ /g, '-').replace(/[^\w-]+/g, '').replace(/s$/, '')));
      if (menChild) return menChild._id;
      let match = createdCategories.find(c => lowerTitle.includes(c.name.toLowerCase().replace(/s$/, '')));
      if (!match) match = createdCategories[0];
      return match._id;
    };

    // 3. Seed Products from index.json
    const allRawProducts = [
      ...indexData.newArrivals,
      ...indexData.topSelling,
      ...indexData.relatedProducts,
    ];

    // Remove duplicates by title
    const uniqueRawProducts = Array.from(new Map(allRawProducts.map(p => [p.title, p])).values());

    const productsToSeed = uniqueRawProducts.map((p: any) => {
      const price = p.price;
      const discountPercentage = p.discount?.percentage || 0;
      const discountPrice = discountPercentage > 0 ? Math.round(price * (1 - discountPercentage / 100)) : 0;

      return {
        name: p.title,
        slug: p.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        description: `${p.title} - Premium quality item from ${indexData.siteConfig.name}.`,
        price,
        discountPrice,
        images: p.gallery || [p.srcUrl],
        category: getCategoryId(p.title),
        stock: 50,
        ratings: p.rating || 0,
        numReviews: Math.floor(Math.random() * 50) + 5,
        isFeatured: true,
        colors: ["#000000", "#FFFFFF", "#4F4631"],
        sizes: ["S", "M", "L", "XL"],
        reviews: [], // Will be empty for now
      };
    });

    let createdProducts;
    try {
      createdProducts = await Product.insertMany(productsToSeed, { ordered: false });
    } catch (err: any) {
      createdProducts = await Product.find({});
    }
    console.log(`${createdProducts.length} Products seeded`);

    // 4. Seed Users (Admin + Customers from siteData.ts)
    const hashedPassword = await bcrypt.hash('adminpassword123', 12);
    const adminUser = {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
    };

    const customersToSeed = siteCustomers.map((c: any) => {
      const digits = typeof c.phone === 'string' ? c.phone.replace(/\D/g, '') : '';
      const normalizedPhone = digits.length >= 10 ? digits.slice(-10) : undefined;
      return {
        name: c.name,
        email: c.email,
        ...(normalizedPhone ? { phone: normalizedPhone } : {}),
        role: 'user',
        isVerified: true,
        address: {
          street: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India',
        },
      };
    });

    let createdUsers;
    try {
      // Use insertMany with ordered:false to ensure admin is inserted even if some customers fail validation
      await User.insertMany([adminUser, ...customersToSeed], { ordered: false });
      createdUsers = await User.find({});
    } catch (err: any) {
      createdUsers = await User.find({});
    }
    console.log(`${createdUsers.length} Users seeded`);

    // 5. Seed Site Settings from index.json
    try {
      await SiteSettings.create({
        siteName: indexData.siteConfig.name,
        siteDescription: indexData.siteConfig.description,
        contact: indexData.siteConfig.contact,
        socialLinks: indexData.siteConfig.socialLinks,
        currency: indexData.siteConfig.currency,
        footerLinks: indexData.footerLinks,
        paymentBadges: indexData.paymentBadges,
      });
    } catch (err: any) {}
    console.log('Site Settings seeded');

    // 6. Seed Brands from index.json
    const brandsToSeed = indexData.brands.map((b: any) => ({
      id: b.id,
      name: b.id.charAt(0).toUpperCase() + b.id.slice(1),
      srcUrl: b.srcUrl,
      isActive: true,
    }));
    try {
      await Brand.insertMany(brandsToSeed, { ordered: false });
    } catch (err: any) {}
    console.log(`${brandsToSeed.length} Brands seeded`);

    // 7. Seed FAQs from index.json
    const faqsToSeed = indexData.faqs.map((f: any, idx: number) => ({
      question: f.question,
      answer: f.answer,
      isActive: true,
      order: idx,
    }));
    try {
      await FAQ.insertMany(faqsToSeed, { ordered: false });
    } catch (err: any) {}
    console.log(`${faqsToSeed.length} FAQs seeded`);

    // 8. Seed Global Reviews from index.json
    const reviewsToSeed = indexData.reviews.map((r: any) => ({
      user: r.user,
      content: r.content,
      rating: r.rating,
      date: r.date,
      isActive: true,
    }));
    try {
      await GlobalReview.insertMany(reviewsToSeed, { ordered: false });
    } catch (err: any) {}
    console.log(`${reviewsToSeed.length} Global Reviews seeded`);

    // 9. Seed Orders from index.json
    const firstUser = createdUsers.find(u => u.role === 'user');
    const firstProduct = createdProducts[0];

    const ordersToSeed = indexData.orders.map((o: any) => ({
      user: firstUser?._id,
      orderItems: o.items.map((item: any) => ({
        name: item.name,
        qty: item.quantity,
        image: item.image,
        price: item.price,
        product: firstProduct._id, // Placeholder link
      })),
      shippingAddress: {
        address: o.shippingAddress,
        city: 'Mumbai',
        postalCode: '400001',
        country: 'India',
      },
      paymentMethod: o.paymentMethod,
      totalPrice: o.total,
      isPaid: true,
      paidAt: new Date(o.date),
      isDelivered: o.status === 'delivered',
      deliveredAt: o.status === 'delivered' ? new Date(o.date) : undefined,
    }));

    try {
      await Order.insertMany(ordersToSeed, { ordered: false });
    } catch (err: any) {}
    console.log(`${ordersToSeed.length} Orders seeded`);

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully with all static data!',
      counts: {
        categories: createdCategories.length,
        products: createdProducts.length,
        users: createdUsers.length,
        brands: brandsToSeed.length,
        faqs: faqsToSeed.length,
        reviews: reviewsToSeed.length,
        orders: ordersToSeed.length,
      },
    });
  } catch (error: any) {
    console.error('Seeding Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
};
