
"use client";

import React, { useState } from "react";
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

const MIN_DISPLAY_NAME_LENGTH = 2;
const MAX_DISPLAY_NAME_LENGTH = 50;
const MIN_USERNAME_CHARS = 3; // Characters after @
const MAX_USERNAME_CHARS = 15; // Characters after @

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  displayName: z.string().optional(),
  username: z.string().optional(),
})
.superRefine((data, ctx) => {
  // isSignUp context is determined if defaultValues has initialized displayName (even to "")
  const isSignUpMode = data.displayName !== undefined;

  if (isSignUpMode) {
    // Display Name validation for signup
    if (!data.displayName || data.displayName.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Display name is required.",
        path: ["displayName"],
      });
    } else {
      if (data.displayName.length < MIN_DISPLAY_NAME_LENGTH) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: MIN_DISPLAY_NAME_LENGTH,
          type: "string",
          inclusive: true,
          message: `Display name must be at least ${MIN_DISPLAY_NAME_LENGTH} characters.`,
          path: ["displayName"],
        });
      }
      if (data.displayName.length > MAX_DISPLAY_NAME_LENGTH) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_big,
          maximum: MAX_DISPLAY_NAME_LENGTH,
          type: "string",
          inclusive: true,
          message: `Display name can be at most ${MAX_DISPLAY_NAME_LENGTH} characters.`,
          path: ["displayName"],
        });
      }
    }

    // Username validation for signup
    if (!data.username || data.username.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Username is required.",
        path: ["username"],
      });
    } else {
      if (!data.username.startsWith('@')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Username must start with @.",
          path: ["username"],
        });
      } else {
        const usernamePart = data.username.substring(1);
        if (usernamePart.length < MIN_USERNAME_CHARS) {
          ctx.addIssue({
            code: z.ZodIssueCode.too_small,
            minimum: MIN_USERNAME_CHARS,
            type: "string",
            inclusive: true,
            message: `Username must have at least ${MIN_USERNAME_CHARS} characters after @.`,
            path: ["username"],
          });
        }
        if (usernamePart.length > MAX_USERNAME_CHARS) {
          ctx.addIssue({
            code: z.ZodIssueCode.too_big,
            maximum: MAX_USERNAME_CHARS,
            type: "string",
            inclusive: true,
            message: `Username can have at most ${MAX_USERNAME_CHARS} characters after @.`,
            path: ["username"],
          });
        }
        if (!/^[a-zA-Z0-9_]+$/.test(usernamePart)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Username can only contain letters, numbers, and underscores after @.",
            path: ["username"],
          });
        }
      }
    }
  }
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
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      displayName: isSignUp ? "" : undefined,
      username: isSignUp ? "" : undefined,
    }
  });

  React.useEffect(() => {
    // This ensures that if the form type were to dynamically switch (though it doesn't in this app)
    // or for initial setup, the correct fields are considered 'defined' for the Zod schema's refine logic.
    if (isSignUp) {
      setValue("displayName", ""); // Ensures displayName is defined for Zod refine
      setValue("username", "");   // Ensures username is defined for Zod refine
    } else {
      setValue("displayName", undefined);
      setValue("username", undefined);
    }
  }, [isSignUp, setValue]);


  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      if (isSignUp) {
        // Validation is now fully handled by Zod, direct user creation if data is valid.
        // displayName and username are asserted non-null due to Zod validation for isSignUp=true.
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        await updateProfile(userCredential.user, { displayName: data.displayName! });

        const userProfile: UserProfile = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: data.displayName!,
          photoURL: userCredential.user.photoURL,
          username: data.username!.trim(),
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
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password. Please try again.";
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
             <p className="text-xs text-muted-foreground">
              Must start with @, be {MIN_USERNAME_CHARS}-{MAX_USERNAME_CHARS} characters after @, letters, numbers, or underscores.
             </p>
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
