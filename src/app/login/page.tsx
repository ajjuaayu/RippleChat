
"use client";
import { AuthRedirect } from "@/components/auth/AuthRedirect";
import { EmailPasswordForm } from "@/components/auth/EmailPasswordForm";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Waves } from "lucide-react";

export default function LoginPage() {
  return (
    <AuthRedirect>
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center mb-4">
              <Waves className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold text-primary">RippleChat</CardTitle>
            <CardDescription>Connect and chat in real-time.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <div className="py-6 space-y-6">
                  <EmailPasswordForm />
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>
                  <GoogleSignInButton />
                </div>
              </TabsContent>
              <TabsContent value="signup">
                <div className="py-6 space-y-6">
                  <EmailPasswordForm isSignUp />
                   <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        Or sign up with
                      </span>
                    </div>
                  </div>
                  <GoogleSignInButton />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AuthRedirect>
  );
}
