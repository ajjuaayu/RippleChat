
"use client";

import React, { useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, UserX } from "lucide-react";
import { searchUsersAction, type SearchUsersActionState } from "@/app/users/actions";
import { UserSearchItem } from "./UserSearchItem";
import type { UserProfile } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";


interface UserSearchProps {
  onUserSelected: (user: UserProfile) => void;
  onCloseDialog?: () => void; // Optional: to close dialog after selecting user
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
  const initialState: SearchUsersActionState | undefined = undefined;
  const [state, formAction] = useActionState(searchUsersAction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.error) {
      toast({
        title: "Search Error",
        description: state.error,
        variant: "destructive",
      });
    }
  }, [state?.error, toast]);
  
  useEffect(() => {
    // Focus input when component mounts or dialog opens
    inputRef.current?.focus();
  }, []);

  const handleStartChat = (user: UserProfile) => {
    console.log("Starting chat with:", user);
    onUserSelected(user);
    if (onCloseDialog) {
      onCloseDialog();
    }
    // Actual chat creation/navigation logic will be handled elsewhere
    toast({
        title: "Chat Initiated (Placeholder)",
        description: `Would start chat with ${user.username || user.displayName}.`,
    });
  };

  return (
    <div className="flex flex-col space-y-4 p-1">
      <form
        ref={formRef}
        action={formAction}
        className="flex items-center space-x-2 sticky top-0 bg-background py-2"
      >
        <Input
          ref={inputRef}
          name="searchTerm"
          placeholder="Search by @username..."
          className="flex-1"
          defaultValue={state?.searchTerm || ""}
          required
          minLength={2}
        />
        <SearchSubmitButton />
      </form>

      {useFormStatus().pending && (!state?.users && !state?.error) && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="ml-2 text-muted-foreground">Searching...</p>
        </div>
      )}

      {state?.users && state.users.length === 0 && state.searchTerm && !useFormStatus().pending && (
        <div className="text-center py-10">
           <UserX className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <p className="font-semibold text-foreground">No users found for "{state.searchTerm}"</p>
          <p className="text-sm text-muted-foreground">Try a different username.</p>
        </div>
      )}
      
      {state?.users && state.users.length > 0 && (
        <ScrollArea className="flex-1 max-h-[calc(100vh-200px)] sm:max-h-[300px]">
          <div className="space-y-1 pr-3">
            {state.users.map((user) => (
              <UserSearchItem key={user.uid} user={user} onStartChat={handleStartChat} />
            ))}
          </div>
        </ScrollArea>
      )}

      {!state?.users && !state?.error && !useFormStatus().pending && !state?.searchTerm && (
         <div className="text-center py-10 text-muted-foreground">
          <Search className="mx-auto h-12 w-12 mb-3 opacity-50" />
          <p>Enter a username (e.g., @john) to find users.</p>
        </div>
      )}
    </div>
  );
}
