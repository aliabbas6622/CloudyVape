import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Package,
  Tags,
  Settings,
  LogOut,
  ChevronRight,
  PanelLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAdminLogout } from "@/api/hooks";
import { useToast } from "@/hooks/use-toast";

const items = [
  {
    title: "Overview",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    url: "/admin/products",
    icon: Package,
  },
  {
    title: "Categories",
    url: "/admin/categories",
    icon: Tags,
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { mutate: logout } = useAdminLogout();
  const { toast } = useToast();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        toast({ title: "Logged out successfully" });
      }
    });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background dark">
        <Sidebar collapsible="icon" className="border-r border-white/5 bg-card/50 backdrop-blur-xl">
          <SidebarHeader className="h-16 flex items-center px-4 border-b border-white/5">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <Package className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg text-white truncate group-data-[collapsible=icon]:hidden">
                CloudyVape
              </span>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-2">
            <SidebarMenu>
              {items.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "h-10 px-3 rounded-lg transition-all duration-200",
                        isActive
                          ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                          : "text-muted-foreground hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-white/5">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg group-data-[collapsible=icon]:px-2"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden font-medium">Logout</span>
            </Button>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col">
          <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-card/30 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-white" />
              <div className="h-4 w-px bg-white/10 hidden sm:block" />
              <nav className="hidden sm:flex items-center gap-2 text-sm font-medium">
                <span className="text-muted-foreground">Admin</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                <span className="text-white capitalize">
                  {items.find(i => i.url === location)?.title || "Dashboard"}
                </span>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-semibold text-white">Administrator</span>
                <span className="text-xs text-muted-foreground">Main Store</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                AD
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 lg:p-8 overflow-y-auto bg-[#030708]">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
