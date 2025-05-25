
import { AuthRedirect } from "@/components/auth/AuthRedirect";
import { Navbar } from "@/components/layout/Navbar";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { MessageForm } from "@/components/chat/MessageForm";

export default function ChatPage() {
  return (
    <AuthRedirect>
      <div className="flex h-screen flex-col bg-gradient-to-br from-background to-secondary/50">
        <Navbar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <ChatMessages />
          <MessageForm />
        </main>
      </div>
    </AuthRedirect>
  );
}
