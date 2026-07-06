import { useState } from "react";
import {
  useListCategories,
  useCreateCategory,
  useDeleteCategory,
  useGetProductStats,
  getListCategoriesQueryKey,
  getListProductsQueryKey,
  getGetProductStatsQueryKey,
} from "@/api/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, AlertTriangle, Tags, Layers, ArrowRight, Package } from "lucide-react";
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

export default function CategoryManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Data fetching
  const { data: categories, isLoading: categoriesLoading } = useListCategories();
  const { data: stats } = useGetProductStats();

  // Mutations
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    createCategory.mutate(
      { data: { name: newCategoryName } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetProductStatsQueryKey() });
          toast({ title: "New category created" });
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
            title: "Action Restricted",
            description: "Please move or delete all products in this category before removing it.",
            variant: "destructive"
          });
        }
      }
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Taxonomy & Organization</h2>
          <p className="text-muted-foreground mt-1">Structure your store layout by managing product categories.</p>
        </div>

        <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl bg-purple-500 hover:bg-purple-600 text-white shadow-xl shadow-purple-500/10 h-12 px-8 font-bold">
              <Plus className="mr-2 h-5 w-5" /> New Category
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0c0e0f] border-white/10 text-white sm:max-w-md rounded-[2.5rem] p-8 border">
            <DialogHeader>
              <DialogTitle className="text-3xl font-display font-bold">Add Category</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCategory} className="space-y-6 pt-6">
              <div className="space-y-3">
                <Label htmlFor="catName" className="text-white font-semibold">Display Name</Label>
                <Input
                  id="catName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Premium E-Liquids"
                  className="bg-white/5 border-white/10 focus-visible:ring-purple-500 text-white h-14 rounded-2xl px-5 text-base"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground italic px-1">This name will be visible to customers on the navigation menu.</p>
              </div>
              <DialogFooter className="pt-4 flex gap-3 sm:gap-0">
                <Button type="button" variant="ghost" onClick={() => setIsCategoryModalOpen(false)} className="hover:bg-white/5 text-white rounded-2xl h-14 px-6 flex-1">Cancel</Button>
                <Button type="submit" className="bg-purple-500 hover:bg-purple-600 text-white rounded-2xl h-14 px-8 font-bold flex-1" disabled={!newCategoryName.trim() || createCategory.isPending}>
                  {createCategory.isPending ? "Creating..." : "Save Category"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories?.map((cat) => {
          const count = stats?.byCategory.find(s => s.categoryId === cat.id)?.count || 0;
          return (
            <div key={cat.id} className="bg-card border border-white/5 rounded-[2rem] p-8 flex flex-col justify-between group hover:border-purple-500/40 hover:bg-white/[0.03] transition-all relative overflow-hidden">
              <div className="absolute -right-4 -top-4 text-purple-500/5 group-hover:text-purple-500/10 transition-colors">
                <Layers className="h-32 w-32" />
              </div>

              <div className="relative z-10">
                <div className="h-14 w-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 group-hover:rotate-6 transition-transform">
                  <Tags className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-display font-bold text-white group-hover:text-purple-400 transition-colors">{cat.name}</h3>
                <div className="mt-4 flex items-center gap-2">
                  <Badge className="bg-white/5 text-muted-foreground border-white/10 rounded-full px-4 py-1 font-mono text-xs">
                    {count} Products
                  </Badge>
                  {count > 0 && (
                    <div className="h-1 w-1 rounded-full bg-purple-500/50" />
                  )}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold group-hover:text-purple-400/70 transition-colors">Taxonomy ID: {cat.id}</span>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all">
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-white/10 text-white rounded-[2rem] backdrop-blur-2xl p-8 border">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-3 text-2xl font-display font-bold text-destructive">
                        <AlertTriangle className="h-8 w-8" /> Remove Category?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground text-base mt-2">
                        You are about to delete <span className="text-white font-bold">"{cat.name}"</span>.
                        This operation will only proceed if the category is currently empty.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6 flex gap-3 sm:gap-0">
                      <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5 hover:text-white rounded-2xl h-12 flex-1">Dismiss</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteCategory(cat.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-2xl h-12 font-bold flex-1">Confirm Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          );
        })}
        {!categoriesLoading && categories?.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white/[0.02] border border-dashed border-white/10 rounded-[2.5rem]">
            <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground/30 mb-6">
              <Package className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Categories Defined</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-8 px-4">
              Categorize your inventory to help customers navigate your shop more efficiently.
            </p>
            <Button onClick={() => setIsCategoryModalOpen(true)} className="rounded-2xl bg-purple-500 hover:bg-purple-600 h-12 px-8 font-bold">
              Add Your First Category
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
