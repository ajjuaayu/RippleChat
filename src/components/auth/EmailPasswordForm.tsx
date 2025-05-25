
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
import { doc, setDoc } from "firebase/firestore";
import type { UserProfile } from "@/types";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  displayName: z.string().optional(), // Only for signup
  username: z.string().optional(), // Only for signup
}).refine(data => {
  // Username is required only if isSignUp is true
  if (data.displayName !== undefined && (!data.username || data.username.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Username is required for sign up.",
  path: ["username"], // Point error to username field
}).refine(data => {
  if (data.username && !/^@[a-zA-Z0-9_]{3,}$/.test(data.username)) {
    return false;
  }
  return true;
}, {
  message: "Username must start with @, be at least 3 characters long (after @), and contain only letters, numbers, or underscores.",
  path: ["username"],
});


type FormData = z.infer<typeof formSchema>;

interface EmailPasswordFormProps {
  isSignUp?: boolean;
}

export function EmailPasswordForm({ isSignUp = false }: EmailPasswordFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue, // To set username for validation schema
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: isSignUp ? "" : undefined,
      username: isSignUp ? "" : undefined,
    }
  });

  // Effect to ensure validation schema reacts to isSignUp prop
  React.useEffect(() => {
    if (isSignUp) {
      setValue("displayName", "");
      setValue("username", "");
    } else {
      // @ts-ignore
      setValue("displayName", undefined);
       // @ts-ignore
      setValue("username", undefined);
    }
  }, [isSignUp, setValue]);


  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      if (isSignUp) {
        if (!data.displayName || data.displayName.trim() === "") {
            toast({ title: "Error", description: "Display name is required for sign up.", variant: "destructive" });
            setLoading(false);
            return;
        }
        if (!data.username || !/^@[a-zA-Z0-9_]{3,}$/.test(data.username)) {
          toast({ title: "Error", description: "Username must start with @, be at least 3 characters long (after @), and contain only letters, numbers, or underscores.", variant: "destructive" });
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
          username: data.username.trim(),
        };
        await setDoc(doc(db, "users", userCredential.user.uid), userProfile);

        toast({ title: "Success", description: "Account created successfully!" });
      } else {
        await signInWithEmailAndPassword(auth, data.email, data.password);
        toast({ title: "Success", description: "Logged in successfully!" });
      }
    } catch (error: any) {
      let errorMessage = error.message || "An unexpected error occurred.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already in use. Please try logging in or use a different email.";
      }
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {isSignUp && (
        <>
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input id="displayName" type="text" {...register("displayName")} placeholder="Your Full Name" />
            {errors.displayName && (
              <p className="text-sm text-destructive">{errors.displayName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" type="text" {...register("username")} placeholder="@yourusername" />
            {errors.username && (
              <p className="text-sm text-destructive">{errors.username.message}</p>
            )}
             <p className="text-xs text-muted-foreground">Must start with @, be 3+ characters, letters, numbers, or underscores.</p>
          </div>
        </>
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
