 "use client";
 
 import { useEffect, useState } from "react";
 import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
 import { RootState } from "@/lib/store";
 import { Button } from "@/components/ui/button";
 import { cn, formatCurrency } from "@/lib/utils";
 import { integralCF } from "@/styles/fonts";
 import { apiRequest } from "@/lib/api";
import { remove } from "@/lib/features/carts/cartsSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
 
 export default function CheckoutPage() {
   const { isLoggedIn, user } = useAppSelector((state) => state.auth);
   const { cart, adjustedTotalPrice } = useAppSelector(
     (state: RootState) => state.carts
   );
  const dispatch = useAppDispatch();
   const router = useRouter();
   const [placing, setPlacing] = useState(false);
   const [error, setError] = useState("");
   const [success, setSuccess] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [upiId, setUpiId] = useState("");
 
   useEffect(() => {
     if (!isLoggedIn) {
       router.push("/auth");
     }
   }, [isLoggedIn, router]);
 
   if (!isLoggedIn) return null;
 
  const removeItemsByIds = (ids: string[]) => {
    if (!cart) return;
    ids.forEach((rid) => {
      cart.items
        .filter((ci) => String(ci.id) === String(rid))
        .forEach((ci) => {
          dispatch(
            remove({
              id: ci.id as any,
              attributes: ci.attributes,
              quantity: ci.quantity,
            })
          );
        });
    });
  };

  const clearEntireCart = () => {
    if (!cart) return;
    cart.items.forEach((ci) => {
      dispatch(
        remove({
          id: ci.id as any,
          attributes: ci.attributes,
          quantity: ci.quantity,
        })
      );
    });
  };

  const handlePlaceOrder = async (method: string, paid: boolean) => {
     if (!cart || cart.items.length === 0) {
       setError("Your cart is empty.");
       return;
     }
     setError("");
     setSuccess("");
     setPlacing(true);
     try {
       const payload = {
         items: cart.items.map((item) => ({
           id: item.id,
           quantity: item.quantity,
           price: item.price,
         })),
         total: Math.round(adjustedTotalPrice),
         shippingAddress:
           user?.address?.street ||
           "Default Address, Mumbai, Maharashtra 400001",
        paymentMethod: method,
        isPaid: paid,
        customer: {
          mobile: user?.mobile || "",
          firstName: user?.firstName || "Guest",
          lastName: user?.lastName || "",
        },
       };
      const res = await apiRequest("/api/orders", {
         method: "POST",
         body: payload,
       });
      if (Array.isArray((res as any).missingItems) && (res as any).missingItems.length > 0) {
        removeItemsByIds((res as any).missingItems);
        setError("Some unavailable items were removed from your cart.");
      }
       setSuccess("Order placed successfully.");
      clearEntireCart();
       router.push("/orders");
     } catch (e: any) {
      const msg = e.message || "Failed to place order.";
      setError(msg);
      if (msg.includes("No valid order items")) {
        clearEntireCart();
      }
     } finally {
       setPlacing(false);
     }
   };
  
  const startPayment = async () => {
    if (paymentMethod === "Cash on Delivery") {
      setPaymentOpen(false);
      await handlePlaceOrder("Cash on Delivery", false);
      return;
    }
    const isCard = paymentMethod === "Card";
    if (isCard) {
      if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
        setError("Please fill card details.");
        return;
      }
    } else {
      if (!upiId) {
        setError("Please enter UPI ID.");
        return;
      }
    }
    setError("");
    setPaymentOpen(false);
    await new Promise((r) => setTimeout(r, 1000));
    await handlePlaceOrder(paymentMethod, true);
  };
 
   return (
     <main className="max-w-frame mx-auto px-4 xl:px-0 py-10">
       <h2
         className={cn([
           integralCF.className,
           "font-bold text-[28px] md:text-[32px] text-black mb-6",
         ])}
       >
         Checkout
       </h2>
 
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="md:col-span-2 space-y-4 p-5 border rounded-2xl">
           <h3 className="text-lg font-bold">Shipping Details</h3>
           <div className="text-sm text-black/70">
             <div>Name: {user?.firstName || "Guest"}</div>
             <div>Mobile: +91 {user?.mobile}</div>
             <div>
               Address:{" "}
               {user?.address?.street ||
                 "Default Address, Mumbai, Maharashtra 400001"}
             </div>
           </div>
         </div>
 
         <div className="space-y-4 p-5 border rounded-2xl">
           <h3 className="text-lg font-bold">Summary</h3>
           <div className="flex items-center justify-between">
             <span>Total</span>
             <span className="text-xl font-bold">
               {formatCurrency(Math.round(adjustedTotalPrice))}
             </span>
           </div>
           {error && (
             <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>
           )}
           {success && (
             <div className="text-green-700 text-sm bg-green-50 p-2 rounded">
               {success}
             </div>
           )}
           <Button
             type="button"
             className="w-full rounded-full h-12 bg-black"
             disabled={placing}
            onClick={() => setPaymentOpen(true)}
           >
             {placing ? "Placing Order..." : "Pay & Place Order"}
           </Button>
         </div>
       </div>
      
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment</DialogTitle>
            <DialogDescription>Select method and complete payment.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Card">Card</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Cash on Delivery">Cash on Delivery</SelectItem>
              </SelectContent>
            </Select>
            
            {paymentMethod === "Card" && (
              <div className="space-y-2">
                <Input placeholder="Name on card" value={cardName} onChange={(e) => setCardName(e.target.value)} />
                <Input placeholder="Card number" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="MM/YY" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} />
                  <Input placeholder="CVV" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} />
                </div>
              </div>
            )}
            
            {paymentMethod === "UPI" && (
              <div className="space-y-2">
                <Input placeholder="UPI ID (e.g., name@bank)" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
              </div>
            )}
            
            <Button className="w-full" onClick={startPayment}>
              Pay Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
     </main>
   );
 }
