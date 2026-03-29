"use client";

import { useAppSelector } from "@/lib/hooks/redux";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import data from "@/data/index.json";
import { Order, OrderItem } from "@/types/order.types";
import { cn, formatCurrency } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Rating from "@/components/ui/Rating";

export default function OrderDetailPage() {
  const { isLoggedIn } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/auth");
      return;
    }

    if (params.id) {
      const foundOrder = (data.orders as Order[]).find((o) => o.id === params.id);
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        // Handle not found
      }
    }
  }, [isLoggedIn, router, params.id]);

  if (!isLoggedIn || !order) return null;

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

  const handleCancelOrder = () => {
    if (confirm("Are you sure you want to cancel this order?")) {
      setOrder({ ...order, status: "cancelled" });
      alert("Order cancelled successfully");
    }
  };

  const openReviewModal = (item: OrderItem) => {
    setSelectedItem(item);
    setReviewRating(0);
    setReviewText("");
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = () => {
    // In a real app, you would send this to the backend
    console.log("Submitting review:", {
      itemId: selectedItem?.id,
      rating: reviewRating,
      text: reviewText,
    });
    alert("Review submitted successfully!");
    setIsReviewModalOpen(false);
  };

  return (
    <main className="max-w-frame mx-auto px-4 py-10">
       <div className="mb-6">
          <Link href="/orders" className="text-sm text-gray-500 hover:text-black flex items-center gap-1">
             ← Back to Orders
          </Link>
       </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
           <h1 className={cn(integralCF.className, "text-3xl font-bold mb-2")}>
            Order Details
          </h1>
          <p className="text-gray-500">Order ID: <span className="font-medium text-black">{order.id}</span> • {order.date}</p>
        </div>
        <div className="flex items-center gap-4">
            <span className={cn("px-4 py-2 rounded-full text-sm font-medium border capitalize", getStatusColor(order.status))}>
                {order.status}
            </span>
            {order.status === "pending" && (
                <Button variant="destructive" onClick={handleCancelOrder}>
                    Cancel Order
                </Button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-6">
             <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                   <h2 className="font-bold">Items in your order</h2>
                </div>
                <div className="divide-y divide-gray-100">
                   {order.items.map((item) => (
                      <div key={item.id} className="p-6 flex flex-col md:flex-row gap-4">
                         <div className="min-w-[80px] w-[80px] h-[80px] relative rounded-md overflow-hidden bg-gray-100 border border-gray-100">
                             <Image 
                                src={item.image} 
                                alt={item.name} 
                                fill
                                className="object-cover"
                             />
                        </div>
                        <div className="flex-1">
                           <h3 className="font-bold mb-1">{item.name}</h3>
                           <p className="text-sm text-gray-500 mb-2">Quantity: {item.quantity}</p>
                           <p className="font-bold mb-3">{formatCurrency(item.price)}</p>
                           
                           {order.status === "delivered" && (
                               <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => openReviewModal(item)}
                                >
                                    Write a Review
                                </Button>
                           )}
                        </div>
                      </div>
                   ))}
                </div>
             </div>
         </div>

         <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden p-6">
               <h2 className="font-bold mb-4">Order Summary</h2>
               <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                     <span className="text-gray-500">Subtotal</span>
                     <span className="font-medium">{formatCurrency(order.total)}</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-gray-500">Shipping</span>
                     <span className="font-medium">Free</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-gray-500">Tax</span>
                     <span className="font-medium">{formatCurrency(0)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-base">
                     <span className="font-bold">Total</span>
                     <span className="font-bold">{formatCurrency(order.total)}</span>
                  </div>
               </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden p-6">
               <h2 className="font-bold mb-4">Shipping Details</h2>
               <div className="space-y-4 text-sm">
                  <div>
                     <p className="text-gray-500 mb-1">Shipping Address</p>
                     <p className="font-medium">{order.shippingAddress}</p>
                  </div>
                   <div>
                     <p className="text-gray-500 mb-1">Payment Method</p>
                     <p className="font-medium">{order.paymentMethod}</p>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             {selectedItem && (
                 <div className="flex items-center gap-3 mb-2">
                     <div className="relative w-12 h-12 rounded-md overflow-hidden">
                        <Image src={selectedItem.image} alt={selectedItem.name} fill className="object-cover" />
                     </div>
                     <span className="font-medium text-sm">{selectedItem.name}</span>
                 </div>
             )}
            <div className="flex flex-col items-center gap-2">
                <span className="text-sm font-medium">Rate this product</span>
                <Rating 
                    onClick={(rate) => setReviewRating(rate)} 
                    initialValue={reviewRating}
                    size={30}
                />
            </div>
            <div className="grid gap-2">
              <label htmlFor="review" className="text-sm font-medium">
                Your Review
              </label>
              <textarea
                id="review"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Tell us what you think about this product..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSubmitReview}>Submit Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
