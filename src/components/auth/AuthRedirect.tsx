
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
    // Wait until Firebase auth state is determined and not in an initial loading state.
    if (loading || !isFirebaseReady) {
      return;
    }

    const isLoginPage = pathname === "/login";
    const isChatPage = pathname === "/chat";
    const isRootPage = pathname === "/"; // The home page

    if (currentUser) {
      // User is authenticated
      if (isLoginPage || isRootPage) {
        // If on login page or root page, redirect to chat
        router.replace("/chat");
      }
      // If on chat page or any other authenticated route, render children (do nothing here)
    } else {
      // User is NOT authenticated
      if (isChatPage) {
        // If on chat page (or any other protected route that's not login/root)
        router.replace("/login");
      } else if (isRootPage) {
        // If on root page and not authenticated, redirect to login
        router.replace("/login");
      }
      // If on login page and not authenticated, render children (do nothing here)
    }
  }, [currentUser, loading, isFirebaseReady, pathname, router]);

  // Show a loading spinner while auth state is being determined initially.
  if (loading || !isFirebaseReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Show a loading spinner if a redirect is likely imminent based on current state and path.
  // This helps prevent a flash of the wrong page content.
  const isLoginPage = pathname === "/login";
  const isChatPage = pathname === "/chat";

  if (currentUser && isLoginPage) {
    // User is logged in but still on login page (useEffect will redirect to /chat)
    return (
     <div className="flex min-h-screen items-center justify-center bg-background">
       <Loader2 className="h-12 w-12 animate-spin text-primary" />
       <p className="ml-2 text-muted-foreground">Redirecting to chat...</p>
     </div>
   );
  }

  if (!currentUser && isChatPage) {
    // User is not logged in but on chat page (useEffect will redirect to /login)
     return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  // If none of the above loading/redirecting conditions are met, render the children.
  // This means:
  // - User is on /login and not logged in (show login form)
  // - User is on /chat and logged in (show chat page)
  // - User is on other pages and auth state is appropriate for that page
  return <>{children}</>;
}
