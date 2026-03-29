import { siteConfig } from "@/lib/config";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";

type Props = {
  min: number;
  max: number;
  defaultValue: [number, number];
  onChange: (values: [number, number]) => void;
};

const PriceSection = ({ min, max, defaultValue, onChange }: Props) => {
  return (
    <Accordion type="single" collapsible defaultValue="filter-price">
      <AccordionItem value="filter-price" className="border-none">
        <AccordionTrigger className="text-black font-bold text-xl hover:no-underline p-0 py-0.5">
          Price
        </AccordionTrigger>
        <AccordionContent className="pt-4" contentClassName="overflow-visible">
          <Slider
            defaultValue={defaultValue}
            min={min}
            max={max}
            step={100}
            label={siteConfig.currency.symbol}
            onChange={onChange}
          />
          <div className="mb-3" />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default PriceSection;
