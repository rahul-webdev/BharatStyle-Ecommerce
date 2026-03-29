"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Mail, 
  Phone, 
  Loader2, 
  User, 
  Calendar, 
  ShieldCheck,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/api/admin/customers');
      setCustomers(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch customers", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(search.toLowerCase()) ||
    (customer.email && customer.email.toLowerCase().includes(search.toLowerCase())) ||
    (customer.phone && customer.phone.includes(search))
  );

  const columns = [
    { 
      key: "name", 
      header: "Customer Profile",
      render: (customer: any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-black text-xs border shadow-sm">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-sm text-foreground">{customer.name}</div>
            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{customer.role || "Customer"}</div>
          </div>
        </div>
      )
    },
    { 
      key: "isVerified", 
      header: "Status",
      render: (customer: any) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={customer.isVerified ? "active" : "inactive"} />
          {customer.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />}
        </div>
      )
    },
    { 
      key: "contact", 
      header: "Contact Info",
      render: (customer: any) => (
        <div className="space-y-1">
          <div className="flex items-center text-[11px] font-medium text-muted-foreground">
            <Mail className="w-3 h-3 mr-1.5 opacity-60" /> {customer.email || "No Email"}
          </div>
          {customer.phone && (
            <div className="flex items-center text-[11px] font-medium text-muted-foreground">
              <Phone className="w-3 h-3 mr-1.5 opacity-60" /> {customer.phone}
            </div>
          )}
        </div>
      )
    },
    { 
      key: "createdAt", 
      header: "Member Since",
      render: (customer: any) => (
        <div className="flex items-center text-[11px] font-bold text-muted-foreground">
          <Calendar className="w-3 h-3 mr-1.5 opacity-60" />
          {new Date(customer.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
        </div>
      )
    },
    {
      key: "actions",
      header: "",
      className: "text-right w-24",
      render: (customer: any) => (
        <div className="flex items-center justify-end gap-1">
          {customer.email && (
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-black hover:text-white transition-colors" asChild title="Send Email">
              <a href={`mailto:${customer.email}`}>
                <Mail className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}
          {customer.phone && (
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-black hover:text-white transition-colors" asChild title="Call Customer">
              <a href={`tel:${customer.phone}`}>
                <Phone className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Customers" 
        description={`Managing ${customers.length} registered users in your database`}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-lg"
          />
        </div>
        <div className="flex items-center gap-6 px-4">
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total</p>
            <p className="text-sm font-black">{customers.length}</p>
          </div>
          <div className="h-8 w-[1px] bg-border" />
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Verified</p>
            <p className="text-sm font-black text-blue-600">{customers.filter(c => c.isVerified).length}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium animate-pulse">Fetching member directory...</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <DataTable columns={columns} data={filteredCustomers} keyExtractor={(customer: any) => customer._id} />
        </div>
      )}
    </div>
  );
}
