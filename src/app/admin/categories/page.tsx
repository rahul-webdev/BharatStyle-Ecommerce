"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Search, Loader2, Link as LinkIcon, Upload, Image as ImageIcon, X, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

export default function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "", description: "", isFeatured: false, parent: "", image: "" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);
  const limit = 10;
  const { toast } = useToast();

  const fetchCategories = async (currentPage = page, currentSearch = search) => {
    try {
      setLoading(true);
      const data = await apiRequest(`/api/admin/categories?page=${currentPage}&limit=${limit}&search=${currentSearch}`);
      setCategories(data.categories || []);
      setTotalPages(data.totalPages || 1);
      setTotalCategories(data.total || 0);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch categories", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategories(1, search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchCategories(page, search);
  }, [page]);

  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({ name: "", slug: "", description: "", isFeatured: false, parent: "", image: "" });
    setIsDialogOpen(true);
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({ 
      name: category.name, 
      slug: category.slug, 
      description: category.description || "",
      isFeatured: !!category.isFeatured,
      parent: category.parent || "",
      image: category.image || ""
    });
    setIsDialogOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setFormData({ ...formData, image: data.url });
      toast({ title: "Success", description: "Category image uploaded successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload image", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category? This may affect products linked to it.")) return;
    try {
      await apiRequest(`/api/admin/categories/${id}`, { method: 'DELETE' });
      toast({ title: "Success", description: "Category deleted successfully" });
      fetchCategories();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete category", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.name) {
        toast({ title: "Validation Error", description: "Category name is required", variant: "destructive" });
        return;
      }

      const method = editingCategory ? 'PUT' : 'POST';
      const url = editingCategory ? `/api/admin/categories/${editingCategory._id}` : '/api/admin/categories';
      
      const payload = {
        ...formData,
        slug: formData.slug || formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        parent: formData.parent || null,
        isFeatured: formData.parent ? false : formData.isFeatured,
      };

      await apiRequest(url, {
        method,
        body: payload
      });

      toast({ title: "Success", description: `Category ${editingCategory ? 'updated' : 'created'} successfully` });
      setIsDialogOpen(false);
      fetchCategories(page, search);
    } catch (error) {
      toast({ title: "Error", description: "Failed to save category", variant: "destructive" });
    }
  };

  const columns = [
    {
      key: "image",
      header: "Image",
      render: (category: any) => (
        <img
          src={category.image || "/images/placeholder.png"}
          alt={category.name}
          className="w-10 h-10 object-cover rounded-md border bg-muted"
          onError={(e) => {
            e.currentTarget.src = "/images/placeholder.png";
          }}
        />
      ),
    },
    { 
      key: "name", 
      header: "Category Name",
      render: (category: any) => (
        <div className="font-bold text-sm">{category.name}</div>
      )
    },
    { 
      key: "slug", 
      header: "Slug", 
      render: (category: any) => (
        <div className="flex items-center text-xs text-muted-foreground bg-muted px-2 py-1 rounded w-fit">
          <LinkIcon className="w-3 h-3 mr-1" />
          {category.slug}
        </div>
      )
    },
    { 
      key: "description", 
      header: "Description", 
      className: "text-muted-foreground max-w-xs truncate text-xs" 
    },
    {
      key: "isFeatured",
      header: "Featured",
      render: (category: any) => (
        <span className={`text-xs px-2 py-1 rounded ${category.isFeatured ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
          {category.isFeatured ? 'Yes' : 'No'}
        </span>
      )
    },
    {
      key: "parent",
      header: "Parent",
      render: (category: any) => {
        const parentName = categories.find(c => c._id === category.parent)?.name;
        return <span className="text-xs text-muted-foreground">{parentName || '-'}</span>;
      }
    },
    {
      key: "actions",
      header: "",
      className: "text-right w-24",
      render: (category: any) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(category)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(category._id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Categories" 
        description="Organize your products into logical collections"
        action={
          <Button onClick={handleAdd} className="bg-black text-white hover:bg-black/90">
            <Plus className="h-4 w-4 mr-2" /> New Category
          </Button>
        }
      />

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-lg"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse font-medium">Loading categories...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <DataTable columns={columns} data={categories} keyExtractor={(category: any) => category._id} />
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalCategories)} of {totalCategories} categories
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category Image</Label>
              <div className="flex gap-4 items-start">
                <div className="relative w-24 h-24 border rounded-xl bg-muted overflow-hidden flex-shrink-0">
                  {uploading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  ) : formData.image ? (
                    <>
                      <img src={formData.image} alt="Category" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setFormData({ ...formData, image: "" })}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-black"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="relative">
                    <Input 
                      placeholder="Image URL or upload..." 
                      className="h-9 text-xs pr-10"
                      value={formData.image} 
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })} 
                    />
                    <label className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer">
                      <Input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileUpload} 
                      />
                      <Upload className="w-4 h-4 text-muted-foreground hover:text-black transition-colors" />
                    </label>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Recommended: 800x800px. Store on server for best performance.</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category Name *</Label>
              <Input 
                id="name" 
                placeholder="e.g. Winter Collection"
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Custom Slug (Optional)</Label>
              <Input 
                id="slug" 
                placeholder="e.g. winter-collection"
                value={formData.slug} 
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Describe this category for customers..."
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Parent Category</Label>
              <select
                className="border rounded-md h-9 px-3 text-sm"
                value={formData.parent || ""}
                onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
              >
                <option value="">None</option>
                {categories.filter(c => !c.parent).map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            {!formData.parent && (
              <div className="flex items-center gap-2">
                <input
                  id="isFeatured"
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                />
                <Label htmlFor="isFeatured" className="text-sm">Mark as Featured</Label>
              </div>
            )}
          </div>
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-lg">Cancel</Button>
            <Button onClick={handleSave} className="bg-black text-white hover:bg-black/90 rounded-lg px-8">
              {editingCategory ? "Update Category" : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
