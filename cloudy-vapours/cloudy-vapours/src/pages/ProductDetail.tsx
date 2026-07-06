import { useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  useGetProduct,
  useListProducts,
  useGetSettings,
  getGetProductQueryKey,
  getListProductsQueryKey
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, ShieldCheck, Clock, CheckCircle2, ChevronRight, Home, Package } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

// Generated images for fallbacks
import podSystemImg from "@assets/generated_images/pod-system.jpg";
import boxModImg from "@assets/generated_images/box-mod.jpg";
import disposableImg from "@assets/generated_images/disposable-vape.jpg";
import eliquidImg from "@assets/generated_images/eliquid.jpg";

export default function ProductDetail() {
  const [match, params] = useRoute("/products/:id");
  const [, navigate] = useLocation();
  const productId = params?.id ? parseInt(params.id, 10) : 0;

  const { data: product, isLoading, isError } = useGetProduct(productId, {
    query: {
      queryKey: getGetProductQueryKey(productId),
      enabled: !!productId
    }
  });

  const { data: relatedProducts } = useListProducts(
    { categoryId: product?.categoryId },
    {
      query: {
        queryKey: getListProductsQueryKey({ categoryId: product?.categoryId }),
        enabled: !!product?.categoryId
      }
    }
  );

  const { data: settings } = useGetSettings();
  const whatsappNumber = settings?.whatsappNumber ?? "923432389520";

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);

  const getFallbackImage = (categoryName?: string) => {
    const name = (categoryName || '').toLowerCase();
    if (name.includes('pod')) return podSystemImg;
    if (name.includes('mod')) return boxModImg;
    if (name.includes('disposable')) return disposableImg;
    if (name.includes('liquid') || name.includes('juice')) return eliquidImg;
    return podSystemImg;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 md:py-20 animate-in fade-in duration-500">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          <Skeleton className="aspect-square w-full rounded-3xl bg-white/5 border border-white/10" />
          <div className="space-y-6 pt-4">
            <Skeleton className="h-6 w-1/3 bg-white/5" />
            <Skeleton className="h-12 w-3/4 bg-white/5" />
            <Skeleton className="h-10 w-1/4 bg-white/5" />
            <Skeleton className="h-4 w-full bg-white/5" />
            <Skeleton className="h-4 w-full bg-white/5" />
            <Skeleton className="h-4 w-2/3 bg-white/5" />
            <Skeleton className="h-14 w-full rounded-full bg-white/5 mt-8" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto px-4 py-32 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <Package className="h-24 w-24 text-white/10 mb-6" />
        <h2 className="text-4xl font-display font-bold text-white mb-4">Product Not Found</h2>
        <p className="text-muted-foreground mb-8 text-lg">The item you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate("/products")} className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-12">
          Browse All Products
        </Button>
      </div>
    );
  }

  const imageUrl = product.imageUrl || getFallbackImage(product.categoryName);

  const filteredRelated = relatedProducts
    ?.filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen pb-24"
    >
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* Left Column - Image */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-black/40 border border-white/10 shadow-2xl">
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />

              {!product.inStock && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                  <span className="bg-destructive text-white text-xl font-bold px-6 py-3 rounded-xl shadow-2xl rotate-12 border border-white/20 uppercase tracking-widest">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="flex flex-col space-y-8">

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium uppercase tracking-wider">
              <button onClick={() => navigate("/")} className="hover:text-primary transition-colors flex items-center"><Home className="h-4 w-4 mr-1" /> Home</button>
              <ChevronRight className="h-3 w-3" />
              <button onClick={() => navigate("/products")} className="hover:text-primary transition-colors">Products</button>
              <ChevronRight className="h-3 w-3" />
              <span className="text-white truncate max-w-[200px]">{product.name}</span>
            </div>

            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
                {product.categoryName}
              </div>

              <h1 className="text-4xl md:text-5xl font-display font-black text-white leading-tight tracking-tight">
                {product.name}
              </h1>

              <div className="flex items-end gap-4">
                <div className="text-3xl md:text-4xl font-mono font-bold text-primary text-glow-slate">
                  PKR {product.price.toLocaleString()}
                </div>
                {product.inStock ? (
                  <div className="flex items-center gap-1.5 text-green-400 font-medium mb-1">
                    <CheckCircle2 className="h-5 w-5" /> In Stock
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-destructive font-medium mb-1">
                    <div className="h-2 w-2 rounded-full bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                    Out of Stock
                  </div>
                )}
              </div>
            </div>

            <Separator className="bg-white/5" />

            <div className="prose prose-invert prose-p:text-muted-foreground prose-p:leading-relaxed max-w-none">
              <p className="text-lg whitespace-pre-line">
                {product.description || "Premium quality product curated by Cloudy Vapours. Contact us for more details and specifications."}
              </p>
            </div>

            <Separator className="bg-white/5" />

            {/* Actions */}
            <div className="space-y-4">
              <Button
                className="w-full h-16 rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-lg shadow-[0_0_20px_rgba(37,211,102,0.4)] transition-all hover:shadow-[0_0_30px_rgba(37,211,102,0.6)] group overflow-hidden relative"
                onClick={() => window.open(`https://wa.me/${whatsappNumber}?text=Hi, I'm interested in buying: ${product.name} (PKR ${product.price})`, '_blank')}
                disabled={!product.inStock}
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                <MessageCircle className="mr-3 h-6 w-6 relative z-10" />
                <span className="relative z-10">Order via WhatsApp</span>
              </Button>
              <p className="text-center text-sm text-muted-foreground font-medium">
                Message us on WhatsApp to place your order directly.
              </p>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/5 text-center gap-2">
                <ShieldCheck className="h-6 w-6 text-primary" />
                <span className="text-xs font-semibold text-white/80">Authentic Product</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/5 text-center gap-2">
                <MessageCircle className="h-6 w-6 text-primary" />
                <span className="text-xs font-semibold text-white/80">WhatsApp Support</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/5 text-center gap-2">
                <Clock className="h-6 w-6 text-primary" />
                <span className="text-xs font-semibold text-white/80">Always Available</span>
              </div>
            </div>

          </div>
        </div>

        {/* You Might Also Like */}
        {filteredRelated && filteredRelated.length > 0 && (
          <div className="mt-32 pt-16 border-t border-white/5">
            <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-10 text-center">
              YOU MIGHT ALSO <span className="text-primary">LIKE</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredRelated.map((relatedProduct, i) => (
                <motion.div
                  key={relatedProduct.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <ProductCard product={relatedProduct} whatsappNumber={whatsappNumber} />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
