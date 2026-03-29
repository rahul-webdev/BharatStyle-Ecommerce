"use client";

import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import Link from "next/link";
import React from "react";
import { NavMenu } from "../navbar.types";
import { MenuList } from "./MenuList";
import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { MenuItem } from "./MenuItem";
import Image from "next/image";
import InputGroup from "@/components/ui/input-group";
import ResTopNavbar from "./ResTopNavbar";
import CartBtn from "./CartBtn";
import UserMenu from "./UserMenu";
import { siteConfig as fallbackConfig } from "@/lib/config";
import { apiRequest } from "@/lib/api";
import { useRouter } from "next/navigation";

const TopNavbar = () => {
  const [navData, setNavData] = React.useState<any[]>([]);
  const [siteName, setSiteName] = React.useState(fallbackConfig.name);
  const [searchText, setSearchText] = React.useState("");
  const router = useRouter();

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await apiRequest('/api/settings');
        const featuredCategories = await apiRequest('/api/categories?featured=true');
        const childrenLists = Array.isArray(featuredCategories)
          ? await Promise.all(
              featuredCategories.map((c: any) =>
                apiRequest(`/api/categories?parent=${c.slug}`).catch(() => [])
              )
            )
          : [];
        if (settings) {
          const featuredItems =
            Array.isArray(featuredCategories) && featuredCategories.length > 0
              ? featuredCategories.map((c: any, idx: number) => {
                  const children = Array.isArray(childrenLists[idx])
                    ? childrenLists[idx]
                    : [];
                  if (children.length > 0) {
                    return {
                      id: 9000 + idx,
                      type: 'MenuList',
                      label: c.title,
                      children: children.map((child: any, i: number) => ({
                        id: 9100 + i,
                        label: child.title,
                        url: `/shop?category=${child.slug}`,
                        description: child.description || '',
                      })),
                    };
                  }
                  return {
                    id: 9200 + idx,
                    type: 'MenuItem',
                    label: c.title,
                    url: `/shop?category=${c.slug}`,
                    children: [],
                  };
                })
              : [];
          setNavData([...featuredItems]);
          setSiteName(settings.siteName || fallbackConfig.name);
        }
      } catch (error) {
        console.error("Failed to fetch settings", error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <nav className="sticky top-0 bg-white z-20">
      <div className="flex relative max-w-frame mx-auto items-center justify-between md:justify-start py-5 md:py-6 px-4 xl:px-0">
        <div className="flex items-center">
          <div className="block md:hidden mr-4">
            <ResTopNavbar data={navData} siteName={siteName} />
          </div>
          <Link
            href="/"
            className={cn([
              integralCF.className,
              "text-2xl lg:text-[32px] mb-2 mr-3 lg:mr-10",
            ])}
          >
            {siteName}
          </Link>
        </div>
        <NavigationMenu className="hidden md:flex mr-2 lg:mr-7">
          <NavigationMenuList>
            {navData.map((item:any) => (
              <React.Fragment key={item.id}>
                {item.type === "MenuItem" && (
                  <MenuItem label={item.label} url={item.url} />
                )}
                {item.type === "MenuList" && (
                  <MenuList data={item.children} label={item.label} />
                )}
              </React.Fragment>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        <InputGroup className="hidden md:flex bg-[#F0F0F0] mr-3 lg:mr-10">
          <button
            type="button"
            onClick={() => {
              if (searchText.trim().length > 0) {
                router.push(`/shop?search=${encodeURIComponent(searchText.trim())}`);
              }
            }}
          >
            <InputGroup.Text>
              <Image
                priority
                src="/icons/search.svg"
                height={20}
                width={20}
                alt="search"
                className="min-w-5 min-h-5"
              />
            </InputGroup.Text>
          </button>
          <InputGroup.Input
            type="search"
            name="search"
            placeholder="Search for products..."
            className="bg-transparent placeholder:text-black/40"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchText.trim().length > 0) {
                router.push(`/shop?search=${encodeURIComponent(searchText.trim())}`);
              }
            }}
          />
        </InputGroup>
        <div className="flex items-center">
          <Link href="/search" className="block md:hidden mr-[14px] p-1">
            <Image
              priority
              src="/icons/search-black.svg"
              height={100}
              width={100}
              alt="search"
              className="max-w-[22px] max-h-[22px]"
            />
          </Link>
          <CartBtn />
          <UserMenu />
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;
