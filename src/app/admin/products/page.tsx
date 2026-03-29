"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus,
  Upload,
  Pencil, 
  Trash2, 
  Search, 
  Star, 
  Loader2, 
  Image as ImageIcon,
  X,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from "lucide-react";
import { formatCurrency } from "@/data/siteData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const SIZES = ["S", "M", "L", "XL", "XXL", "3XL"];
const COLORS = [
  { name: "Black", code: "#000000" },
  { name: "White", code: "#FFFFFF" },
  { name: "Red", code: "#FF0000" },
  { name: "Blue", code: "#0000FF" },
  { name: "Green", code: "#008000" },
  { name: "Yellow", code: "#FFFF00" },
  { name: "Gray", code: "#808080" },
  { name: "Navy", code: "#000080" },
];

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 10;
  
  const [formData, setFormData] = useState<any>({ 
    name: "", 
    price: "", 
    discountPrice: "",
    stock: "",
    description: "",
    category: "",
    images: [""],
    colors: [],
    sizes: [],
    isFeatured: false
  });

  const { toast } = useToast();

  const fetchData = async (currentPage = page, currentSearch = search) => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        apiRequest(`/api/admin/products?page=${currentPage}&limit=${limit}&search=${currentSearch}`),
        apiRequest('/api/admin/categories?nopagination=true')
      ]);
      setProducts(productsRes.products || []);
      setTotalPages(productsRes.totalPages || 1);
      setTotalProducts(productsRes.total || 0);
      setCategories(categoriesRes || []);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(1, search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchData(page, search);
  }, [page]);

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({ 
      name: "", 
      price: "", 
      discountPrice: "0",
      stock: "50",
      description: "",
      category: categories[0]?._id || "",
      images: [""],
      colors: ["#000000"],
      sizes: ["M"],
      isFeatured: false
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({ 
      name: product.name, 
      price: product.price.toString(), 
      discountPrice: (product.discountPrice || 0).toString(),
      stock: product.stock.toString(),
      description: product.description || "",
      category: product.category?._id || product.category || "",
      images: product.images && product.images.length > 0 ? product.images : [""],
      colors: product.colors || [],
      sizes: product.sizes || [],
      isFeatured: product.isFeatured || false
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await apiRequest(`/api/admin/products/${id}`, { method: 'DELETE' });
      toast({ title: "Success", description: "Product deleted successfully" });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete product", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.price || !formData.category || !formData.images[0]) {
        toast({ title: "Validation Error", description: "Please fill all required fields", variant: "destructive" });
        return;
      }

      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct ? `/api/admin/products/${editingProduct._id}` : '/api/admin/products';
      
      const payload = {
        ...formData,
        price: Number(formData.price),
        discountPrice: Number(formData.discountPrice),
        stock: Number(formData.stock),
        slug: formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        images: formData.images.filter((img: string) => img.trim() !== ""),
      };

      await apiRequest(url, {
        method,
        body: payload
      });

      toast({ title: "Success", description: `Product ${editingProduct ? 'updated' : 'created'} successfully` });
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save product", variant: "destructive" });
    }
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
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
      handleImageChange(index, data.url);
      toast({ title: "Success", description: "Image uploaded successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload image", variant: "destructive" });
    } finally {
      setUploading(null);
    }
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ""] });
  };

  const removeImageField = (index: number) => {
    const newImages = formData.images.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, images: newImages.length > 0 ? newImages : [""] });
  };

  const toggleSize = (size: string) => {
    const newSizes = formData.sizes.includes(size)
      ? formData.sizes.filter((s: string) => s !== size)
      : [...formData.sizes, size];
    setFormData({ ...formData, sizes: newSizes });
  };

  const toggleColor = (color: string) => {
    const newColors = formData.colors.includes(color)
      ? formData.colors.filter((c: string) => c !== color)
      : [...formData.colors, color];
    setFormData({ ...formData, colors: newColors });
  };

  const columns = [
    { 
      key: "image", 
      header: "Image",
      render: (product: any) => (
        <img 
          src={product.images[0] || "/images/placeholder.png"} 
          alt={product.name} 
          className="w-10 h-10 object-cover rounded-md border bg-muted" 
          onError={(e) => {
            e.currentTarget.src = "/images/placeholder.png";
          }}
        />
      )
    },
    { 
      key: "name", 
      header: "Product",
      render: (product: any) => (
        <div>
          <div className="font-bold text-sm text-foreground">{product.name}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{product.category?.name || "No Category"}</div>
        </div>
      )
    },
    { 
      key: "price", 
      header: "Price",
      render: (product: any) => (
        <div className="flex flex-col">
          <span className="font-bold">{formatCurrency(product.price)}</span>
          {product.discountPrice > 0 && (
            <span className="text-[10px] text-destructive line-through">
              {formatCurrency(product.discountPrice)}
            </span>
          )}
        </div>
      )
    },
    { 
      key: "stock", 
      header: "Stock",
      render: (product: any) => (
        <div className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
          product.stock < 10 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
        )}>
          {product.stock} units
        </div>
      )
    },
    { 
      key: "ratings", 
      header: "Rating",
      render: (product: any) => (
        <div className="flex items-center text-yellow-500 gap-1">
          <Star className="w-3 h-3 fill-current" />
          <span className="text-xs font-bold">{product.ratings}</span>
        </div>
      )
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (product: any) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(product)}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(product._id)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Products" 
        description="Manage your store's inventory and catalog"
        action={
          <Button onClick={handleAdd} className="bg-black text-white hover:bg-black/90">
            <Plus className="w-4 h-4 mr-2" /> New Product
          </Button>
        }
      />

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name..." 
            className="pl-9 h-10 rounded-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse font-medium">Loading catalog...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <DataTable columns={columns} data={products} keyExtractor={(product: any) => product._id} />
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalProducts)} of {totalProducts} products
              </p>
              <Pagination className="w-auto mx-0">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) setPage(page - 1);
                      }}
                      className={cn(page <= 1 && "pointer-events-none opacity-50")}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    if (
                      p === 1 || 
                      p === totalPages || 
                      (p >= page - 1 && p <= page + 1)
                    ) {
                      return (
                        <PaginationItem key={p}>
                          <PaginationLink 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              setPage(p);
                            }}
                            isActive={p === page}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    } else if (
                      p === page - 2 || 
                      p === page + 2
                    ) {
                      return (
                        <PaginationItem key={p}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < totalPages) setPage(page + 1);
                      }}
                      className={cn(page >= totalPages && "pointer-events-none opacity-50")}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Product Name *</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Classic White T-Shirt"
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Price (₹) *</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    placeholder="0.00"
                    value={formData.price} 
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountPrice" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Discount Price (₹)</Label>
                  <Input 
                    id="discountPrice" 
                    type="number" 
                    placeholder="0.00"
                    value={formData.discountPrice} 
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Inventory Count *</Label>
                  <Input 
                    id="stock" 
                    type="number" 
                    value={formData.stock} 
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(val) => setFormData({ ...formData, category: val })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</Label>
                <Textarea 
                  id="description" 
                  rows={4}
                  placeholder="Tell customers about this product..."
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                />
              </div>

              <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg border">
                <button 
                  onClick={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}
                  className="flex items-center gap-2"
                >
                  {formData.isFeatured ? (
                    <CheckCircle2 className="w-5 h-5 text-primary fill-current" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span className="text-sm font-bold uppercase tracking-wider">Featured Product</span>
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Product Images (Upload to Server) *</Label>
                <div className="space-y-2">
                  {formData.images.map((img: string, idx: number) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <div className="relative flex-1">
                        {uploading === idx ? (
                          <div className="flex items-center gap-2 h-8 px-3 border rounded-md bg-muted animate-pulse">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span className="text-[10px] font-medium">Uploading...</span>
                          </div>
                        ) : (
                          <>
                            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                            <Input 
                              placeholder="Click upload to choose file..." 
                              className="pl-9 h-8 text-xs pr-10"
                              value={img} 
                              onChange={(e) => handleImageChange(idx, e.target.value)} 
                            />
                            <label className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer">
                              <Input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => handleFileUpload(idx, e)} 
                              />
                              <Upload className="w-3.5 h-3.5 text-muted-foreground hover:text-black transition-colors" />
                            </label>
                          </>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeImageField(idx)}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full h-8 text-[10px] font-bold uppercase tracking-widest border-dashed"
                    onClick={addImageField}
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add More Images
                  </Button>
                </div>
                {formData.images[0] && (
                  <div className="aspect-square rounded-xl border bg-muted overflow-hidden relative">
                    <img src={formData.images[0]} alt="Preview" className="w-full h-full object-cover" onError={(e:any) => e.target.src = "/images/placeholder.png"} />
                    {formData.images[0].startsWith('/uploads/') && (
                      <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm">
                        Server Stored
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Available Sizes</Label>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={cn(
                        "h-8 w-10 rounded border text-xs font-bold transition-all",
                        formData.sizes.includes(size)
                          ? "bg-black text-white border-black"
                          : "bg-white text-black border-border hover:border-black"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Available Colors</Label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color.code}
                      onClick={() => toggleColor(color.code)}
                      className={cn(
                        "h-8 w-8 rounded-full border-2 transition-all p-0.5",
                        formData.colors.includes(color.code)
                          ? "border-primary scale-110"
                          : "border-transparent hover:border-muted-foreground"
                      )}
                      title={color.name}
                    >
                      <div 
                        className="w-full h-full rounded-full border border-black/10 shadow-inner" 
                        style={{ backgroundColor: color.code }} 
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-lg">Cancel</Button>
            <Button onClick={handleSave} className="bg-black text-white hover:bg-black/90 rounded-lg px-8">
              {editingProduct ? "Update Product" : "Create Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
