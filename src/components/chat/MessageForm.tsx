
"use client";

import { useRef, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { sendMessageAction, type SendMessageActionState } from "@/app/chat/actions";
import { useAuth } from "@/contexts/AuthContext";
import { SendHorizonal, Loader2, ShieldAlert } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="icon" disabled={pending} className="flex-shrink-0 bg-accent hover:bg-accent/90">
      {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendHorizonal className="h-5 w-5" />}
      <span className="sr-only">Send message</span>
    </Button>
  );
}

export function MessageForm() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const initialState: SendMessageActionState | undefined = undefined;
  const [state, formAction] = useActionState(sendMessageAction, initialState);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      textAreaRef.current?.focus();
    }
    if (state?.error) {
      toast({
        title: state.moderated ? "Message Moderated" : "Error",
        description: state.error,
        variant: "destructive",
        icon: state.moderated ? <ShieldAlert className="h-5 w-5 text-destructive-foreground" /> : undefined,
      });
    }
  }, [state, toast]);

  if (!currentUser) {
    return <p className="p-4 text-center text-muted-foreground">Please log in to send messages.</p>;
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        // Add user data to formData before calling the action
        if (currentUser) {
          formData.set("user", JSON.stringify({
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            username: currentUser.username, // Include username
          }));
        }
        formAction(formData);
      }}
      className="sticky bottom-0 flex items-center space-x-2 border-t bg-background p-3 sm:p-4"
    >
      <Textarea
        ref={textAreaRef}
        name="text"
        placeholder="Type your message..."
        className="flex-1 resize-none rounded-full border-input bg-muted/50 focus-visible:ring-1 focus-visible:ring-accent px-4 py-2.5 shadow-sm"
        rows={1}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (textAreaRef.current?.value.trim() !== "" && formRef.current) {
              formRef.current.requestSubmit();
            }
          }
        }}
        required
      />
      {/* 
        The user data is now added to formData directly in the action prop's callback,
        so a hidden input is no longer strictly necessary here if we handle it like that.
        However, if we prefer declarative hidden inputs, it would be:
      <input
        type="hidden"
        name="user"
        value={JSON.stringify({
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL,
          username: currentUser.username, // Include username
        })}
      /> 
      For this change, I've opted to add it directly to formData in the action callback.
      */}
      <SubmitButton />
    </form>
  );
}
