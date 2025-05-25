
"use client";

import React, { useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, UserX } from "lucide-react";
import { searchUsersAction, type SearchUsersActionState } from "@/app/users/actions";
import { createOrGetChatAction, type CreateOrGetChatActionState } from "@/app/chats/actions"; // New action
import { UserSearchItem } from "./UserSearchItem";
import type { UserProfile } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext"; // To get current user UID

interface UserSearchProps {
  onUserSelected: (user: UserProfile, chatId?: string) => void; // Pass chatId
  onCloseDialog?: () => void;
}

function SearchSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="icon" variant="ghost" disabled={pending} aria-label="Search Users">
      {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
    </Button>
  );
}

export function UserSearch({ onUserSelected, onCloseDialog }: UserSearchProps) {
  const { currentUser } = useAuth();
  const searchInitialState: SearchUsersActionState | undefined = undefined;
  const [searchState, searchFormAction] = useActionState(searchUsersAction, searchInitialState);
  
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isCreatingChat, setIsCreatingChat] = React.useState(false);

  useEffect(() => {
    if (searchState?.error) {
      toast({
        title: "Search Error",
        description: searchState.error,
        variant: "destructive",
      });
    }
  }, [searchState?.error, toast]);
  
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleStartChat = async (selectedUser: UserProfile) => {
    if (!currentUser) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    if (currentUser.uid === selectedUser.uid) {
      toast({ title: "Error", description: "You cannot start a chat with yourself.", variant: "destructive" });
      return;
    }

    setIsCreatingChat(true);
    const result: CreateOrGetChatActionState = await createOrGetChatAction(currentUser.uid, selectedUser.uid);
    setIsCreatingChat(false);

    if (result.error) {
      toast({
        title: "Chat Error",
        description: result.error,
        variant: "destructive",
      });
    } else if (result.chatId) {
      const message = result.isNew ? `New chat created with ${selectedUser.username || selectedUser.displayName}!` : `Opened existing chat with ${selectedUser.username || selectedUser.displayName}.`;
      toast({
        title: "Success",
        description: `${message} Chat ID: ${result.chatId}`,
      });
      onUserSelected(selectedUser, result.chatId); // Pass chatId back
      if (onCloseDialog) {
        onCloseDialog();
      }
    }
  };

  return (
    <div className="flex flex-col space-y-4 p-1">
      <form
        ref={formRef}
        action={searchFormAction}
        className="flex items-center space-x-2 sticky top-0 bg-background py-2"
      >
        <Input
          ref={inputRef}
          name="searchTerm"
          placeholder="Search by @username..."
          className="flex-1"
          defaultValue={searchState?.searchTerm || ""}
          required
          minLength={3} // Ensure @ + 2 chars
        />
        <SearchSubmitButton />
      </form>

      {(useFormStatus().pending || isCreatingChat) && (!searchState?.users && !searchState?.error) && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="ml-2 text-muted-foreground">{isCreatingChat ? "Setting up chat..." : "Searching..."}</p>
        </div>
      )}

      {searchState?.users && searchState.users.length === 0 && searchState.searchTerm && !useFormStatus().pending && !isCreatingChat && (
        <div className="text-center py-10">
           <UserX className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <p className="font-semibold text-foreground">No users found for "{searchState.searchTerm}"</p>
          <p className="text-sm text-muted-foreground">Try a different username.</p>
        </div>
      )}
      
      {searchState?.users && searchState.users.length > 0 && !isCreatingChat && (
        <ScrollArea className="flex-1 max-h-[calc(100vh-200px)] sm:max-h-[300px]">
          <div className="space-y-1 pr-3">
            {searchState.users.map((user) => (
              <UserSearchItem key={user.uid} user={user} onStartChat={handleStartChat} disabled={isCreatingChat} />
            ))}
          </div>
        </ScrollArea>
      )}

      {!searchState?.users && !searchState?.error && !useFormStatus().pending && !searchState?.searchTerm && !isCreatingChat && (
         <div className="text-center py-10 text-muted-foreground">
          <Search className="mx-auto h-12 w-12 mb-3 opacity-50" />
          <p>Enter a username (e.g., @john) to find users.</p>
        </div>
      )}
    </div>
  );
}
