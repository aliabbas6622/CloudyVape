import { Link, useLocation } from "wouter";
import { Zap, Menu, X, Search, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useGetAdminMe, useAdminLogout, getGetAdminMeQueryKey, useListCategories } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [location, navigate] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: adminSession } = useGetAdminMe({
    query: { retry: false, queryKey: getGetAdminMeQueryKey() }
  });

  const { data: categories } = useListCategories();
  const queryClient = useQueryClient();
  const logout = useAdminLogout();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout.mutate(undefined, { onSuccess: () => queryClient.invalidateQueries() });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Top info bar */}
      <div className="hidden md:block bg-primary/8 border-b border-border text-xs py-2">
        <div className="container mx-auto px-4 flex justify-between items-center text-muted-foreground">
          <span className="font-medium">📍 Shop No G1 Gohar Pride, Gulistan-e-Jauhar, Karachi</span>
          <a href="tel:+923432389520" className="font-mono font-semibold text-primary hover:text-primary/80 transition-colors">
            +92 343 2389520
          </a>
        </div>
      </div>

      {/* Main navbar */}
      <header className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300 backdrop-blur-xl border-b",
        scrolled
          ? "bg-white/95 border-border shadow-sm"
          : "bg-white/80 border-border/60"
      )}>
        <div className="container mx-auto px-4 h-18 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-sm">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-black text-xl tracking-tighter text-foreground group-hover:text-primary transition-colors">
              CLOUDY<span className="text-primary font-light">VAPOURS</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            <Link
              href="/"
              className={cn("text-sm font-semibold uppercase tracking-wide transition-colors hover:text-primary", location === "/" ? "text-primary" : "text-foreground/60")}
            >
              Home
            </Link>
            <Link
              href="/products"
              className={cn("text-sm font-semibold uppercase tracking-wide transition-colors hover:text-primary", location.startsWith("/products") ? "text-primary" : "text-foreground/60")}
            >
              Shop
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger className={cn("text-sm font-semibold uppercase tracking-wide transition-colors hover:text-primary flex items-center gap-1 outline-none", "text-foreground/60")}>
                Categories <ChevronDown className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border-border min-w-[200px] mt-2 rounded-xl shadow-lg p-1.5">
                {categories?.map((cat) => (
                  <DropdownMenuItem
                    key={cat.id}
                    className="focus:bg-muted focus:text-foreground cursor-pointer rounded-lg px-3 py-2.5 text-foreground/70 hover:text-foreground"
                    onClick={() => navigate(`/products?category=${cat.id}`)}
                  >
                    {cat.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {adminSession?.authenticated && (
              <Link
                href="/admin"
                className={cn("text-sm font-semibold uppercase tracking-wide transition-colors hover:text-primary", location.startsWith("/admin") ? "text-primary" : "text-foreground/60")}
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            {isSearchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center animate-in fade-in slide-in-from-right-4 duration-200">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-52 bg-muted border border-border rounded-full px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 pr-9"
                  autoFocus
                  onBlur={() => !searchQuery && setIsSearchOpen(false)}
                />
                <button type="submit" className="absolute right-[5.5rem] text-muted-foreground hover:text-foreground">
                  <Search className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <Search className="h-4.5 w-4.5" />
              </button>
            )}

            <Button
              className="rounded-full bg-primary hover:bg-primary/90 text-white font-semibold h-9 px-5 shadow-sm"
              onClick={() => navigate("/products")}
            >
              View Catalog
            </Button>

            {adminSession?.authenticated && (
              <Button variant="ghost" onClick={handleLogout} className="rounded-full text-muted-foreground hover:text-destructive h-9">
                Logout
              </Button>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-foreground/70 hover:text-foreground transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-white px-4 py-5 space-y-5 shadow-lg animate-in slide-in-from-top-2">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 bg-muted border border-border rounded-full pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </form>

            <nav className="space-y-1">
              {[
                { href: "/", label: "Home" },
                { href: "/products", label: "Shop All" },
                ...(adminSession?.authenticated ? [{ href: "/admin", label: "Dashboard" }] : []),
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn("block px-3 py-2.5 rounded-xl text-base font-semibold transition-colors", location === link.href ? "bg-primary/10 text-primary" : "text-foreground/70 hover:bg-muted hover:text-foreground")}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-3">Categories</p>
              <div className="space-y-0.5">
                {categories?.map((cat) => (
                  <button
                    key={cat.id}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-base text-foreground/70 hover:bg-muted hover:text-foreground transition-colors"
                    onClick={() => { navigate(`/products?category=${cat.id}`); setIsMobileMenuOpen(false); }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-border space-y-2">
              <Button
                className="w-full rounded-full bg-primary hover:bg-primary/90 text-white font-semibold h-12"
                onClick={() => { navigate("/products"); setIsMobileMenuOpen(false); }}
              >
                View Catalog
              </Button>
              {adminSession?.authenticated && (
                <Button variant="ghost" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full rounded-full text-muted-foreground hover:text-destructive">
                  Logout
                </Button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
