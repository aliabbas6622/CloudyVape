import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useGetSettings,
  useUpdateSettings,
  getGetSettingsQueryKey,
} from "@/api/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MessageCircle, Lock, ShieldCheck, Save, Globe, Smartphone, Key, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const settingsSchema = z.object({
  whatsappNumber: z.string().min(1, "WhatsApp number is required"),
  adminPassword: z.string().optional(),
});

export default function SettingsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Data fetching
  const { data: shopSettings } = useGetSettings();
  const updateSettings = useUpdateSettings();

  const settingsForm = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    values: {
      whatsappNumber: shopSettings?.whatsappNumber ?? "",
      adminPassword: "",
    },
  });

  const onSubmitSettings = (data: z.infer<typeof settingsSchema>) => {
    const payload: { whatsappNumber?: string; adminPassword?: string } = {
      whatsappNumber: data.whatsappNumber,
    };
    if (data.adminPassword && data.adminPassword.trim().length > 0) {
      payload.adminPassword = data.adminPassword;
    }
    updateSettings.mutate(
      { data: payload },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
          settingsForm.setValue("adminPassword", "");
          toast({ title: "Configuration synchronized" });
        },
        onError: () => {
          toast({ title: "Synchronization failed", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">System Configuration</h2>
          <p className="text-muted-foreground mt-1">Manage global storefront behavior and security protocols.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">System Online</span>
        </div>
      </div>

      <Form {...settingsForm}>
        <form onSubmit={settingsForm.handleSubmit(onSubmitSettings)} className="space-y-8 max-w-5xl">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* WhatsApp Integration Card */}
            <div className="bg-card border border-white/5 rounded-[2.5rem] p-10 space-y-8 backdrop-blur-xl relative overflow-hidden flex flex-col group">
              <div className="absolute -right-6 -top-6 p-8 text-[#25D366]/5 group-hover:text-[#25D366]/10 transition-all duration-700">
                <Smartphone className="h-48 w-48 rotate-12" />
              </div>

              <div className="relative z-10 flex flex-col gap-6 flex-1">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366] shadow-[0_0_20px_rgba(37,211,102,0.1)]">
                    <MessageCircle className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold text-white">WhatsApp Checkout</h3>
                    <p className="text-sm text-muted-foreground">Configure direct order redirection</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={settingsForm.control}
                    name="whatsappNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white font-semibold flex items-center gap-2">
                          Primary Business Number <Info className="h-3 w-3 text-muted-foreground" />
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <div className="h-14 flex items-center px-5 bg-white/5 border border-white/10 border-r-0 rounded-l-2xl text-muted-foreground font-mono text-sm">
                              wa.me/
                            </div>
                            <Input
                              placeholder="923432389520"
                              className="bg-white/5 border-white/10 focus-visible:ring-[#25D366] text-white font-mono h-14 rounded-l-none rounded-r-2xl px-5 text-lg"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="p-5 bg-[#25D366]/5 border border-[#25D366]/10 rounded-[1.5rem] flex items-start gap-4">
                    <div className="mt-1 h-5 w-5 rounded-full bg-[#25D366]/20 flex items-center justify-center shrink-0">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#25D366]" />
                    </div>
                    <p className="text-xs text-[#25D366]/80 leading-relaxed font-medium">
                      All "Buy Now" clicks on the storefront will initiate a message to this number pre-populated with product details.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Configuration Card */}
            <div className="bg-card border border-white/5 rounded-[2.5rem] p-10 space-y-8 backdrop-blur-xl relative overflow-hidden flex flex-col group">
              <div className="absolute -right-6 -top-6 p-8 text-primary/5 group-hover:text-primary/10 transition-all duration-700">
                <Key className="h-48 w-48 -rotate-12" />
              </div>

              <div className="relative z-10 flex flex-col gap-6 flex-1">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(97,155,182,0.1)]">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold text-white">Access Security</h3>
                    <p className="text-sm text-muted-foreground">Manage administrative credentials</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={settingsForm.control}
                    name="adminPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white font-semibold">Update Master Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                              type="password"
                              placeholder="Leave blank to keep current"
                              className="bg-white/5 border-white/10 focus-visible:ring-primary text-white h-14 rounded-2xl pl-14 pr-5 text-lg"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="p-5 bg-primary/5 border border-primary/10 rounded-[1.5rem] flex items-start gap-4">
                    <div className="mt-1 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    </div>
                    <p className="text-xs text-primary/80 leading-relaxed font-medium">
                      Ensure your password is at least 8 characters long and contains a mix of symbols and numbers for optimal security.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-8 bg-white/[0.02] border border-white/5 rounded-[2rem]">
            <div className="hidden sm:flex items-center gap-4">
               <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground">
                 <Globe className="h-5 w-5" />
               </div>
               <div className="flex flex-col">
                 <span className="text-xs font-bold text-white uppercase tracking-widest">Global Sync</span>
                 <span className="text-[10px] text-muted-foreground">Updates reflect instantly across all sessions</span>
               </div>
            </div>
            <Button
              type="submit"
              className="rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground px-12 h-14 font-bold text-lg shadow-2xl shadow-primary/20 flex-1 sm:flex-none transition-all hover:scale-[1.02] active:scale-95"
              disabled={updateSettings.isPending}
            >
              {updateSettings.isPending ? (
                "Synchronizing..."
              ) : (
                <>
                  <Save className="mr-3 h-6 w-6" /> Commit Configuration
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
