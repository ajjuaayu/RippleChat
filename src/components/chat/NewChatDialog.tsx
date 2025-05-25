
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserSearch } from "./UserSearch";
import type { UserProfile } from "@/types";
import { MessageSquarePlus } from "lucide-react";

export function NewChatDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const handleUserSelected = (user: UserProfile) => {
    // In a real scenario, this would navigate to a chat with the user
    // or create a new chat session.
    console.log("User selected for new chat:", user);
    setIsOpen(false); // Close dialog after selection
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageSquarePlus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Start a new chat</DialogTitle>
          <DialogDescription>
            Search for users by their @username to begin a conversation.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6">
         <UserSearch onUserSelected={handleUserSelected} onCloseDialog={() => setIsOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
