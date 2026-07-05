import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

// Generated images for fallbacks
import podSystemImg from "@assets/generated_images/pod-system.jpg";
import boxModImg from "@assets/generated_images/box-mod.jpg";
import disposableImg from "@assets/generated_images/disposable-vape.jpg";
import eliquidImg from "@assets/generated_images/eliquid.jpg";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: number;
    description?: string;
    imageUrl?: string;
    categoryName?: string;
    featured?: boolean;
    inStock?: boolean;
  };
  whatsappNumber?: string;
  onViewDetail?: (id: number) => void;
}

export function ProductCard({ product, whatsappNumber = "923432389520", onViewDetail }: ProductCardProps) {
  const [, navigate] = useLocation();

  const getFallbackImage = (categoryName?: string) => {
    const name = (categoryName || '').toLowerCase();
    if (name.includes('pod')) return podSystemImg;
    if (name.includes('mod')) return boxModImg;
    if (name.includes('disposable')) return disposableImg;
    if (name.includes('liquid') || name.includes('juice')) return eliquidImg;
    return podSystemImg;
  };

  const imageUrl = product.imageUrl || getFallbackImage(product.categoryName);

  const handleViewDetail = () => {
    if (onViewDetail) {
      onViewDetail(product.id);
    } else {
      navigate(`/products/${product.id}`);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="group relative flex flex-col bg-white rounded-2xl border border-border overflow-hidden hover:border-primary/40 transition-all hover:shadow-[0_8px_24px_rgba(97,155,182,0.12)] cursor-pointer h-full"
      onClick={handleViewDetail}
    >
      <div className="relative aspect-square overflow-hidden bg-black/50 shrink-0">
        <img 
          src={imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {product.categoryName && (
            <div className="bg-primary/20 text-primary text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md uppercase tracking-wider border border-primary/20">
              {product.categoryName}
            </div>
          )}
        </div>

        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10 text-right">
          {product.featured && (
            <div className="bg-amber-500/90 text-white text-[10px] font-bold px-2 py-1.5 rounded shadow-lg backdrop-blur-md flex items-center gap-1 uppercase">
              <Star className="h-3 w-3 fill-current" /> Featured
            </div>
          )}
        </div>

        {!product.inStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="bg-destructive text-white text-sm font-bold px-4 py-2 rounded-lg shadow-lg rotate-12 border border-white/10 uppercase tracking-widest">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      
      <div className="p-5 flex-1 flex flex-col justify-between z-10 relative bg-white">
        <div>
          <h4 className="text-xl font-display font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">{product.name}</h4>
          <div className="font-mono text-primary font-bold text-lg mb-4">
            PKR {product.price.toLocaleString()}
          </div>
        </div>

        <div className="mt-auto pt-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 rounded-full text-xs hover:bg-muted text-muted-foreground hover:text-foreground"
            onClick={handleViewDetail}
          >
            Details
          </Button>
          <Button 
            className="flex-1 rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-xs shadow-[0_0_15px_rgba(37,211,102,0.3)] transition-all hover:shadow-[0_0_20px_rgba(37,211,102,0.5)]"
            onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${whatsappNumber}?text=Hi, I'm interested in buying: ${product.name} (PKR ${product.price})`, '_blank'); }}
            disabled={!product.inStock}
          >
            Order Now
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
