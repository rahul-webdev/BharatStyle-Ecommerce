"use client";

import { useState, useEffect } from "react";
import ProductListSec from "@/components/common/ProductListSec";
import BreadcrumbProduct from "@/components/product-page/BreadcrumbProduct";
import Header from "@/components/product-page/Header";
import Tabs from "@/components/product-page/Tabs";
import { notFound } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function ProductPage({
  params,
}: {
  params: { slug: string[] };
}) {
  const [productData, setProductData] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // The slug parameter is likely the product slug, not ID anymore
  const productSlug = params.slug[params.slug.length - 1];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Using the slug to fetch product details
        const data = await apiRequest(`/api/products/${productSlug}`);
        
        if (!data) {
          notFound();
          return;
        }

        setProductData(data);

        // Fetch related products (e.g., from same category)
        const related = await apiRequest(`/api/products?limit=4`);
        setRelatedProducts(related.products.map((p: any) => ({
          id: p._id,
          title: p.name,
          srcUrl: p.images[0],
          price: p.price,
          discount: {
            percentage: p.discountPrice ? Math.round((1 - p.discountPrice / p.price) * 100) : 0,
            amount: 0
          },
          rating: p.ratings
        })));
      } catch (error) {
        console.error("Failed to fetch product detail", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productSlug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!productData) {
    notFound();
  }

  return (
    <main>
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <BreadcrumbProduct title={productData?.title ?? "product"} />
        <section className="mb-11">
          <Header data={productData} />
        </section>
        <Tabs />
      </div>
      <div className="mb-[50px] sm:mb-20">
        <ProductListSec title="You might also like" data={relatedProducts} />
      </div>
    </main>
  );
}
