import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useEffect } from 'react';

// Pages
import Home from '@/pages/Home';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import AdminLogin from '@/pages/admin/Login';
import AdminDashboard from '@/pages/admin/Dashboard';
import NotFound from '@/pages/not-found';

// Admin Components
import AdminLayout from '@/pages/admin/components/AdminLayout';
import StatsOverview from '@/pages/admin/components/StatsOverview';
import ProductManagement from '@/pages/admin/components/ProductManagement';
import CategoryManagement from '@/pages/admin/components/CategoryManagement';
import SettingsManagement from '@/pages/admin/components/SettingsManagement';

import { useGetAdminMe, getGetAdminMeQueryKey } from '@/api/hooks';

const queryClient = new QueryClient();
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function AdminRouter() {
  const [, setLocation] = useLocation();
  const { data: adminSession, isLoading: authLoading, isError: authError } = useGetAdminMe({
    query: { retry: false, queryKey: getGetAdminMeQueryKey() }
  });

  useEffect(() => {
    if (!authLoading && (authError || !adminSession?.authenticated)) {
      setLocation("/admin/login");
    }
  }, [authLoading, authError, adminSession, setLocation]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030708] text-white font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-2 border-t-primary border-white/10 animate-spin" />
          <span className="text-sm text-muted-foreground animate-pulse">Authenticating System...</span>
        </div>
      </div>
    );
  }

  if (!adminSession?.authenticated) return null;

  return (
    <AdminLayout>
      <Switch>
        <Route path="/admin" component={StatsOverview} />
        <Route path="/admin/products" component={ProductManagement} />
        <Route path="/admin/categories" component={CategoryManagement} />
        <Route path="/admin/settings" component={SettingsManagement} />
      </Switch>
    </AdminLayout>
  );
}

function Router() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Switch>
        {/* Admin Routes (No Global Navbar/Footer) */}
        <Route path="/admin/login">
          <div className="dark min-h-screen bg-background text-foreground">
            <AdminLogin />
          </div>
        </Route>

        <Route path="/admin/:rest*">
          <div className="dark min-h-screen bg-background text-foreground">
            <AdminRouter />
          </div>
        </Route>

        {/* Storefront Routes */}
        <Route>
          <Navbar />
          <main className="flex-1">
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/products" component={Products} />
              <Route path="/products/:id" component={ProductDetail} />
              <Route component={NotFound} />
            </Switch>
          </main>
          <Footer />
        </Route>
      </Switch>
    </div>
  );
}

function App() {
  return (
    <ConvexProvider client={convex}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ConvexProvider>
  );
}

export default App;
