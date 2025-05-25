
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface AuthRedirectProps {
  children: React.ReactNode;
}

export function AuthRedirect({ children }: AuthRedirectProps) {
  const { currentUser, loading, isFirebaseReady } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isFirebaseReady || loading) return; // Wait until Firebase auth state is determined

    const isAuthPage = pathname === "/login";

    if (currentUser && isAuthPage) {
      router.replace("/chat");
    } else if (!currentUser && !isAuthPage && pathname !== "/") { 
      // If not on login page or root, and not logged in, redirect to login
      // This condition needs to be careful for the root page.
      if (pathname === "/chat") { // Specifically protect /chat
         router.replace("/login");
      }
    } else if (!currentUser && pathname === "/") {
        router.replace("/login");
    } else if (currentUser && pathname === "/") {
        router.replace("/chat");
    }

  }, [currentUser, loading, router, pathname, isFirebaseReady]);

  if (loading || !isFirebaseReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // Specific handling for protected routes like /chat
  if (pathname === "/chat" && !currentUser && isFirebaseReady) {
    // Already handled by useEffect, but as a safeguard or for components that render before useEffect runs
    // This might cause a flash if router.replace hasn't finished. The useEffect should be primary.
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-2">Redirecting to login...</p>
      </div>
    );
  }


  return <>{children}</>;
}
