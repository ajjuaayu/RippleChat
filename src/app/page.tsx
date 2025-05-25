
import { AuthRedirect } from "@/components/auth/AuthRedirect";

export default function HomePage() {
  return (
    <AuthRedirect>
      {/* Content here will show briefly during redirect or if logic changes */}
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <h1 className="text-4xl font-bold text-primary mb-4">Welcome to RippleChat</h1>
        <p className="text-lg text-foreground">Loading your experience...</p>
      </div>
    </AuthRedirect>
  );
}
