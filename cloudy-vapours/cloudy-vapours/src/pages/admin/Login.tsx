import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAdminLogin, useGetAdminMe, getGetAdminMeQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, ShieldAlert } from "lucide-react";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: adminSession, isLoading: checkLoading } = useGetAdminMe({
    query: { retry: false, queryKey: getGetAdminMeQueryKey() }
  });

  const loginMutation = useAdminLogin();

  useEffect(() => {
    if (adminSession?.authenticated) {
      setLocation("/admin");
    }
  }, [adminSession, setLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    loginMutation.mutate({ data: { password } }, {
      onSuccess: () => {
        toast({
          title: "Access Granted",
          description: "Welcome to the admin dashboard.",
        });
        queryClient.invalidateQueries();
        setLocation("/admin");
      },
      onError: () => {
        toast({
          title: "Access Denied",
          description: "Incorrect password. Please try again.",
          variant: "destructive"
        });
        setPassword("");
      }
    });
  };

  if (checkLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-pulse w-12 h-12 rounded-full bg-primary/20 border border-primary" /></div>;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-card border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="h-16 w-16 bg-black/50 border border-primary/30 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(97,155,182,0.2)] text-primary">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">Admin Portal</h1>
            <p className="text-muted-foreground mt-2">Restricted access. Enter password to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">Admin Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 rounded-xl bg-black/40 border-white/10 focus-visible:ring-primary focus-visible:border-primary text-white h-12 text-lg font-mono"
                  autoFocus
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 rounded-full text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(97,155,182,0.3)] transition-all"
              disabled={loginMutation.isPending || !password}
            >
              {loginMutation.isPending ? "Verifying..." : "Authenticate"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
