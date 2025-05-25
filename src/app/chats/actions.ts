
"use server";

import { z } from "zod";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc, serverTimestamp, arrayUnion } from "firebase/firestore";
import type { Chat } from "@/types";

const CreateOrGetChatSchema = z.object({
  currentUserUid: z.string().min(1, "Current user UID is required."),
  otherUserUid: z.string().min(1, "Other user UID is required."),
});

export interface CreateOrGetChatActionState {
  chatId?: string;
  error?: string;
  isNew?: boolean;
}

function generateChatId(uid1: string, uid2: string): string {
  // Ensure consistent order for the chatId
  return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
}

export async function createOrGetChatAction(
  currentUserUid: string,
  otherUserUid: string
): Promise<CreateOrGetChatActionState> {
  const validationResult = CreateOrGetChatSchema.safeParse({ currentUserUid, otherUserUid });

  if (!validationResult.success) {
    return { error: validationResult.error.errors.map((e) => e.message).join(", ") };
  }

  if (currentUserUid === otherUserUid) {
    return { error: "Cannot create a chat with yourself." };
  }

  const chatId = generateChatId(currentUserUid, otherUserUid);
  const chatDocRef = doc(db, "chats", chatId);

  try {
    const chatDocSnap = await getDoc(chatDocRef);

    if (chatDocSnap.exists()) {
      // Chat already exists
      return { chatId: chatDocSnap.id, isNew: false };
    } else {
      // Chat does not exist, create it
      const newChatData: Omit<Chat, "id"> = { // Omit 'id' as it's the doc name
        participantUids: [currentUserUid, otherUserUid],
        createdAt: serverTimestamp(),
        lastMessage: null,
        lastMessageTimestamp: null,
      };
      await setDoc(chatDocRef, newChatData);
      
      // Optional: Update user documents to list their chats (can be useful for fetching user's chat list)
      // const currentUserDocRef = doc(db, "users", currentUserUid);
      // const otherUserDocRef = doc(db, "users", otherUserUid);
      // await updateDoc(currentUserDocRef, { chatIds: arrayUnion(chatId) });
      // await updateDoc(otherUserDocRef, { chatIds: arrayUnion(chatId) });

      return { chatId, isNew: true };
    }
  } catch (error: any) {
    console.error("Error in createOrGetChatAction:", error);
    return { error: error.message || "Failed to create or get chat." };
  }
}
