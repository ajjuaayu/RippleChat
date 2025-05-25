
"use client";

import { useEffect, useRef, useState } from "react";
import type { Message } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { getMessagesSubscription } from "@/lib/firebase/firestore";
import { MessageItem } from "./MessageItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Ban, MessageCircle } from "lucide-react";

export function ChatMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = getMessagesSubscription((newMessages) => {
      setMessages(newMessages);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages]);

  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 space-y-4 p-4 overflow-y-auto">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`flex items-center space-x-2 ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
            {i % 2 === 0 && <Skeleton className="h-10 w-10 rounded-full" />}
            <Skeleton className={`h-16 w-48 rounded-lg ${i % 2 === 0 ? 'rounded-bl-none' : 'rounded-br-none'}`} />
            {i % 2 !== 0 && <Skeleton className="h-10 w-10 rounded-full" />}
          </div>
        ))}
      </div>
    );
  }
  
  if (!loading && messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground p-4">
        <MessageCircle className="h-16 w-16 mb-4" />
        <h3 className="text-xl font-semibold">No messages yet</h3>
        <p>Be the first to start the conversation!</p>
      </div>
    );
  }


  return (
    <ScrollArea className="flex-1 p-1 sm:p-4" ref={scrollAreaRef}>
       <div ref={viewportRef} className="h-full"> {/* This div will be the viewport for ScrollArea */}
        {messages.map((msg) => (
          <MessageItem
            key={msg.id}
            message={msg}
            isCurrentUser={currentUser?.uid === msg.userId}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
