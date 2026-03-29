"use client";

import { useState, useEffect } from "react";
import ProductListSec from "@/components/common/ProductListSec";
import Brands from "@/components/homepage/Brands";
import DressStyle from "@/components/homepage/DressStyle";
import Header from "@/components/homepage/Header";
import Reviews from "@/components/homepage/Reviews";
import { apiRequest } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [topSelling, setTopSelling] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Optimized using Batch API
        const batchResponse = await apiRequest('/api/batch', {
          method: 'POST',
          body: {
            requests: [
              { endpoint: '/api/products', params: { limit: '4', sort: '-createdAt' } },
              { endpoint: '/api/products', params: { limit: '4', sort: '-ratings' } },
              { endpoint: '/api/reviews/global' }
            ]
          }
        });

        const results = batchResponse.results;
        const newArrivalsData = results.find((r: any) => r.endpoint === '/api/products' && r.params?.sort === '-createdAt')?.data || results[0].data;
        const topSellingData = results.find((r: any) => r.endpoint === '/api/products' && r.params?.sort === '-ratings')?.data || results[1].data;
        const reviewsData = results.find((r: any) => r.endpoint === '/api/reviews/global')?.data || results[2].data;

        setNewArrivals(newArrivalsData.products.map((p: any) => ({
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

        setTopSelling(topSellingData.products.map((p: any) => ({
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

        setReviews(reviewsData);
      } catch (error) {
        console.error("Failed to fetch home data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <Brands />
      <main className="my-[50px] sm:my-[72px]">
        <ProductListSec
          title="NEW ARRIVALS"
          data={newArrivals}
          viewAllLink="/shop#new-arrivals"
        />
        <div className="max-w-frame mx-auto px-4 xl:px-0">
          <hr className="h-[1px] border-t-black/10 my-10 sm:my-16" />
        </div>
        <div className="mb-[50px] sm:mb-20">
          <ProductListSec
            title="top selling"
            data={topSelling}
            viewAllLink="/shop#top-selling"
          />
        </div>
        <div className="mb-[50px] sm:mb-20">
          <DressStyle />
        </div>
        <Reviews data={reviews} />
      </main>
    </>
  );
}
