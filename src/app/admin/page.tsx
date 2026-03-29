"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatsCard } from "@/components/admin/StatsCard";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { 
  ShoppingCart, 
  IndianRupee, 
  Users, 
  Package,
  Loader2,
  ArrowUpRight,
  TrendingUp,
  Clock
} from "lucide-react";
import { formatCurrency } from "@/data/siteData";
import { apiRequest } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, ordersData, productsData] = await Promise.all([
          apiRequest('/api/admin/stats'),
          apiRequest('/api/admin/orders'),
          apiRequest('/api/admin/products?limit=5')
        ]);

        setStats(statsData);
        setRecentOrders(ordersData.slice(0, 5));
        setTopProducts(productsData.products);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const orderColumns = [
    { 
      key: "_id", 
      header: "Order ID", 
      render: (order: any) => (
        <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">#{order._id.slice(-8)}</span>
      )
    },
    { 
      key: "createdAt", 
      header: "Time",
      render: (order: any) => (
        <div className="flex items-center text-[11px] font-medium">
          <Clock className="w-3 h-3 mr-1 opacity-40" />
          {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
        </div>
      )
    },
    { 
      key: "status", 
      header: "Status",
      render: (order: any) => <StatusBadge status={order.isDelivered ? "delivered" : "pending"} />
    },
    { 
      key: "totalPrice", 
      header: "Amount",
      className: "text-right",
      render: (order: any) => (
        <span className="font-black text-xs">{formatCurrency(order.totalPrice)}</span>
      )
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-black uppercase tracking-widest animate-pulse">Analyzing Store Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Performance Dashboard" 
          description="Real-time analytics and store health overview"
        />
        <div className="hidden md:flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live System Status
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Gross Revenue"
          value={formatCurrency(stats?.totalSales || 0)}
          change="+12.5%"
          changeType="positive"
          icon={IndianRupee}
        />
        <StatsCard
          title="Total Orders"
          value={(stats?.totalOrders || 0).toString()}
          change="Updated"
          changeType="neutral"
          icon={ShoppingCart}
        />
        <StatsCard
          title="Customer Base"
          value={(stats?.totalCustomers || 0).toString()}
          change="+3 new"
          changeType="positive"
          icon={Users}
        />
        <StatsCard
          title="Live Inventory"
          value={(stats?.activeProducts || 0).toString()}
          change="Active"
          changeType="neutral"
          icon={Package}
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Recent Transactions</h2>
            <button className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1 hover:underline">
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
            <DataTable
              columns={orderColumns}
              data={recentOrders}
              keyExtractor={(order) => order._id}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Hot Inventory</h2>
            <TrendingUp className="w-3 h-3 text-primary" />
          </div>
          <div className="bg-card rounded-2xl border shadow-sm divide-y">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center p-4 gap-4 group hover:bg-muted/30 transition-colors">
                <div className="relative w-12 h-12 flex-shrink-0 rounded-xl overflow-hidden border bg-white p-1">
                  <img 
                    src={product.images[0]} 
                    alt={product.name} 
                    className="w-full h-full object-cover rounded-lg" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{product.name}</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{product.category?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black">{formatCurrency(product.price)}</p>
                  <p className={cn(
                    "text-[10px] font-bold uppercase",
                    product.stock < 10 ? "text-red-500" : "text-green-600"
                  )}>{product.stock} left</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
