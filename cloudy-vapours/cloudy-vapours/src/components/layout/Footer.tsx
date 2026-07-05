import { Link, useLocation } from "wouter";
import { useListCategories } from "@workspace/api-client-react";

export function Footer() {
  const [, navigate] = useLocation();
  const { data: categories } = useListCategories();

  return (
    <footer className="border-t border-border bg-white">
      <div className="container mx-auto px-4 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="space-y-4">
            <Link href="/">
              <span className="font-display font-black text-2xl tracking-tighter text-foreground">
                CLOUDY<span className="text-primary font-light">VAPOURS</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Pakistan's premier destination for premium vaping hardware, e-liquids, and accessories.
            </p>
            <div className="flex gap-2">
              <a
                href="https://wa.me/923432389520"
                target="_blank"
                rel="noreferrer"
                className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-foreground/60 hover:bg-[#25D366] hover:text-white transition-all text-sm font-bold"
              >
                W
              </a>
              <a
                href="mailto:s.shayan.ali520@gmail.com"
                className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-foreground/60 hover:bg-primary hover:text-white transition-all text-sm font-bold"
              >
                @
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { label: "Home", href: "/" },
                { label: "Shop All Products", href: "/products" },
                { label: "Featured", href: "/products" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="https://wa.me/923432389520"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Categories</h3>
            <ul className="space-y-2.5">
              {categories?.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => navigate(`/products?category=${cat.id}`)}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Visit Us</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="leading-relaxed">
                Shop No G1 Gohar Pride Phase 1,<br />
                Gulistan-e-Jauhar Block 14,<br />
                Karachi, Pakistan 75290
              </li>
              <li>
                <a href="tel:+923432389520" className="hover:text-primary transition-colors font-mono">
                  +92 343 2389520
                </a>
              </li>
              <li>
                <a href="mailto:s.shayan.ali520@gmail.com" className="hover:text-primary transition-colors break-all">
                  s.shayan.ali520@gmail.com
                </a>
              </li>
              <li className="font-medium text-foreground/70">Always Open — 24 / 7</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Cloudy Vapours. All rights reserved.</p>
          <p>Made with ❤️ in Karachi</p>
        </div>
      </div>
    </footer>
  );
}
