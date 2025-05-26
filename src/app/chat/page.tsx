
import { AuthRedirect } from "@/components/auth/AuthRedirect";
import { Navbar } from "@/components/layout/Navbar";
import { NewChatDialog } from "@/components/chat/NewChatDialog";
import { MessageSquareText } from "lucide-react"; // For placeholder icon

export default function ChatPage() {
  return (
    <AuthRedirect>
      <div className="flex h-screen flex-col bg-gradient-to-br from-background to-secondary/50">
        <Navbar />
        <main className="flex-1 flex flex-col overflow-hidden p-0 sm:p-4">
          <div className="flex-1 flex flex-col overflow-hidden bg-card shadow-lg rounded-t-lg sm:rounded-lg">
            {/* Placeholder content for when no chat is selected */}
            <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
              <MessageSquareText className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold text-foreground">Welcome to RippleChat</h2>
              <p className="text-muted-foreground">
                Select or start a new chat to begin messaging.
              </p>
              <div className="mt-6">
                <NewChatDialog />
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthRedirect>
  );
}
