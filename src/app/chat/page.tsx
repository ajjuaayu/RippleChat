
import { AuthRedirect } from "@/components/auth/AuthRedirect";
import { Navbar } from "@/components/layout/Navbar";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { MessageForm } from "@/components/chat/MessageForm";
import { NewChatDialog } from "@/components/chat/NewChatDialog"; // Import the new component

export default function ChatPage() {
  return (
    <AuthRedirect>
      <div className="flex h-screen flex-col bg-gradient-to-br from-background to-secondary/50">
        <Navbar />
        <main className="flex-1 flex flex-col overflow-hidden p-0 sm:p-4">
          <div className="mb-4 px-4 sm:px-0 pt-2 sm:pt-0">
            <NewChatDialog /> {/* Add the NewChatDialog here */}
          </div>
          <div className="flex-1 flex flex-col overflow-hidden bg-card shadow-lg rounded-t-lg sm:rounded-lg">
            <ChatMessages />
            <MessageForm />
          </div>
        </main>
      </div>
    </AuthRedirect>
  );
}
