"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FolderTree, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  Menu,
  X,
  LogOut
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/data/siteData";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/api";

const navItems = [
  { label: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { label: "Categories", url: "/admin/categories", icon: FolderTree },
  { label: "Products", url: "/admin/products", icon: Package },
  { label: "Orders", url: "/admin/orders", icon: ShoppingCart },
  { label: "Customers", url: "/admin/customers", icon: Users },
  { label: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [siteName, setSiteName] = useState(siteConfig.name);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await apiRequest('/api/settings');
        if (settings?.siteName) {
          setSiteName(settings.siteName);
        }
      } catch (error) {
        console.error("Failed to fetch admin settings", error);
      }
    };
    fetchSettings();
  }, []);

  const handleLogout = () => {
    document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    router.push("/admin/login");
  };

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-3 left-3 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:sticky top-0 left-0 z-40 h-screen w-52 bg-background border-r border-border transform transition-transform duration-200 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-12 flex items-center px-4 border-b border-border">
            <span className="font-semibold text-sm tracking-tight">{siteName}</span>
            <span className="ml-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded bg-foreground text-background">
              Admin
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.url;
              return (
                <Link
                  key={item.url}
                  href={item.url}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded transition-colors text-sm",
                    isActive 
                      ? "bg-muted text-foreground font-medium" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-border space-y-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded transition-colors text-sm text-red-500 hover:bg-red-50 font-medium"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
            <div className="text-[10px] text-muted-foreground px-2.5">
              v1.0.0
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
