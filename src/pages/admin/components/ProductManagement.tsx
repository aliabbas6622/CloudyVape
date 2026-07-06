import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useListProducts,
  useListCategories,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  getListProductsQueryKey,
  getGetProductStatsQueryKey,
} from "@/api/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Star, Search, Filter, Package, Upload, X, Link as LinkIcon, Info } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.coerce.number().min(0, "Price must be positive"),
  description: z.string().min(1, "Description is required"),
  imageUrls: z.array(z.string().url("Must be a valid URL").or(z.literal(""))).optional().default([]),
  categoryId: z.coerce.number().min(1, "Category is required"),
  featured: z.boolean().default(false),
  inStock: z.boolean().default(true),
});

export default function ProductManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Data fetching
  const { data: products, isLoading: productsLoading } = useListProducts();
  const { data: categories } = useListCategories();

  // Mutations
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  // Form
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

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    productForm.reset({
      name: product.name,
      price: product.price,
      description: product.description || "",
      imageUrls: product.imageUrls || [],
      categoryId: product.categoryId,
      featured: product.featured === 1 || product.featured === true,
      inStock: product.inStock === 1 || product.inStock === true,
    });
    setIsProductModalOpen(true);
  };

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
    const payload = {
      ...data,
      featured: data.featured ? 1 : 0,
      inStock: data.inStock ? 1 : 0,
    };

    if (editingProduct) {
      updateProduct.mutate(
        { id: editingProduct.id, data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: getGetProductStatsQueryKey() });
            toast({ title: "Product updated successfully" });
            setIsProductModalOpen(false);
          },
        }
      );
    } else {
      createProduct.mutate(
        { data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
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
          queryClient.invalidateQueries({ queryKey: ['products'] });
          queryClient.invalidateQueries({ queryKey: getGetProductStatsQueryKey() });
          toast({ title: "Product deleted" });
        },
      }
    );
  };

  const filteredProducts = products?.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Product Inventory</h2>
          <p className="text-muted-foreground mt-1">Manage and track your full range of vaping products.</p>
        </div>
        <Button onClick={handleNewProduct} className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 h-11 px-6">
          <Plus className="mr-2 h-5 w-5" /> Add New Product
        </Button>
      </div>

      <div className="bg-card border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row gap-4 bg-white/[0.02]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products or categories..."
              className="pl-10 bg-black/20 border-white/10 focus-visible:ring-primary text-white h-11 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-white/10 bg-black/20 hover:bg-white/5 text-white h-11 rounded-xl">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="bg-black/40 text-white font-mono text-xs uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5 font-semibold">Product Details</th>
                <th className="px-6 py-5 font-semibold">Category</th>
                <th className="px-6 py-5 font-semibold">Price</th>
                <th className="px-6 py-5 font-semibold">Stock Status</th>
                <th className="px-6 py-5 font-semibold">Featured</th>
                <th className="px-6 py-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts?.map((product) => (
                <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-black/40 border border-white/10 overflow-hidden shrink-0 group-hover:border-primary/50 transition-colors shadow-inner">
                        {product.imageUrls?.[0] ? (
                          <img src={product.imageUrls[0]} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-white group-hover:text-primary transition-colors text-base">{product.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">ID: #{product.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 rounded-lg px-3 py-1 font-medium">
                      {product.categoryName}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-mono text-white font-bold text-base">Rs. {product.price.toLocaleString()}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Net Price</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {product.inStock ? (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 rounded-full px-3">
                        <div className="h-1 w-1 rounded-full bg-emerald-400 mr-2 animate-pulse" />
                        Available
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 rounded-full px-3">
                        <div className="h-1 w-1 rounded-full bg-destructive mr-2" />
                        Out of Stock
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {product.featured ? (
                      <div className="flex items-center gap-2 text-amber-400 bg-amber-400/5 border border-amber-400/10 w-fit px-3 py-1 rounded-full">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Featured</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground/20">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)} className="h-9 w-9 hover:text-primary hover:bg-primary/10 rounded-lg transition-all">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-card border-white/10 text-white rounded-3xl backdrop-blur-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-2xl font-display font-bold">Delete Product?</AlertDialogTitle>
                            <AlertDialogDescription className="text-muted-foreground text-base">
                              You are about to permanently delete <span className="text-white font-bold">"{product.name}"</span>. This action cannot be reversed.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="mt-4">
                            <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5 hover:text-white rounded-xl h-11 px-6">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteProduct(product.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl h-11 px-6 font-bold">Delete Product</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
              {!productsLoading && filteredProducts?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-16 w-16 rounded-3xl bg-white/5 flex items-center justify-center text-muted-foreground/20">
                        <Package className="h-8 w-8" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-white font-bold text-lg">{searchTerm ? 'No matches found' : 'Inventory is empty'}</p>
                        <p className="text-muted-foreground text-sm max-w-[250px] mx-auto">
                          {searchTerm ? `We couldn't find any products matching "${searchTerm}". Try a different search term.` : 'Start adding products to your catalog to manage them here.'}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="bg-[#0c0e0f] border-white/10 text-white sm:max-w-3xl max-h-[95vh] overflow-y-auto rounded-[2.5rem] p-0 overflow-hidden shadow-2xl border">
          <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-primary" />

          <div className="p-8">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-3xl font-display font-bold flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  {editingProduct ? <Edit className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                </div>
                {editingProduct ? "Update Product Details" : "Create New Catalog Item"}
              </DialogTitle>
            </DialogHeader>

            <Form {...productForm}>
              <form onSubmit={productForm.handleSubmit(onSubmitProduct)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Left Column: Basic Info */}
                  <div className="space-y-6">
                    <FormField
                      control={productForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-semibold">Product Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Vaporesso XROS 3" className="bg-white/5 border-white/10 focus-visible:ring-primary text-white rounded-2xl h-12 px-4 text-base" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={productForm.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white font-semibold">Category</FormLabel>
                            <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={field.value ? String(field.value) : undefined}>
                              <FormControl>
                                <SelectTrigger className="bg-white/5 border-white/10 focus:ring-primary text-white rounded-2xl h-12 px-4">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-[#1a1d1e] border-white/10 text-white rounded-2xl p-2">
                                {categories?.map((cat) => (
                                  <SelectItem key={cat.id} value={String(cat.id)} className="rounded-xl h-10">{cat.name}</SelectItem>
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
                            <FormLabel className="text-white font-semibold">Price (PKR)</FormLabel>
                            <FormControl>
                              <Input type="number" className="bg-white/5 border-white/10 focus-visible:ring-primary text-white font-mono rounded-2xl h-12 px-4 text-base" {...field} />
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
                          <FormLabel className="text-white font-semibold">Full Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the technical specs, flavor profile, or key features..."
                              className="bg-white/5 border-white/10 focus-visible:ring-primary text-white min-h-[140px] resize-none rounded-2xl p-4 leading-relaxed"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Right Column: Visuals & Inventory */}
                  <div className="space-y-6">
                    <FormField
                      control={productForm.control}
                      name="imageUrls"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-semibold flex items-center justify-between">
                            Product Gallery
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 rounded-full px-2">
                              {field.value?.length || 0} / 8
                            </Badge>
                          </FormLabel>
                          <FormControl>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="relative group cursor-pointer">
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
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
                                        field.onChange(newUrls.slice(0, 8));
                                      });
                                    }}
                                  />
                                  <div className="h-32 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] group-hover:bg-primary/5 group-hover:border-primary/30 transition-all flex flex-col items-center justify-center gap-2">
                                    <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary">Upload</span>
                                  </div>
                                </div>

                                <div className="relative group cursor-pointer" onClick={() => {
                                  const url = window.prompt("Enter image URL:");
                                  if (url && url.startsWith('http')) {
                                    field.onChange([...(field.value || []), url].slice(0, 8));
                                  }
                                }}>
                                  <div className="h-32 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] group-hover:bg-secondary/5 group-hover:border-secondary/30 transition-all flex flex-col items-center justify-center gap-2">
                                    <LinkIcon className="h-6 w-6 text-muted-foreground group-hover:text-secondary transition-colors" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-secondary">Remote URL</span>
                                  </div>
                                </div>
                              </div>

                              {field.value && field.value.length > 0 && (
                                <div className="grid grid-cols-4 gap-2 bg-black/40 p-2 rounded-2xl border border-white/5">
                                  {field.value.map((url, index) => (
                                    <div key={index} className="group relative rounded-xl overflow-hidden bg-black aspect-square border border-white/10">
                                      <AspectRatio ratio={1}>
                                        <img src={url} alt={`Preview ${index}`} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                      </AspectRatio>
                                      <button
                                        type="button"
                                        onClick={() => field.onChange(field.value.filter((_: string, idx: number) => idx !== index))}
                                        className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all"
                                      >
                                        <X className="h-5 w-5 text-white" />
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

                    <div className="space-y-4 p-6 bg-white/[0.02] border border-white/10 rounded-3xl">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-2">
                        <Info className="h-3 w-3" /> Visibility & Stock
                      </h4>

                      <FormField
                        control={productForm.control}
                        name="inStock"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-y-0 py-2">
                            <div>
                              <FormLabel className="text-base font-bold text-white">Active Inventory</FormLabel>
                              <p className="text-xs text-muted-foreground">Enable to allow customers to order.</p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-emerald-500" />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="h-px bg-white/5" />

                      <FormField
                        control={productForm.control}
                        name="featured"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-y-0 py-2">
                            <div>
                              <FormLabel className="text-base font-bold text-white flex items-center gap-2">
                                <Star className="h-4 w-4 text-amber-400 fill-current" /> Highlighted
                              </FormLabel>
                              <p className="text-xs text-muted-foreground">Promote this item on the homepage.</p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-amber-400" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end items-center gap-4 pt-8 border-t border-white/5">
                  <Button type="button" variant="ghost" onClick={() => setIsProductModalOpen(false)} className="rounded-2xl h-14 px-8 text-muted-foreground hover:text-white hover:bg-white/5 transition-all">
                    Discard Changes
                  </Button>
                  <Button type="submit" className="rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl shadow-primary/20 px-12 h-14 font-bold text-lg" disabled={createProduct.isPending || updateProduct.isPending}>
                    {createProduct.isPending || updateProduct.isPending ? "Syncing..." : editingProduct ? "Update Catalog" : "Add to Catalog"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
