
"use server";

import { z } from "zod";
import { moderateText } from "@/ai/flows/profanity-filter";
import { sendMessage as fbSendMessage } from "@/lib/firebase/firestore";
import type { UserProfile } from "@/types";

// This is a simplified way to get user info. In a real app, you might get this from a session or verify a token.
// For now, we'll pass it from the client. This is NOT secure for production without server-side session/token validation.
// However, Firebase client-side auth with Firestore rules provides security for writes.
// The server action itself should ideally verify the user making the request if not relying solely on Firestore rules.

const MessageSchema = z.object({
  text: z.string().min(1, "Message cannot be empty.").max(500, "Message too long."),
  user: z.object({ // Pass user object from client
    uid: z.string(),
    displayName: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    photoURL: z.string().optional().nullable(),
  }),
});

export interface SendMessageActionState {
  success?: boolean;
  error?: string;
  moderated?: boolean;
}

export async function sendMessageAction(
  prevState: SendMessageActionState | undefined,
  formData: FormData
): Promise<SendMessageActionState> {
  const rawText = formData.get("text");
  const rawUser = formData.get("user"); // User object as stringified JSON

  if (typeof rawText !== 'string' || typeof rawUser !== 'string') {
    return { error: "Invalid form data." };
  }
  
  let user: UserProfile;
  try {
    user = JSON.parse(rawUser) as UserProfile;
    if (!user.uid) throw new Error("User UID is missing.");
  } catch (e) {
    return { error: "Invalid user data." };
  }


  const validationResult = MessageSchema.safeParse({ text: rawText, user });

  if (!validationResult.success) {
    return { error: validationResult.error.errors.map((e) => e.message).join(", ") };
  }

  const { text } = validationResult.data;

  try {
    const moderationResult = await moderateText({ text });

    if (moderationResult.isProfane) {
      // Option 1: Block message
      return { error: `Message blocked due to: ${moderationResult.reason}. Please be respectful.`, moderated: true };
      // Option 2: Send moderated message (e.g., replace with stars)
      // await fbSendMessage("Message moderated due to profanity.", user, true);
      // return { success: true, moderated: true };
    }

    await fbSendMessage(text, user);
    return { success: true };
  } catch (error: any) {
    console.error("Error in sendMessageAction:", error);
    return { error: error.message || "Failed to send message." };
  }
}
