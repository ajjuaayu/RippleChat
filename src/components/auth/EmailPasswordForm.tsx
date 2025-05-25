
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { Loader2 } from "lucide-react";
// import { useRouter } from "next/navigation"; // Removed as router.push will be handled by AuthRedirect
import { doc, setDoc } from "firebase/firestore";
import type { UserProfile } from "@/types";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  displayName: z.string().optional(), // Only for signup
});

type FormData = z.infer<typeof formSchema>;

interface EmailPasswordFormProps {
  isSignUp?: boolean;
}

export function EmailPasswordForm({ isSignUp = false }: EmailPasswordFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  // const router = useRouter(); // Removed

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      if (isSignUp) {
        if (!data.displayName || data.displayName.trim() === "") {
            toast({ title: "Error", description: "Display name is required for sign up.", variant: "destructive" });
            setLoading(false);
            return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        await updateProfile(userCredential.user, { displayName: data.displayName });

        const userProfile: UserProfile = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: data.displayName,
          photoURL: userCredential.user.photoURL,
        };
        await setDoc(doc(db, "users", userCredential.user.uid), userProfile);

        toast({ title: "Success", description: "Account created successfully!" });
      } else {
        await signInWithEmailAndPassword(auth, data.email, data.password);
        toast({ title: "Success", description: "Logged in successfully!" });
      }
      // router.push("/chat"); // Removed: AuthRedirect will handle this
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {isSignUp && (
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input id="displayName" type="text" {...register("displayName")} placeholder="Your Name" />
          {errors.displayName && (
            <p className="text-sm text-destructive">{errors.displayName.message}</p>
          )}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} placeholder="you@example.com" />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register("password")} placeholder="••••••••" />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isSignUp ? "Sign Up" : "Login"}
      </Button>
    </form>
  );
}
