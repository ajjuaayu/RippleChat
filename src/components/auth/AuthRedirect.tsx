
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
    if (loading || !isFirebaseReady) {
      return; // Wait until Firebase auth state is determined
    }

    const isLoginPage = pathname === "/login";
    const isRootPage = pathname === "/";
    // Check if it's any page under /chat, including /chat itself or /chat/[id]
    const isAnyChatPage = pathname.startsWith("/chat"); 
    const isChatLobbyPage = pathname === "/chat"; // Specifically the /chat page

    if (currentUser) {
      // User IS authenticated
      if (isLoginPage || isRootPage) {
        // If on login or root, redirect to chat lobby
        router.replace("/chat");
      }
      // If on any chat page (lobby or specific chat) or other authenticated route, render children (do nothing here)
    } else {
      // User is NOT authenticated
      if (isAnyChatPage) {
        // If trying to access any chat-related page (lobby or specific chat) without auth, redirect to login
        router.replace("/login");
      } else if (isRootPage) {
        // If on root page and not authenticated, redirect to login
        router.replace("/login");
      }
      // If on login page and not authenticated, render children (do nothing here)
    }
  }, [currentUser, loading, isFirebaseReady, pathname, router]);

  if (loading || !isFirebaseReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // More specific loading/redirecting indicators
  const isLoginPage = pathname === "/login";
  const isAnyChatPage = pathname.startsWith("/chat");

  if (currentUser && isLoginPage) {
    // User is logged in but still on login page (useEffect will redirect to /chat lobby)
    return (
     <div className="flex min-h-screen items-center justify-center bg-background">
       <Loader2 className="h-12 w-12 animate-spin text-primary" />
       <p className="ml-2 text-muted-foreground">Redirecting to chat...</p>
     </div>
   );
  }

  if (!currentUser && isAnyChatPage) {
    // User is not logged in but on a chat page (useEffect will redirect to /login)
     return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }
  
  // If none of the above loading/redirecting conditions are met, render the children.
  return <>{children}</>;
}
