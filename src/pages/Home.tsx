import { Suspense } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  useGetFeaturedProducts,
  useGetProductStats,
  useGetSettings,
  useListCategories,
  getGetFeaturedProductsQueryKey,
  getListCategoriesQueryKey
} from "@/api/hooks";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Phone, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import VapeDevice3D from "@/components/VapeDevice3D";

// Generated images
import podSystemImg from "@assets/generated_images/pod-system.jpg";
import boxModImg from "@assets/generated_images/box-mod.jpg";
import disposableImg from "@assets/generated_images/disposable-vape.jpg";
import eliquidImg from "@assets/generated_images/eliquid.jpg";

export default function Home() {
  const [, navigate] = useLocation();
  const { data: stats } = useGetProductStats();

  const { data: featuredProducts, isLoading: featuredLoading } = useGetFeaturedProducts({
    query: { queryKey: getGetFeaturedProductsQueryKey() }
  });

  const { data: categories } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() }
  });

  const { data: settings } = useGetSettings();
  const whatsappNumber = settings?.whatsappNumber ?? "923432389520";

  // Fallback data if API doesn't return featured products
  const displayProducts = featuredProducts?.length ? featuredProducts : [
    { id: 1, name: "Neon Pod X", price: 4500, categoryName: "Pod Systems", imageUrl: podSystemImg, description: "Premium pod system", inStock: true },
    { id: 2, name: "Storm Box Mod", price: 12000, categoryName: "Box Mods", imageUrl: boxModImg, description: "200W heavy duty mod", inStock: true },
    { id: 3, name: "Pulse 5000 Disposable", price: 2500, categoryName: "Disposables", imageUrl: disposableImg, description: "5000 puff disposable", inStock: true },
    { id: 4, name: "Midnight Berry E-Liquid", price: 3000, categoryName: "E-Liquids", imageUrl: eliquidImg, description: "100ml premium juice", inStock: true }
  ];

  const categoryGradients = [
    "from-[#4a7d96] to-[#619BB6]",
    "from-[#619BB6] to-[#BAD7E1]",
    "from-[#2d5f78] to-[#4a7d96]",
    "from-[#93c5d4] to-[#619BB6]",
  ];

  const scrollToCategories = () => {
    document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col w-full"
    >
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#eef7fa] via-white to-[#e4f2f7]">
        {/* Decorative blobs */}
        <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#BAD7E1]/25 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[450px] h-[450px] rounded-full bg-[#619BB6]/12 blur-[100px] pointer-events-none" />
        <div className="absolute top-[35%] right-[20%] w-[180px] h-[180px] rounded-full bg-[#BAD7E1]/20 blur-[50px] pointer-events-none" />

        <div className="container mx-auto px-4 flex flex-col-reverse items-center justify-between gap-12 lg:flex-row lg:items-center lg:gap-20">
        <div className="w-full max-w-2xl text-center lg:text-left">
          <span className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary shadow-sm shadow-primary/10">
            Karachi’s fastest vape boutique
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-display font-black tracking-tight text-foreground">
            Premium vape kits, authentic juices, and a smoother ordering experience.
          </h1>
          <p className="mt-5 text-base sm:text-lg leading-8 text-muted-foreground max-w-2xl mx-auto lg:mx-0">
            Shop the latest pods, box mods, disposables, and e-liquids with expert support, trusted brands and WhatsApp checkout for fast local delivery.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Button
              onClick={() => navigate("/products")}
              size="lg"
              className="rounded-full px-10 h-14 text-base font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all"
            >
              Browse Catalog
            </Button>
            <Button
              onClick={() => window.open(`https://wa.me/${whatsappNumber}`, "_blank")}
              variant="outline"
              size="lg"
              className="rounded-full px-10 h-14 text-base font-semibold border-[#25D366]/25 text-foreground hover:bg-[#25D366]/10"
            >
              WhatsApp Order
            </Button>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: ShieldCheck, title: "100% authentic", text: "Verified devices and juices." },
              { icon: Sparkles, title: "Expert guidance", text: "Choose the right setup for you." },
              { icon: Phone, title: "Instant support", text: "WhatsApp ordering and assistance." },
              { icon: MapPin, title: "Local pickup", text: "Gulistan-e-Jauhar studio access." },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="rounded-3xl border border-border bg-white/90 p-4 shadow-sm">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.text}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-full max-w-[520px] lg:max-w-[620px]">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/90 shadow-[0_30px_80px_-40px_rgba(97,155,182,0.45)] backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-[#619BB6]/10" />
            <div className="relative w-full h-[420px] sm:h-[520px]">
              <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-primary/40 text-sm font-medium">Loading…</div>}>
                <VapeDevice3D />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </section>

      {/* Trust Badges Bar */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="w-full bg-white border-y border-border py-8"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-border">
            {[
              { title: "100% Authentic", sub: "All products verified genuine" },
              { title: "WhatsApp Orders", sub: "Order in 2 clicks" },
              { title: "Always Open", sub: "We never close" },
              { title: "Karachi Based", sub: "Gulistan-e-Jauhar" }
            ].map((badge, i) => (
              <div key={i} className="flex flex-col items-center text-center px-4 py-4 md:py-0">
                <h4 className="text-foreground font-bold tracking-wide uppercase text-sm mb-1">{badge.title}</h4>
                <p className="text-muted-foreground text-xs">{badge.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Shop by Category */}
      <section id="categories" className="py-24 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h3 className="text-4xl md:text-5xl font-display font-bold text-foreground">Shop by <span className="text-primary">Category</span></h3>
            </div>
            <Link href="/products">
              <Button variant="ghost" className="rounded-full group text-foreground/60 hover:text-primary hover:bg-muted">
                Browse All <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="flex md:grid md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-x-auto pb-8 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {categories?.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ scale: 1.03 }}
                onClick={() => navigate(`/products?category=${cat.id}`)}
                className={`snap-center shrink-0 w-[260px] md:w-auto aspect-[2/3] rounded-3xl relative overflow-hidden cursor-pointer group bg-gradient-to-br ${categoryGradients[i % categoryGradients.length]} border border-white/10 hover:border-primary/50 transition-all hover:shadow-[0_0_30px_rgba(97,155,182,0.3)] flex flex-col justify-end p-8`}
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="relative z-10">
                  <h4 className="text-2xl font-display font-bold text-white mb-2">{cat.name}</h4>
                  <span className="text-white/80 font-medium text-sm flex items-center group-hover:text-white">
                    Shop Now <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="py-24 bg-muted/40 relative overflow-hidden border-y border-border">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-sm text-primary font-bold tracking-widest uppercase mb-2">Curated Selection</h2>
              <h3 className="text-4xl md:text-5xl font-display font-bold text-foreground">Featured <span className="text-primary">Products</span></h3>
            </div>
            <Link href="/products">
              <Button variant="ghost" className="rounded-full group text-foreground/60 hover:text-primary hover:bg-muted">
                View All <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <AnimatePresence mode="wait">
          {featuredLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-2xl border border-border" />
              ))}
            </motion.div>
          ) : (
            <motion.div key="featured-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayProducts?.slice(0, 8).map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <ProductCard product={product} whatsappNumber={whatsappNumber} />
                </motion.div>
              ))}
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </section>

      {/* Promotional Banner */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-12 bg-background"
      >
        <div className="container mx-auto px-4">
          <div className="w-full rounded-3xl bg-gradient-to-r from-[#BAD7E1]/30 via-white to-[#619BB6]/15 border border-primary/20 overflow-hidden relative p-10 md:p-16 flex flex-col md:flex-row items-center justify-between shadow-sm">
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-primary/8 to-transparent pointer-events-none" />
            <div className="relative z-10 max-w-2xl text-center md:text-left mb-8 md:mb-0">
              <h3 className="text-3xl md:text-4xl font-display font-black text-foreground mb-4">Looking for something specific?</h3>
              <p className="text-lg text-muted-foreground">
                Browse our full catalog of premium pods, mods, e-liquids, and accessories. Experience the best in class.
              </p>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row gap-4">
              <Button onClick={() => navigate("/products")} size="lg" className="rounded-full h-14 px-8 bg-primary hover:bg-primary/90 text-white font-bold shadow-md">
                Browse All Products
              </Button>
              <Button onClick={() => window.open(`https://wa.me/${whatsappNumber}`, '_blank')} size="lg" variant="outline" className="rounded-full h-14 px-8 border-primary/30 text-foreground hover:bg-primary/10">
                <MessageCircle className="mr-2 h-5 w-5" /> Chat on WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* About/Visit Us Section */}
      <section className="py-24 bg-background relative overflow-hidden border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto rounded-3xl border border-border bg-white p-8 md:p-12 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">Visit the <span className="text-primary">Studio</span></h2>
                <p className="text-muted-foreground leading-relaxed">
                  Located in the heart of Gulistan-e-Jauhar, our studio offers a premium sensory experience. Come test devices, explore notes, and let our experts guide you to your perfect setup.
                </p>
                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 bg-muted p-2 rounded-xl text-primary">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-foreground font-semibold mb-1">Address</h4>
                      <p className="text-sm text-muted-foreground">Shop No G1 Gohar Pride Phase 1, <br/>Gulistan-e-Jauhar Block 14, <br/>Karachi, Pakistan, 75290</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="mt-1 bg-primary/10 p-2 rounded-xl text-primary">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-foreground font-semibold mb-1">Contact</h4>
                      <p className="text-sm text-muted-foreground">0343 2389520</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center space-y-6 text-center p-8 border border-border rounded-3xl bg-muted/40">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_30px_rgba(97,155,182,0.4)]">
                  <MessageCircle className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-foreground mb-2">Need Recommendations?</h3>
                  <p className="text-sm text-muted-foreground mb-6">Message us on WhatsApp for a personalized consultation.</p>
                  <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" className="w-full block">
                    <Button className="rounded-full w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold h-14 shadow-[0_0_15px_rgba(37,211,102,0.4)]">
                      Chat on WhatsApp
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
