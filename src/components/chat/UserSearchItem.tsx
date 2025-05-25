
"use client";

import type { UserProfile } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, Loader2 } from "lucide-react";

interface UserSearchItemProps {
  user: UserProfile;
  onStartChat: (user: UserProfile) => void;
  disabled?: boolean;
}

export function UserSearchItem({ user, onStartChat, disabled = false }: UserSearchItemProps) {
  const getInitials = (name?: string | null, username?: string | null) => {
    if (username && username.startsWith('@')) {
      return username.substring(1, 3).toUpperCase();
    }
    if (!name) return user.uid.substring(0, 2).toUpperCase();
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  return (
    <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
      <div className="flex items-center space-x-3">
        <Avatar className="h-10 w-10 border-2 border-secondary">
          <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.username || "User"} data-ai-hint="profile avatar" />
          <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
            {getInitials(user.displayName, user.username)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-sm text-foreground">{user.displayName || "Unnamed User"}</p>
          <p className="text-xs text-muted-foreground">{user.username || "No username"}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onStartChat(user)}
        className="text-primary hover:text-primary/90"
        disabled={disabled}
      >
        {disabled ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquarePlus className="mr-2 h-4 w-4" />}
        Chat
      </Button>
    </div>
  );
}
