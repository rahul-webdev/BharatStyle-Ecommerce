import React from "react";
import { MdKeyboardArrowRight } from "react-icons/md";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

type Category = { title: string; slug: string };

type Props = {
  categories: Category[];
  selectedCategory?: string;
  onSelectCategory: (slug: string) => void;
};

const CategoriesSection = ({ categories, selectedCategory, onSelectCategory }: Props) => {
  const [allCategories, setAllCategories] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchAll = async () => {
      try {
        const data = await apiRequest('/api/categories');
        setAllCategories(data || []);
      } catch {}
    };
    fetchAll();
  }, []);

  const parents = allCategories.filter((c) => !c.parent);
  const childrenByParent = (parentId: string) =>
    allCategories.filter((c) => String(c.parent || "") === String(parentId));

  return (
    <div className="flex flex-col space-y-0.5 text-black/60">
      {parents.length > 0
        ? parents.map((parent) => (
            <div key={parent.id} className="py-1">
              <button
                type="button"
                className="flex items-center justify-between py-2 font-medium text-black"
                onClick={() => onSelectCategory(parent.slug)}
              >
                <span className={selectedCategory === parent.slug ? "font-semibold" : ""}>
                  {parent.title}
                </span>
                <MdKeyboardArrowRight />
              </button>
              <div className="pl-3 border-l border-black/10">
                {childrenByParent(parent.id).map((child) => (
                  <button
                    key={child.id}
                    type="button"
                    className="flex items-center justify-between py-2"
                    onClick={() => onSelectCategory(child.slug)}
                  >
                    <span className={selectedCategory === child.slug ? "font-medium text-black" : ""}>
                      {child.title}
                    </span>
                    <MdKeyboardArrowRight />
                  </button>
                ))}
              </div>
            </div>
          ))
        : categories.map((category, idx) => (
            <button
              key={idx}
              type="button"
              className="flex items-center justify-between py-2"
              onClick={() => onSelectCategory(category.slug)}
            >
              <span className={selectedCategory === category.slug ? "font-medium text-black" : ""}>
                {category.title}
              </span>
              <MdKeyboardArrowRight />
            </button>
          ))}
    </div>
  );
};

export default CategoriesSection;
