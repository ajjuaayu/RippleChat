
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  Unsubscribe,
  limit,
  where,
  getDocs
} from "firebase/firestore";
import { db } from "./config";
import type { Message, UserProfile } from "@/types";

const MESSAGES_COLLECTION = "messages";
const USERS_COLLECTION = "users";

export async function sendMessage(
  text: string,
  user: UserProfile, // UserProfile now includes username
  isModerated: boolean = false
): Promise<void> {
  if (!user || !user.uid) {
    throw new Error("User must be authenticated to send messages.");
  }
  try {
    await addDoc(collection(db, MESSAGES_COLLECTION), {
      text: text,
      userId: user.uid,
      userName: user.username || user.displayName || user.email, // Prioritize username
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

export async function searchUsersByUsername(
  searchTerm: string,
  currentUserId: string,
  searchLimit: number = 10
): Promise<UserProfile[]> {
  if (!searchTerm.startsWith("@") || searchTerm.length < 2) {
    // Basic validation: require '@' and at least one character after it.
    return [];
  }
  
  const usersRef = collection(db, USERS_COLLECTION);
  // Query for usernames that start with the searchTerm
  // \uf8ff is a high Unicode character that acts as an upper bound for string prefix searches
  const q = query(
    usersRef,
    where("username", ">=", searchTerm),
    where("username", "<=", searchTerm + "\uf8ff"),
    limit(searchLimit)
  );

  try {
    const querySnapshot = await getDocs(q);
    const users: UserProfile[] = [];
    querySnapshot.forEach((doc) => {
      if (doc.id !== currentUserId) { // Exclude current user from results
        users.push({ uid: doc.id, ...doc.data() } as UserProfile);
      }
    });
    return users;
  } catch (error) {
    console.error("Error searching users by username:", error);
    throw new Error("Failed to search for users.");
  }
}
