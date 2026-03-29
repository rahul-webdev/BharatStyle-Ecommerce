"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Loader2, 
  Eye, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle,
  Calendar,
  User,
  MapPin,
  CreditCard
} from "lucide-react";
import { formatCurrency } from "@/data/siteData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/api/admin/orders');
      setOrders(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch orders", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order._id.toLowerCase().includes(search.toLowerCase()) || 
                         order.user?.name?.toLowerCase().includes(search.toLowerCase());
    const status = order.status || (order.isDelivered ? "delivered" : "pending");
    const matchesStatus = statusFilter === "all" || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (id: string, status: string) => {
    try {
      setStatusUpdating(true);
      await apiRequest(`/api/admin/orders/${id}/status`, {
        method: 'PUT',
        body: { status }
      });
      toast({ title: "Success", description: `Order updated to ${status}` });
      fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    } finally {
      setStatusUpdating(false);
    }
  };

  const columns = [
    { 
      key: "_id", 
      header: "Order ID", 
      render: (order: any) => (
        <div className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
          #{order._id.slice(-8)}
        </div>
      )
    },
    { 
      key: "createdAt", 
      header: "Date",
      render: (order: any) => (
        <div className="flex items-center text-xs">
          <Calendar className="w-3 h-3 mr-1.5 text-muted-foreground" />
          {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      )
    },
    { 
      key: "user", 
      header: "Customer",
      render: (order: any) => (
        <div className="flex items-center text-xs font-medium">
          <User className="w-3 h-3 mr-1.5 text-muted-foreground" />
          {order.user?.name || "Guest Customer"}
        </div>
      )
    },
    { 
      key: "status", 
      header: "Status",
      render: (order: any) => <StatusBadge status={order.status || (order.isDelivered ? "delivered" : "pending")} />
    },
    { 
      key: "totalPrice", 
      header: "Total",
      className: "text-right",
      render: (order: any) => (
        <span className="font-black text-sm">{formatCurrency(order.totalPrice)}</span>
      )
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (order: any) => (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 hover:bg-black hover:text-white transition-colors"
          onClick={() => setSelectedOrder(order)}
        >
          <Eye className="w-3.5 h-3.5" />
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Orders" 
        description={`Monitoring ${orders.length} transactions across your store`}
      />

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-lg"
          />
        </div>
        <div className="flex bg-muted/50 p-1 rounded-lg border gap-1 overflow-x-auto max-w-full">
          {["all", "pending", "processing", "dispatched", "delivered", "cancelled", "rejected"].map((status) => (
            <button
              key={status}
              className={cn(
                "px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                statusFilter === status 
                  ? "bg-white text-black shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium animate-pulse">Retrieving orders...</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredOrders}
            keyExtractor={(order) => order._id}
          />
        </div>
      )}

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl overflow-hidden p-0 rounded-2xl border-none shadow-2xl">
          {selectedOrder && (
            <div className="flex flex-col max-h-[90vh]">
              <div className="p-6 bg-black text-white flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Order Details</p>
                  <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                    <Package className="w-5 h-5" /> #{selectedOrder._id.slice(-12)}
                  </h2>
                </div>
                <StatusBadge status={selectedOrder.status || (selectedOrder.isDelivered ? "delivered" : "pending")} />
              </div>

              <div className="p-6 overflow-y-auto space-y-8 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <User className="w-3 h-3" /> Customer Information
                    </h4>
                    <div className="p-4 rounded-xl border bg-muted/10 space-y-1">
                      <p className="font-bold text-sm">{selectedOrder.user?.name || "Guest Customer"}</p>
                      <p className="text-xs text-muted-foreground">{selectedOrder.user?.email}</p>
                      <p className="text-xs text-muted-foreground">{selectedOrder.user?.phone}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <MapPin className="w-3 h-3" /> Shipping Address
                    </h4>
                    <div className="p-4 rounded-xl border bg-muted/10">
                      <p className="text-xs font-medium leading-relaxed">
                        {selectedOrder.shippingAddress.address},<br />
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode},<br />
                        {selectedOrder.shippingAddress.country}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Order Items</h4>
                  <div className="border rounded-xl divide-y bg-card overflow-hidden">
                    {selectedOrder.orderItems.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-4 group hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg border bg-white p-1 overflow-hidden">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-md" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{item.name}</p>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{formatCurrency(item.price)} × {item.qty}</p>
                          </div>
                        </div>
                        <span className="font-black text-sm">{formatCurrency(item.price * item.qty)}</span>
                      </div>
                    ))}
                    <div className="bg-black text-white p-4 flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Grand Total</span>
                      <span className="text-lg font-black">{formatCurrency(selectedOrder.totalPrice)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border bg-muted/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-blue-50 text-blue-600">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider">Payment Method</span>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{selectedOrder.paymentMethod}</span>
                  </div>
                  <div className="p-4 rounded-xl border bg-muted/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-green-50 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider">Status</span>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{selectedOrder.isPaid ? "Paid" : "Unpaid"}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-muted/30 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">Update Status</span>
                  <Select 
                    disabled={statusUpdating} 
                    onValueChange={(val) => updateStatus(selectedOrder._id, val)}
                    defaultValue={selectedOrder.status || (selectedOrder.isDelivered ? "delivered" : "pending")}
                  >
                    <SelectTrigger className="w-full sm:w-48 h-10 rounded-xl font-bold text-xs uppercase tracking-wider bg-white shadow-sm border-black/5">
                      <SelectValue placeholder="Change Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-black/5 shadow-2xl">
                      <SelectItem value="pending" className="text-xs font-bold uppercase tracking-wider py-3">Pending</SelectItem>
                      <SelectItem value="processing" className="text-xs font-bold uppercase tracking-wider py-3">Processing</SelectItem>
                      <SelectItem value="dispatched" className="text-xs font-bold uppercase tracking-wider py-3 text-blue-600">Dispatched</SelectItem>
                      <SelectItem value="delivered" className="text-xs font-bold uppercase tracking-wider py-3 text-green-600">Delivered</SelectItem>
                      <SelectItem value="cancelled" className="text-xs font-bold uppercase tracking-wider py-3 text-red-400">Cancelled</SelectItem>
                      <SelectItem value="rejected" className="text-xs font-bold uppercase tracking-wider py-3 text-red-600">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <Button variant="outline" onClick={() => setSelectedOrder(null)} className="flex-1 sm:flex-none rounded-xl h-10 px-6 font-bold text-xs uppercase tracking-widest">
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
