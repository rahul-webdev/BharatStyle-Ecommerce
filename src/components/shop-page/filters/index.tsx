import React from "react";
import CategoriesSection from "@/components/shop-page/filters/CategoriesSection";
import ColorsSection from "@/components/shop-page/filters/ColorsSection";
import DressStyleSection from "@/components/shop-page/filters/DressStyleSection";
import PriceSection from "@/components/shop-page/filters/PriceSection";
import SizeSection from "@/components/shop-page/filters/SizeSection";
import { Button } from "@/components/ui/button";

type FiltersProps = {
  categories: { title: string; slug: string }[];
  selectedCategory?: string;
  colors: string[];
  selectedColor?: string;
  sizes: string[];
  selectedSize?: string;
  priceMin: number;
  priceMax: number;
  selectedMin?: number;
  selectedMax?: number;
  onSelectCategory: (slug: string) => void;
  onSelectColor: (color: string) => void;
  onSelectSize: (size: string) => void;
  onApplyPrice: (range: [number, number]) => void;
};

const Filters = ({
  categories,
  selectedCategory,
  colors,
  selectedColor,
  sizes,
  selectedSize,
  priceMin,
  priceMax,
  selectedMin,
  selectedMax,
  onSelectCategory,
  onSelectColor,
  onSelectSize,
  onApplyPrice,
}: FiltersProps) => {
  const [priceRange, setPriceRange] = React.useState<[number, number]>([
    selectedMin ?? priceMin,
    selectedMax ?? priceMax,
  ]);

  return (
    <>
      <hr className="border-t-black/10" />
      <CategoriesSection
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
      />
      <hr className="border-t-black/10" />
      <PriceSection
        min={priceMin}
        max={priceMax}
        defaultValue={priceRange}
        onChange={setPriceRange}
      />
      <hr className="border-t-black/10" />
      <ColorsSection
        colors={colors}
        selectedColor={selectedColor}
        onSelectColor={onSelectColor}
      />
      <hr className="border-t-black/10" />
      <SizeSection
        sizes={sizes}
        selectedSize={selectedSize}
        onSelectSize={onSelectSize}
      />
      <hr className="border-t-black/10" />
      <DressStyleSection />
      <Button
        type="button"
        className="bg-black w-full rounded-full text-sm font-medium py-4 h-12"
        onClick={() => onApplyPrice(priceRange)}
      >
        Apply Filter
      </Button>
    </>
  );
};

export default Filters;
