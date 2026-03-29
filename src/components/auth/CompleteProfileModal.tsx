"use client";

import { useState } from "react";
import { useAppDispatch } from "@/lib/hooks/redux";
import { updateUser } from "@/lib/features/auth/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface CompleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CompleteProfileModal({ isOpen, onClose, onSuccess }: CompleteProfileModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName) {
      toast({ title: "Validation Error", description: "Please enter your first and last name", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest('/api/user/profile', {
        method: 'PUT',
        body: { firstName, lastName, email }
      });

      if (response.success) {
        dispatch(updateUser(response.user));
        toast({ title: "Success", description: "Profile updated successfully" });
        onSuccess();
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update profile", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-8 border-none shadow-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-black uppercase tracking-widest text-center">Final Step</DialogTitle>
          <DialogDescription className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Tell us a bit about yourself
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2.5">
              <Label htmlFor="firstName" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="rounded-xl bg-gray-50 border-gray-100 h-12 font-bold text-sm focus-visible:ring-primary/10"
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="lastName" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="rounded-xl bg-gray-50 border-gray-100 h-12 font-bold text-sm focus-visible:ring-primary/10"
              />
            </div>
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl bg-gray-50 border-gray-100 h-12 font-bold text-sm focus-visible:ring-primary/10"
            />
          </div>
          <DialogFooter className="pt-2">
            <Button type="submit" className="w-full rounded-full py-7 text-sm font-black uppercase tracking-widest shadow-lg shadow-primary/20" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Start Shopping"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
