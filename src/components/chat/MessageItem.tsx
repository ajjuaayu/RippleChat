
"use client";

import type { Message } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns'; // For relative time

interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
}

export function MessageItem({ message, isCurrentUser }: MessageItemProps) {
  const getInitials = (name?: string | null) => {
    if (!name) return message.userId.substring(0, 2).toUpperCase();
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "";
    try {
      // Firestore Timestamps might be objects with seconds and nanoseconds
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      // Fallback for potentially already formatted strings or numbers
      return new Date(timestamp).toLocaleTimeString();
    }
  };

  return (
    <div
      className={cn(
        "flex items-start space-x-3 py-3 px-2 hover:bg-muted/50 rounded-lg transition-colors duration-150 ease-in-out",
        isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      {!isCurrentUser && (
        <Avatar className="h-10 w-10 flex-shrink-0 border-2 border-secondary">
          <AvatarImage src={message.userPhotoURL || undefined} alt={message.userName || "User"} data-ai-hint="profile avatar" />
          <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
            {getInitials(message.userName)}
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-xs lg:max-w-md break-words rounded-xl px-4 py-2.5 shadow-md",
          isCurrentUser
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-card text-card-foreground rounded-bl-none"
        )}
      >
        {!isCurrentUser && (
          <p className="text-xs font-semibold text-accent mb-0.5">
            {message.userName || "Anonymous"}
          </p>
        )}
        <p className="text-sm leading-relaxed">{message.text}</p>
        <p
          className={cn(
            "mt-1 text-xs",
            isCurrentUser ? "text-primary-foreground/70 text-right" : "text-muted-foreground text-left"
          )}
        >
          {formatTimestamp(message.timestamp)}
        </p>
      </div>
      {isCurrentUser && (
         <Avatar className="h-10 w-10 flex-shrink-0 border-2 border-primary">
          <AvatarImage src={message.userPhotoURL || undefined} alt={message.userName || "User"} data-ai-hint="profile avatar" />
          <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
            {getInitials(message.userName)}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
