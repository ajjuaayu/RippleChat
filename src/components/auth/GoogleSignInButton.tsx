
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { doc, setDoc, getDoc } from "firebase/firestore";
import type { UserProfile } from "@/types";

// Simple SVG for Google icon
const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.84 0-5.22-1.9-6.08-4.44H2.31v2.84C4.07 21.07 7.75 23 12 23z" fill="#34A853"/>
    <path d="M5.92 14.41c-.21-.66-.33-1.34-.33-2.04s.12-1.38.33-2.04V7.5H2.31C1.45 9.15.99 11.01.99 12.96s.46 3.81 1.32 5.45l3.61-2.77z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.13-3.13C17.45 2.09 14.97 1 12 1 7.75 1 4.07 2.93 2.31 5.84l3.61 2.84C6.78 7.28 9.16 5.38 12 5.38z" fill="#EA4335"/>
  </svg>
);


export function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const provider = new GoogleAuthProvider();

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore, if not, create them
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        const userProfile: UserProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        };
        await setDoc(doc(db, "users", user.uid), userProfile);
      }
      
      toast({ title: "Success", description: "Logged in with Google successfully!" });
      router.push("/chat");
    } catch (error: any) {
      toast({
        title: "Google Sign-In Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" className="w-full" onClick={handleSignIn} disabled={loading}>
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <GoogleIcon />
      )}
      Sign in with Google
    </Button>
  );
}
