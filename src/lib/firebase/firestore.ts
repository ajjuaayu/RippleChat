
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  Unsubscribe,
  limit
} from "firebase/firestore";
import { db } from "./config";
import type { Message, UserProfile } from "@/types";

const MESSAGES_COLLECTION = "messages";

export async function sendMessage(
  text: string,
  user: UserProfile,
  isModerated: boolean = false
): Promise<void> {
  if (!user || !user.uid) {
    throw new Error("User must be authenticated to send messages.");
  }
  try {
    await addDoc(collection(db, MESSAGES_COLLECTION), {
      text: text,
      userId: user.uid,
      userName: user.displayName || user.email,
      userPhotoURL: user.photoURL,
      timestamp: serverTimestamp(),
      isModerated: isModerated,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

export function getMessagesSubscription(
  callback: (messages: Message[]) => void,
  messageLimit: number = 50
): Unsubscribe {
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    orderBy("timestamp", "desc"),
    limit(messageLimit)
  );

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const messages: Message[] = [];
      querySnapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() } as Message);
      });
      callback(messages.reverse()); // Reverse to show oldest first in array, newest at bottom of chat
    },
    (error) => {
      console.error("Error fetching messages:", error);
    }
  );

  return unsubscribe;
}
