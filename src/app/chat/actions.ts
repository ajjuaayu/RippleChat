
"use server";

import { z } from "zod";
import { moderateText } from "@/ai/flows/profanity-filter";
import { sendMessage as fbSendMessage } from "@/lib/firebase/firestore";
import type { UserProfile } from "@/types";

const MessageUserSchema = z.object({
  uid: z.string(),
  displayName: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  photoURL: z.string().optional().nullable(),
  username: z.string().optional().nullable(), // Added username
});

const MessageSchema = z.object({
  text: z.string().min(1, "Message cannot be empty.").max(500, "Message too long."),
  user: MessageUserSchema, // Use the extended user schema
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
    // Ensure the parsed user object conforms to UserProfile, which includes username
    const parsedUser = JSON.parse(rawUser);
    const validationUser = MessageUserSchema.safeParse(parsedUser);
    if (!validationUser.success) {
      throw new Error(`Invalid user data: ${validationUser.error.flatten().fieldErrors}`);
    }
    user = validationUser.data as UserProfile; // Cast to UserProfile
    if (!user.uid) throw new Error("User UID is missing.");

  } catch (e: any) {
    return { error: `Invalid user data: ${e.message}` };
  }


  const validationResult = MessageSchema.safeParse({ text: rawText, user });

  if (!validationResult.success) {
    return { error: validationResult.error.errors.map((e) => e.message).join(", ") };
  }

  const { text } = validationResult.data;

  try {
    const moderationResult = await moderateText({ text });

    if (moderationResult.isProfane) {
      return { error: `Message blocked due to: ${moderationResult.reason}. Please be respectful.`, moderated: true };
    }

    // Pass the full user object (which now includes username) to fbSendMessage
    await fbSendMessage(text, user);
    return { success: true };
  } catch (error: any) {
    console.error("Error in sendMessageAction:", error);
    return { error: error.message || "Failed to send message." };
  }
}
