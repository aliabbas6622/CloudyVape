import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useGetAdminMe, 
  useGetProductStats, 
  useListProducts, 
  useListCategories,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useCreateCategory,
  useDeleteCategory,
  useGetSettings,
  useUpdateSettings,
  getListProductsQueryKey,
  getGetProductStatsQueryKey,
  getListCategoriesQueryKey,
  getGetSettingsQueryKey,
  getGetAdminMeQueryKey
} from "@/api/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Package, Tags, Star, AlertTriangle, AlertCircle, RefreshCw, MessageCircle, Settings, Lock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.coerce.number().min(0, "Price must be positive"),
  description: z.string().min(1, "Description is required"),
  imageUrls: z.array(z.string().url("Must be a valid URL").or(z.literal(""))).optional().default([]),
  categoryId: z.coerce.number().min(1, "Category is required"),
  featured: z.boolean().default(false),
  inStock: z.boolean().default(true),
});

const settingsSchema = z.object({
  whatsappNumber: z.string().min(1, "WhatsApp number is required"),
  adminPassword: z.string().optional(),
});

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("products");
  
  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Auth check
  const { data: adminSession, isLoading: authLoading, isError: authError } = useGetAdminMe({
    query: { retry: false, queryKey: getGetAdminMeQueryKey() }
  });

  useEffect(() => {
    if (!authLoading && (authError || !adminSession?.authenticated)) {
      setLocation("/admin/login");
    }
  }, [authLoading, authError, adminSession, setLocation]);

  // Data fetching
  const { data: stats } = useGetProductStats({
    query: { enabled: !!adminSession?.authenticated, queryKey: getGetProductStatsQueryKey() }
  });
  const { data: products } = useListProducts(undefined, {
    query: { enabled: !!adminSession?.authenticated, queryKey: getListProductsQueryKey() }
  });
  const { data: categories } = useListCategories({
    query: { enabled: !!adminSession?.authenticated, queryKey: getListCategoriesQueryKey() }
  });

  // Mutations
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const updateSettings = useUpdateSettings();

  // Settings
  const { data: shopSettings } = useGetSettings({
    query: { enabled: !!adminSession?.authenticated, queryKey: getGetSettingsQueryKey() }
  });

  const settingsForm = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    values: {
      whatsappNumber: shopSettings?.whatsappNumber ?? "",
      adminPassword: "",
    },
  });

  const onSubmitSettings = (data: z.infer<typeof settingsSchema>) => {
    const payload: { whatsappNumber?: string; adminPassword?: string } = {
      whatsappNumber: data.whatsappNumber,
    };
    if (data.adminPassword && data.adminPassword.trim().length > 0) {
      payload.adminPassword = data.adminPassword;
    }
    updateSettings.mutate(
      { data: payload },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
          settingsForm.setValue("adminPassword", "");
          toast({ title: "Settings saved successfully" });
        },
        onError: () => {
          toast({ title: "Error saving settings", variant: "destructive" });
        },
      }
    );
  };

  // Forms
  const productForm = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: 0,
      description: "",
      imageUrls: [],
      categoryId: 0,
      featured: false,
      inStock: true,
    },
  });

  // Open edit modal
  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    productForm.reset({
      name: product.name,
      price: product.price,
      description: product.description || "",
      imageUrls: product.imageUrls || [],
      categoryId: product.categoryId,
      featured: product.featured,
      inStock: product.inStock,
    });
    setIsProductModalOpen(true);
  };

  // Open new modal
  const handleNewProduct = () => {
    setEditingProduct(null);
    productForm.reset({
      name: "",
      price: 0,
      description: "",
      imageUrls: [],
      categoryId: categories?.[0]?.id || 0,
      featured: false,
      inStock: true,
    });
    setIsProductModalOpen(true);
  };

  const onSubmitProduct = (data: z.infer<typeof productSchema>) => {
    if (editingProduct) {
      updateProduct.mutate(
        { id: editingProduct.id, data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetProductStatsQueryKey() });
            toast({ title: "Product updated successfully" });
            setIsProductModalOpen(false);
          },
        }
      );
    } else {
      createProduct.mutate(
        { data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetProductStatsQueryKey() });
            toast({ title: "Product created successfully" });
            setIsProductModalOpen(false);
          },
        }
      );
    }
  };

  const handleDeleteProduct = (id: number) => {
    deleteProduct.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetProductStatsQueryKey() });
          toast({ title: "Product deleted" });
        },
      }
    );
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    createCategory.mutate(
      { data: { name: newCategoryName } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetProductStatsQueryKey() });
          toast({ title: "Category created" });
          setNewCategoryName("");
          setIsCategoryModalOpen(false);
        },
      }
    );
  };

  const handleDeleteCategory = (id: number) => {
    deleteCategory.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetProductStatsQueryKey() });
          toast({ title: "Category deleted" });
        },
        onError: () => {
          toast({ 
            title: "Error", 
            description: "Cannot delete category that has products.", 
            variant: "destructive" 
          });
        }
      }
    );
  };

  if (authLoading || !adminSession?.authenticated) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-white font-mono">Verifying credentials...</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-card border-b border-white/5 py-8">
        <div className="container mx-auto px-4 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">System Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage catalog, inventory, and categories.</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 mt-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Products", value: stats?.totalProducts || 0, icon: Package, color: "text-primary" },
            { label: "Categories", value: stats?.totalCategories || 0, icon: Tags, color: "text-secondary" },
            { label: "Featured", value: stats?.featuredCount || 0, icon: Star, color: "text-yellow-500" },
            { label: "In Stock", value: stats?.inStockCount || 0, icon: RefreshCw, color: "text-green-500" }
          ].map((stat, i) => (
            <div key={i} className="bg-card border border-white/5 rounded-xl p-6 flex items-center gap-4">
              <div className={`p-3 rounded-lg bg-black/40 border border-white/5 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-3xl font-display font-bold text-white mt-1">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-card border border-white/5 h-14 w-full justify-start p-1 mb-6 rounded-xl">
            <TabsTrigger value="products" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full rounded-lg px-8 font-semibold">
              Products
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground h-full rounded-lg px-8 font-semibold">
              Categories
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-white/10 data-[state=active]:text-white h-full rounded-lg px-8 font-semibold">
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-white/5">
              <h2 className="text-xl font-display font-semibold text-white">Product Inventory</h2>
              <Button onClick={handleNewProduct} className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_10px_rgba(97,155,182,0.3)]">
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </div>

            <div className="bg-card border border-white/5 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-muted-foreground">
                  <thead className="bg-black/40 text-white font-mono text-xs uppercase">
                    <tr>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Price (PKR)</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Featured</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {products?.map((product) => (
                      <tr key={product.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-medium text-white">{product.name}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-1 rounded bg-secondary/10 text-secondary text-xs border border-secondary/20">
                            {product.categoryName}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono">{product.price.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          {product.inStock ? (
                            <span className="text-green-500 font-medium">In Stock</span>
                          ) : (
                            <span className="text-destructive font-medium">Out of Stock</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {product.featured ? <Star className="h-4 w-4 text-yellow-500 fill-current" /> : "-"}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)} className="hover:text-primary">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-card border-white/10 text-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete "{product.name}". This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5 hover:text-white">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteProduct(product.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </tr>
                    ))}
                    {products?.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                          No products found. Click "Add Product" to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-white/5">
              <h2 className="text-xl font-display font-semibold text-white">Categories</h2>
              <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-[0_0_10px_rgba(186,215,225,0.3)]">
                    <Plus className="mr-2 h-4 w-4" /> New Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-white/10 text-white sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-display">Create Category</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateCategory} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="catName">Category Name</Label>
                      <Input
                        id="catName"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="e.g. Pod Systems"
                        className="bg-black/40 border-white/10 focus-visible:ring-secondary focus-visible:border-secondary text-white"
                        autoFocus
                      />
                    </div>
                    <DialogFooter className="pt-4">
                      <Button type="button" variant="ghost" onClick={() => setIsCategoryModalOpen(false)} className="hover:bg-white/5 text-white">Cancel</Button>
                      <Button type="submit" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground" disabled={!newCategoryName.trim() || createCategory.isPending}>
                        {createCategory.isPending ? "Saving..." : "Create"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {categories?.map((cat) => {
                const count = stats?.byCategory.find(s => s.categoryId === cat.id)?.count || 0;
                return (
                  <div key={cat.id} className="bg-card border border-white/5 rounded-xl p-5 flex items-center justify-between group hover:border-secondary/30 transition-colors">
                    <div>
                      <h3 className="text-lg font-bold text-white">{cat.name}</h3>
                      <p className="text-sm text-muted-foreground">{count} products</p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-card border-white/10 text-white">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" /> Delete Category?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{cat.name}"? This action will fail if there are products attached to this category.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5 hover:text-white">Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteCategory(cat.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="bg-card p-4 rounded-xl border border-white/5">
              <h2 className="text-xl font-display font-semibold text-white">Shop Settings</h2>
              <p className="text-sm text-muted-foreground mt-1">Configure your WhatsApp buy button and admin credentials.</p>
            </div>

            <Form {...settingsForm}>
              <form onSubmit={settingsForm.handleSubmit(onSubmitSettings)} className="space-y-6">

                {/* WhatsApp Settings */}
                <div className="bg-card border border-white/5 rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-[#25D366]/10 text-[#25D366]">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">WhatsApp Buy Button</h3>
                      <p className="text-xs text-muted-foreground">The number customers message when they click "Order via WhatsApp"</p>
                    </div>
                  </div>

                  <FormField
                    control={settingsForm.control}
                    name="whatsappNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp Number</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-sm font-mono bg-black/40 border border-white/10 px-3 py-2 rounded-l-md border-r-0">wa.me/</span>
                            <Input
                              placeholder="923432389520"
                              className="bg-black/40 border-white/10 focus-visible:ring-[#25D366] text-white font-mono rounded-l-none"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <p className="text-xs text-muted-foreground">Include country code, no spaces or dashes. E.g. <span className="font-mono text-white/60">923432389520</span></p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {shopSettings?.whatsappNumber && (
                    <div className="flex items-center gap-2 p-3 bg-[#25D366]/5 border border-[#25D366]/20 rounded-lg">
                      <div className="h-2 w-2 bg-[#25D366] rounded-full shadow-[0_0_8px_rgba(37,211,102,0.8)]" />
                      <span className="text-sm text-[#25D366]">Active: </span>
                      <a
                        href={`https://wa.me/${shopSettings.whatsappNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-mono text-white/70 hover:text-white underline underline-offset-2"
                      >
                        wa.me/{shopSettings.whatsappNumber}
                      </a>
                    </div>
                  )}
                </div>

                {/* Password Settings */}
                <div className="bg-card border border-white/5 rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                      <Lock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Admin Password</h3>
                      <p className="text-xs text-muted-foreground">Leave blank to keep the current password unchanged</p>
                    </div>
                  </div>

                  <FormField
                    control={settingsForm.control}
                    name="adminPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter new password (leave blank to keep current)"
                            className="bg-black/40 border-white/10 focus-visible:ring-secondary text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-8 shadow-[0_0_15px_rgba(97,155,182,0.3)]"
                    disabled={updateSettings.isPending}
                  >
                    {updateSettings.isPending ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Form Modal */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="bg-card border-white/10 text-white sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display">{editingProduct ? "Edit Product" : "New Product"}</DialogTitle>
          </DialogHeader>
          
          <Form {...productForm}>
            <form onSubmit={productForm.handleSubmit(onSubmitProduct)} className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={productForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Vaporesso XROS 3" className="bg-black/40 border-white/10 focus-visible:ring-primary text-white" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={productForm.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={(val) => field.onChange(Number(val))} 
                        defaultValue={field.value ? String(field.value) : undefined}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-black/40 border-white/10 focus:ring-primary text-white">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-card border-white/10 text-white">
                          {categories?.map((cat) => (
                            <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={productForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (PKR)</FormLabel>
                      <FormControl>
                        <Input type="number" className="bg-black/40 border-white/10 focus-visible:ring-primary text-white font-mono" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={productForm.control}
                  name="imageUrls"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Images</FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          <Input
                            type="file"
                            accept="image/*"
                            multiple
                            className="bg-black/40 border-white/10 text-white file:cursor-pointer"
                            onChange={(event) => {
                              const files = Array.from(event.target.files || []);
                              const readers = files.map((file) => {
                                return new Promise<string>((resolve) => {
                                  const reader = new FileReader();
                                  reader.onload = () => resolve(reader.result as string);
                                  reader.readAsDataURL(file);
                                });
                              });

                              Promise.all(readers).then((results) => {
                                const newUrls = [...(field.value || []), ...results.filter(Boolean)];
                                field.onChange(newUrls);
                              });
                            }}
                          />
                          <Textarea
                            placeholder="One image URL per line"
                            className="bg-black/40 border-white/10 focus-visible:ring-primary text-white min-h-[120px] resize-none"
                            value={(field.value || []).join('\n')}
                            onChange={(e) => field.onChange(e.target.value.split('\n').map((url) => url.trim()).filter(Boolean))}
                          />
                          {field.value && field.value.length > 0 && (
                            <div className="grid grid-cols-2 gap-2">
                              {field.value.map((url, index) => (
                                <div key={index} className="group relative rounded-2xl border border-white/10 overflow-hidden bg-black/20">
                                  <img src={url} alt={`preview-${index}`} className="h-24 w-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => field.onChange(field.value.filter((_: string, idx: number) => idx !== index))}
                                    className="absolute top-2 right-2 rounded-full bg-black/70 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={productForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Product description and details..." 
                        className="bg-black/40 border-white/10 focus-visible:ring-primary text-white min-h-[120px] resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-8 p-4 bg-black/40 border border-white/5 rounded-xl">
                <FormField
                  control={productForm.control}
                  name="inStock"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0">
                      <div>
                        <FormLabel className="text-base font-semibold">In Stock</FormLabel>
                        <p className="text-xs text-muted-foreground">Product is available for purchase</p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-primary"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="w-px bg-white/10" />

                <FormField
                  control={productForm.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0">
                      <div>
                        <FormLabel className="text-base font-semibold flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500 fill-current"/> Featured</FormLabel>
                        <p className="text-xs text-muted-foreground">Show in hero section tour</p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-yellow-500"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="pt-6 border-t border-white/10">
                <Button type="button" variant="ghost" onClick={() => setIsProductModalOpen(false)} className="rounded-full hover:bg-white/5 text-white">Cancel</Button>
                <Button type="submit" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(97,155,182,0.3)]" disabled={createProduct.isPending || updateProduct.isPending}>
                  {createProduct.isPending || updateProduct.isPending ? "Saving..." : "Save Product"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
