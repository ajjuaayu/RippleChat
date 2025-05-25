
"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import type { UserProfile } from "@/types";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  isFirebaseReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to generate a username if missing (e.g. for users created before username field)
const generateFallbackUsername = (displayName: string | null | undefined, email: string | null | undefined, uid: string): string => {
  let base = "";
  if (displayName) {
    base = displayName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9_]/g, '');
  } else if (email) {
    base = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
  }
  if (base.length < 3) {
    base = `user${uid.substring(0, 5)}`;
  }
   if (base.length > 15) { 
    base = base.substring(0, 15);
  }
  return `@${base}`;
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          let profileData = userDocSnap.data() as UserProfile;
          // Ensure username exists, if not, generate and save (for older users)
          if (!profileData.username) {
            profileData.username = generateFallbackUsername(profileData.displayName, profileData.email, profileData.uid);
            await setDoc(userDocRef, { username: profileData.username }, { merge: true });
          }
          setCurrentUser(profileData);
        } else {
          // This case should ideally be handled by signup flow, but as a fallback:
          const newUsername = generateFallbackUsername(user.displayName, user.email, user.uid);
          const userProfile: UserProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            username: newUsername,
          };
          await setDoc(userDocRef, userProfile, { merge: true });
          setCurrentUser(userProfile);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
      setIsFirebaseReady(true);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading, isFirebaseReady }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
