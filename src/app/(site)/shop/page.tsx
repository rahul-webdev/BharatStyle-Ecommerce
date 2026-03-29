"use client";

import { useState, useEffect } from "react";
import BreadcrumbShop from "@/components/shop-page/BreadcrumbShop";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MobileFilters from "@/components/shop-page/filters/MobileFilters";
import Filters from "@/components/shop-page/filters";
import { FiSliders } from "react-icons/fi";
import ProductCard from "@/components/common/ProductCard";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { apiRequest } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<{ title: string; slug: string }[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(0);

  const router = useRouter();
  const searchParams = useSearchParams();

  const category = searchParams.get("category") || undefined;
  const color = searchParams.get("color") || undefined;
  const size = searchParams.get("size") || undefined;
  const sortParam = searchParams.get("sort") || "-createdAt";
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const currentPageParam = parseInt(searchParams.get("page") || "1");
  const onSale = searchParams.get("onSale") === "true";
  const searchText = searchParams.get("search") || undefined;

  useEffect(() => {
    setPage(currentPageParam);
  }, [currentPageParam]);

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await apiRequest(`/api/categories`);
      setCategories(data.map((c: any) => ({ title: c.title, slug: c.slug })));
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "9");
        if (category) params.set("category", category);
        if (color) params.set("color", color);
        if (size) params.set("size", size);
        if (minPrice) params.set("minPrice", minPrice);
        if (maxPrice) params.set("maxPrice", maxPrice);
        if (sortParam) params.set("sort", sortParam);
        if (onSale) params.set("onSale", "true");
        if (searchText) params.set("search", searchText);
        const data = await apiRequest(`/api/products?${params.toString()}`);
        setProducts(data.products.map((p: any) => ({
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
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setAvailableColors(data.availableColors || []);
        setAvailableSizes(data.availableSizes || []);
        if (data.priceRange) {
          setPriceMin(data.priceRange.min || 0);
          setPriceMax(data.priceRange.max || 0);
        }
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [page, category, color, size, sortParam, minPrice, maxPrice]);

  const uiSortValue = (() => {
    if (sortParam === "price") return "low-price";
    if (sortParam === "-price") return "high-price";
    return "most-popular";
  })();

  const updateParam = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value.length > 0) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    router.push(`/shop?${params.toString()}`);
  };

  const applyPrice = (range: [number, number]) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("minPrice", String(range[0]));
    params.set("maxPrice", String(range[1]));
    params.set("page", "1");
    router.push(`/shop?${params.toString()}`);
  };

  useEffect(() => {
    const applyAnchor = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "on-sale") {
        const params = new URLSearchParams(searchParams.toString());
        params.set("onSale", "true");
        params.set("page", "1");
        router.push(`/shop?${params.toString()}`);
      } else if (hash === "new-arrivals") {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", "-createdAt");
        params.delete("onSale");
        params.set("page", "1");
        router.push(`/shop?${params.toString()}`);
      } else if (hash === "top-selling") {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", "-numReviews");
        params.delete("onSale");
        params.set("page", "1");
        router.push(`/shop?${params.toString()}`);
      }
    };
    applyAnchor();
    const handler = () => applyAnchor();
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, [router, searchParams]);

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <BreadcrumbShop />
        <div className="flex md:space-x-5 items-start">
          <div className="hidden md:block min-w-[295px] max-w-[295px] border border-black/10 rounded-[20px] px-5 md:px-6 py-5 space-y-5 md:space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-bold text-black text-xl">Filters</span>
              <FiSliders className="text-2xl text-black/40" />
            </div>
            <Filters
              categories={categories}
              selectedCategory={category}
              colors={availableColors}
              selectedColor={color}
              sizes={availableSizes}
              selectedSize={size}
              priceMin={priceMin}
              priceMax={priceMax}
              selectedMin={minPrice ? parseFloat(minPrice) : undefined}
              selectedMax={maxPrice ? parseFloat(maxPrice) : undefined}
              onSelectCategory={(slug) => updateParam("category", slug)}
              onSelectColor={(c) => updateParam("color", c)}
              onSelectSize={(s) => updateParam("size", s)}
              onApplyPrice={applyPrice}
            />
          </div>
          <div className="flex flex-col w-full space-y-5">
            <div className="flex flex-col lg:flex-row lg:justify-between">
              <div className="flex items-center justify-between">
                <h1 className="font-bold text-2xl md:text-[32px]">Shop</h1>
                <MobileFilters
                  categories={categories}
                  selectedCategory={category}
                  colors={availableColors}
                  selectedColor={color}
                  sizes={availableSizes}
                  selectedSize={size}
                  priceMin={priceMin}
                  priceMax={priceMax}
                  selectedMin={minPrice ? parseFloat(minPrice) : undefined}
                  selectedMax={maxPrice ? parseFloat(maxPrice) : undefined}
                  onSelectCategory={(slug) => updateParam("category", slug)}
                  onSelectColor={(c) => updateParam("color", c)}
                  onSelectSize={(s) => updateParam("size", s)}
                  onApplyPrice={applyPrice}
                />
              </div>
              <div className="flex flex-col sm:items-center sm:flex-row">
                <span className="text-sm md:text-base text-black/60 mr-3">
                  Showing {(page - 1) * 9 + 1}-{Math.min(page * 9, total)} of {total} Products
                </span>
                <div className="flex items-center">
                  Sort by:{" "}
                  <Select
                    defaultValue={uiSortValue}
                    onValueChange={(val) => {
                      if (val === "low-price") updateParam("sort", "price");
                      else if (val === "high-price") updateParam("sort", "-price");
                      else updateParam("sort", "-createdAt");
                    }}
                  >
                    <SelectTrigger className="font-medium text-sm px-1.5 sm:text-base w-fit text-black bg-transparent shadow-none border-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="most-popular">Most Popular</SelectItem>
                      <SelectItem value="low-price">Low Price</SelectItem>
                      <SelectItem value="high-price">High Price</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : (
              <div className="w-full grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                {products.map((product) => (
                  <ProductCard key={product.id} data={product} />
                ))}
              </div>
            )}

            <hr className="border-t-black/10" />
            <Pagination className="justify-between">
              <PaginationPrevious 
                href="#" 
                onClick={(e) => { e.preventDefault(); if (page > 1) router.push(`/shop?${new URLSearchParams({...Object.fromEntries(searchParams.entries()), page: String(page - 1)}).toString()}`); }} 
                className={cn("border border-black/10", page <= 1 && "pointer-events-none opacity-50")} 
              />
              <PaginationContent>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <PaginationItem key={p} className={cn(Math.abs(p - page) > 1 && p !== 1 && p !== totalPages && "hidden")}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => { e.preventDefault(); router.push(`/shop?${new URLSearchParams({...Object.fromEntries(searchParams.entries()), page: String(p)}).toString()}`); }}
                      className={cn("text-black/50 font-medium text-sm", p === page && "text-black border border-black/10")}
                      isActive={p === page}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}
              </PaginationContent>
              <PaginationNext 
                href="#" 
                onClick={(e) => { e.preventDefault(); if (page < totalPages) router.push(`/shop?${new URLSearchParams({...Object.fromEntries(searchParams.entries()), page: String(page + 1)}).toString()}`); }} 
                className={cn("border border-black/10", page >= totalPages && "pointer-events-none opacity-50")} 
              />
            </Pagination>
          </div>
        </div>
      </div>
    </main>
  );
}
