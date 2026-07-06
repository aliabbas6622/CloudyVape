import { useEffect } from "react";
import { useLocation } from "wouter";
import { useGetAdminMe, getGetAdminMeQueryKey } from "@/api/hooks";

/**
 * This component is now just a redirect/wrapper.
 * The actual admin routing is handled in App.tsx using AdminRouter.
 */
export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { data: adminSession, isLoading: authLoading, isError: authError } = useGetAdminMe({
    query: { retry: false, queryKey: getGetAdminMeQueryKey() }
  });

  useEffect(() => {
    if (!authLoading && (authError || !adminSession?.authenticated)) {
      setLocation("/admin/login");
    }
  }, [authLoading, authError, adminSession, setLocation]);

  if (authLoading || !adminSession?.authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-white font-mono">
        Verifying credentials...
      </div>
    );
  }

  // Redirect to the overview if we hit /admin directly and are authenticated
  // (though AdminRouter in App.tsx usually handles this)
  return null;
}
