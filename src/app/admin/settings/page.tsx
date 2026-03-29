"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Save, 
  Loader2, 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  Navigation, 
  Layout, 
  CreditCard,
  Plus,
  Trash2,
  ExternalLink,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/api/settings');
      setSettings(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch settings", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiRequest('/api/settings', {
        method: 'PUT',
        body: settings
      });
      toast({ title: "Success", description: "All changes saved successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update settings", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(index);
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      
      const newBadges = [...settings.paymentBadges];
      newBadges[index].srcUrl = data.url;
      setSettings({ ...settings, paymentBadges: newBadges });
      
      toast({ title: "Success", description: "Icon uploaded successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload icon", variant: "destructive" });
    } finally {
      setUploading(null);
    }
  };

  const addNavbarItem = () => {};
  const removeNavbarItem = (_id: number) => {};

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium animate-pulse">Loading configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Settings" 
        description="Global configuration for your website content and behavior"
        action={
          <Button size="sm" className="bg-black text-white hover:bg-black/90 h-10 px-6 rounded-lg shadow-sm" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {saving ? "Saving Changes..." : "Save All Changes"}
          </Button>
        }
      />

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl border w-full justify-start overflow-x-auto h-auto">
          <TabsTrigger value="general" className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Globe className="w-4 h-4 mr-2" /> General
          </TabsTrigger>
          <TabsTrigger value="contact" className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Phone className="w-4 h-4 mr-2" /> Contact
          </TabsTrigger>
          
          <TabsTrigger value="footer" className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Layout className="w-4 h-4 mr-2" /> Footer
          </TabsTrigger>
          <TabsTrigger value="payment" className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <CreditCard className="w-4 h-4 mr-2" /> Payments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-bold">Site Information</h3>
              <p className="text-sm text-muted-foreground">Basic identity of your store visible to visitors and search engines.</p>
            </div>
            <div className="md:col-span-2 space-y-4 bg-card p-6 rounded-xl border shadow-sm">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Store Name</Label>
                <Input
                  value={settings?.siteName || ""}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  placeholder="e.g. My Store"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Site Description</Label>
                <Textarea
                  rows={4}
                  value={settings?.siteDescription || ""}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  placeholder="Describe your store for SEO..."
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-bold">Contact Details</h3>
              <p className="text-sm text-muted-foreground">Where customers can reach you and how your support is displayed.</p>
            </div>
            <div className="md:col-span-2 space-y-4 bg-card p-6 rounded-xl border shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Mail className="w-3 h-3" /> Email Address
                  </Label>
                  <Input
                    value={settings?.contact?.email || ""}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      contact: { ...settings.contact, email: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Phone className="w-3 h-3" /> Phone Number
                  </Label>
                  <Input
                    value={settings?.contact?.phone || ""}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      contact: { ...settings.contact, phone: e.target.value }
                    })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> Physical Address
                </Label>
                <Input
                  value={settings?.contact?.address || ""}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    contact: { ...settings.contact, address: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        

        <TabsContent value="footer" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-card p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-bold mb-6">Footer Link Sections</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {settings?.footerLinks?.map((section: any, idx: number) => (
                <div key={idx} className="space-y-4 p-5 border rounded-xl bg-muted/20">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <Input 
                      value={section.title} 
                      onChange={(e) => {
                        const newFooter = [...settings.footerLinks];
                        newFooter[idx].title = e.target.value;
                        setSettings({ ...settings, footerLinks: newFooter });
                      }}
                      className="h-8 text-xs font-black uppercase tracking-widest border-none bg-transparent focus-visible:ring-0 px-0"
                    />
                  </div>
                  <div className="space-y-3">
                    {section.children.map((link: any, lIdx: number) => (
                      <div key={lIdx} className="flex gap-2 items-center group">
                        <Input 
                          value={link.label} 
                          placeholder="Label"
                          onChange={(e) => {
                            const newFooter = [...settings.footerLinks];
                            newFooter[idx].children[lIdx].label = e.target.value;
                            setSettings({ ...settings, footerLinks: newFooter });
                          }}
                          className="h-8 text-xs bg-white"
                        />
                        <Input 
                          value={link.url} 
                          placeholder="URL"
                          onChange={(e) => {
                            const newFooter = [...settings.footerLinks];
                            newFooter[idx].children[lIdx].url = e.target.value;
                            setSettings({ ...settings, footerLinks: newFooter });
                          }}
                          className="h-8 text-xs bg-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-card p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-bold mb-2">Accepted Payment Methods</h3>
            <p className="text-sm text-muted-foreground mb-6">Manage the payment icons displayed in your site footer.</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
              {settings?.paymentBadges?.map((badge: any, idx: number) => (
                <div key={idx} className="space-y-3 p-4 border rounded-xl bg-muted/10 group hover:border-primary transition-colors">
                  <div className="aspect-[3/2] flex items-center justify-center bg-white rounded-lg border shadow-inner overflow-hidden p-2 relative">
                    {uploading === idx ? (
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    ) : (
                      <>
                        <img src={badge.srcUrl} alt="Badge" className="max-h-full max-w-full object-contain" onError={(e:any) => e.target.src="/icons/Visa.svg"} />
                        {badge.srcUrl.startsWith('/uploads/') && (
                          <div className="absolute top-1 right-1 bg-black/50 text-white text-[8px] px-1.5 py-0.5 rounded backdrop-blur-sm">
                            Server
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center justify-between">
                      Icon Path <ImageIcon className="w-2.5 h-2.5" />
                    </Label>
                    <div className="relative">
                      <Input 
                        value={badge.srcUrl} 
                        onChange={(e) => {
                          const newBadges = [...settings.paymentBadges];
                          newBadges[idx].srcUrl = e.target.value;
                          setSettings({ ...settings, paymentBadges: newBadges });
                        }}
                        className="h-7 text-[10px] bg-white font-mono pr-8"
                      />
                      <label className="absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer">
                        <Input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => handleFileUpload(idx, e)} 
                        />
                        <Upload className="w-3.5 h-3.5 text-muted-foreground hover:text-black transition-colors" />
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
