"use client";

import { useAppSelector } from "@/lib/hooks/redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Order } from "@/types/order.types";
import { cn, formatCurrency } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import Image from "next/image";
import { apiRequest } from "@/lib/api";

export default function OrdersPage() {
  const { isLoggedIn, user } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/auth");
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const qs = user?.mobile ? `?mobile=${encodeURIComponent(user.mobile)}` : "";
        const data = await apiRequest(`/api/orders${qs}`);
        setOrders(data);
      } catch (e) {
        // Fallback: no orders or error
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    if (isLoggedIn) fetchOrders();
  }, [isLoggedIn, user?.mobile]);

  if (!isLoggedIn) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "delivered":
        return "bg-green-100 text-green-700 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <main className="max-w-frame mx-auto px-4 py-10">
      <h1 className={cn(integralCF.className, "text-3xl font-bold mb-8")}>
        My Orders
      </h1>
      
      <div className="space-y-4">
        {!loading && orders.length === 0 && (
          <div className="text-sm text-gray-600">No orders yet.</div>
        )}
        {orders.map((order: any) => (
          <Link 
            href={`/orders/${order._id}`} 
            key={order._id}
            className="block bg-white border border-gray-200 rounded-xl p-4 md:p-6 hover:border-black transition-colors"
          >
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
               <div>
                 <p className="text-sm text-gray-500 mb-1">Order ID: <span className="font-medium text-black">{String(order._id).slice(-12)}</span></p>
                 <p className="text-sm text-gray-500">Placed on: <span className="text-black">{new Date(order.createdAt).toLocaleDateString()}</span></p>
               </div>
                <div className="flex items-center justify-between md:justify-end gap-4">
                  <span className={cn("px-3 py-1 rounded-full text-xs font-medium border capitalize", getStatusColor(order.status || (order.isDelivered ? "delivered" : "pending")))}>
                    {order.status || (order.isDelivered ? "delivered" : "pending")}
                  </span>
                  <p className="font-bold text-lg">{formatCurrency(order.totalPrice)}</p>
               </div>
            </div>
            
            <div className="border-t pt-4">
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {order.orderItems.map((item: any, idx: number) => (
                        <div key={idx} className="min-w-[60px] w-[60px] h-[60px] relative rounded-md overflow-hidden bg-gray-100 border border-gray-100">
                             <Image 
                                src={item.image} 
                                alt={item.name} 
                                fill
                                className="object-cover"
                             />
                        </div>
                    ))}
                    {order.orderItems.length > 3 && (
                        <div className="min-w-[60px] w-[60px] h-[60px] flex items-center justify-center bg-gray-50 rounded-md text-xs text-gray-500 font-medium">
                            +{order.orderItems.length - 3} more
                        </div>
                    )}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                    {order.orderItems.length} item{order.orderItems.length > 1 ? 's' : ''}
                </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
