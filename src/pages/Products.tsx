import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useListProducts, useListCategories, useGetSettings, getListProductsQueryKey, getListCategoriesQueryKey } from "@/api/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X, ChevronRight, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Products() {
  const [location, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    return cat ? parseInt(cat, 10) : null;
  });
  
  const [searchQuery, setSearchQuery] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('search') ?? '';
  });

  const [sortBy, setSortBy] = useState<string>("newest");

  // Sync URL params into state if they change
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    const search = params.get('search');
    
    if (cat) {
      setSelectedCategory(parseInt(cat, 10));
    } else {
      setSelectedCategory(null);
    }
    
    if (search) {
      setSearchQuery(search);
    } else {
      setSearchQuery("");
    }
  }, [location, window.location.search]);

  const { data: categories } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() }
  });
  const { data: products, isLoading } = useListProducts(
    { categoryId: selectedCategory || undefined },
    { query: { queryKey: getListProductsQueryKey({ categoryId: selectedCategory || undefined }) } }
  );
  
  const { data: settings } = useGetSettings();
  const whatsappNumber = settings?.whatsappNumber ?? "923432389520";

  // Client-side filtering & sorting
  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];
    
    let result = [...products];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) || 
        (p.description && p.description.toLowerCase().includes(query)) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(query))
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "price-asc": return a.price - b.price;
        case "price-desc": return b.price - a.price;
        case "name-asc": return a.name.localeCompare(b.name);
        case "name-desc": return b.name.localeCompare(a.name);
        case "newest": default: return b.id - a.id; // Fallback assumes higher ID is newer
      }
    });

    return result;
  }, [products, searchQuery, sortBy]);

  const handleCategorySelect = (id: number | null) => {
    if (id) {
      navigate(`/products?category=${id}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`);
    } else {
      navigate(`/products${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`);
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
  };

  const clearFilters = () => {
    navigate("/products");
    setSearchQuery("");
    setSelectedCategory(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background pb-24"
    >
      {/* Header Section */}
      <div className="bg-card border-b border-border pt-20 pb-12 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 font-medium uppercase tracking-wider">
            <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => navigate("/")}>Home</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-semibold">Products</span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-foreground mb-4">
                ALL <span className="text-primary">PRODUCTS</span>
              </h1>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-sm font-medium">
                <Package className="h-4 w-4 text-primary" />
                <span>{filteredAndSortedProducts.length} items available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        
        {/* Toolbar */}
        <div className="flex flex-col gap-4 mb-8 bg-card p-4 sm:p-5 rounded-3xl border border-border shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Filter & sort</p>
              <div className="text-foreground text-lg font-bold">Showing {filteredAndSortedProducts.length} results</div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {(selectedCategory || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-4">
            <div className="relative w-full lg:w-1/2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Search by name, category or flavor..." 
                className="pl-11 pr-10 h-12 bg-muted border-border focus-visible:ring-primary focus-visible:border-primary rounded-2xl w-full text-foreground placeholder:text-muted-foreground/60"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => handleSearchChange("")}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="w-full lg:w-72">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-12 bg-muted border-border focus:ring-primary rounded-2xl text-foreground font-medium w-full">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground rounded-2xl">
                  <SelectItem value="newest" className="focus:bg-muted">Newest first</SelectItem>
                  <SelectItem value="price-asc" className="focus:bg-muted">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc" className="focus:bg-muted">Price: High to Low</SelectItem>
                  <SelectItem value="name-asc" className="focus:bg-muted">Name: A to Z</SelectItem>
                  <SelectItem value="name-desc" className="focus:bg-muted">Name: Z to A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-28 space-y-6">
              <div>
                <h3 className="flex items-center gap-2 text-foreground font-display font-bold mb-4 text-lg tracking-wide uppercase">
                  <Filter className="h-5 w-5 text-primary" />
                  Categories
                </h3>
                <div className="space-y-1.5">
                  <button
                    onClick={() => handleCategorySelect(null)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300",
                      selectedCategory === null 
                        ? "bg-primary text-white shadow-[0_0_15px_rgba(97,155,182,0.3)]" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span>All Products</span>
                  </button>
                  {categories?.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300",
                        selectedCategory === cat.id 
                          ? "bg-primary text-white shadow-[0_0_15px_rgba(97,155,182,0.3)]" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex flex-col gap-4">
                    <Skeleton className="aspect-square w-full rounded-2xl bg-muted" />
                    <Skeleton className="h-6 w-3/4 bg-muted" />
                    <Skeleton className="h-4 w-1/2 bg-muted" />
                    <Skeleton className="h-10 w-full rounded-full bg-muted mt-auto" />
                  </div>
                ))}
              </div>
            ) : filteredAndSortedProducts.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center border border-border rounded-3xl bg-card shadow-sm"
              >
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
                  <Search className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-display font-bold text-foreground mb-3">No matches found</h3>
                <p className="text-muted-foreground text-lg max-w-md mb-8">
                  We couldn't find anything matching your current filters. Try adjusting your search or category.
                </p>
                <Button 
                  className="rounded-full bg-primary text-white hover:bg-primary/90 font-bold px-8 h-12"
                  onClick={clearFilters}
                >
                  Clear All Filters
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredAndSortedProducts.map((product, i) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, ease: "easeOut", delay: Math.min(i * 0.05, 0.5) }}
                      key={product.id}
                    >
                      <ProductCard product={product} whatsappNumber={whatsappNumber} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </main>
        </div>
      </div>
    </motion.div>
  );
}

