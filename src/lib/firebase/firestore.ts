
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
  getDocs,
  doc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "./config";
import type { Message, UserProfile, Chat } from "@/types";

const MESSAGES_COLLECTION = "messages"; // For global messages (to be phased out)
const USERS_COLLECTION = "users";
const CHATS_COLLECTION = "chats";

export async function sendMessage(
  chatId: string,
  text: string,
  user: UserProfile,
  isModerated: boolean = false
): Promise<void> {
  if (!user || !user.uid) {
    throw new Error("User must be authenticated to send messages.");
  }
  if (!chatId) {
    throw new Error("Chat ID is required to send a message.");
  }

  const chatMessagesCollectionRef = collection(
    db,
    CHATS_COLLECTION,
    chatId,
    "messages"
  );

  const batch = writeBatch(db);

  // 1. Add the new message
  const newMessageRef = doc(collection(db, CHATS_COLLECTION, chatId, "messages")); // Auto-generate ID for subcollection message
  batch.set(newMessageRef, {
    text: text,
    userId: user.uid,
    userName: user.username || user.displayName || user.email,
    userPhotoURL: user.photoURL,
    timestamp: serverTimestamp(),
    isModerated: isModerated,
  });

  // 2. Update the last message on the chat document
  const chatDocRef = doc(db, CHATS_COLLECTION, chatId);
  batch.update(chatDocRef, {
    lastMessageText: text, // Use a distinct field for the text snippet
    lastMessageTimestamp: serverTimestamp(),
  });
  
  try {
    await batch.commit();
  } catch (error) {
    console.error("Error sending message and updating chat:", error);
    throw error;
  }
}

export function getMessagesSubscription(
  chatId: string,
  callback: (messages: Message[]) => void,
  messageLimit: number = 50
): Unsubscribe {
  if (!chatId) {
    console.warn("getMessagesSubscription: chatId is undefined or empty. No messages will be fetched.");
    callback([]);
    return () => {}; // Return a no-op unsubscribe function
  }
  const messagesCollectionRef = collection(
    db,
    CHATS_COLLECTION,
    chatId,
    "messages"
  );
  const q = query(
    messagesCollectionRef,
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
      callback(messages.reverse());
    },
    (error) => {
      console.error(`Error fetching messages for chat ${chatId}:`, error);
      callback([]); // Send empty array on error to clear messages or show error state
    }
  );

  return unsubscribe;
}


export async function searchUsersByUsername(
  searchTerm: string, // Assumed to start with @
  currentUserId: string,
  searchLimit: number = 10
): Promise<UserProfile[]> {
  const usersRef = collection(db, USERS_COLLECTION);
  // Ensure search term is treated as a prefix for username
  const q = query(
    usersRef,
    where("username", ">=", searchTerm),
    where("username", "<=", searchTerm + "\uf8ff"), // \uf8ff is a very high code point in Unicode
    orderBy("username"), // Order by username for consistent prefix searching
    limit(searchLimit)
  );

  try {
    const querySnapshot = await getDocs(q);
    const users: UserProfile[] = [];
    querySnapshot.forEach((doc) => {
      if (doc.id !== currentUserId) { // Exclude current user from search results
        users.push({ uid: doc.id, ...doc.data() } as UserProfile);
      }
    });
    return users;
  } catch (error: any) {
    console.error(
      "Firestore error in fbSearchUsersByUsername. Code:", error.code,
      "Message:", error.message,
      "Full Error:", JSON.stringify(error, Object.getOwnPropertyNames(error))
    );

    let messageToThrow = error.message || `An unspecified Firestore error occurred (Code: ${error.code || 'UNKNOWN'}). Check server logs for details.`;

    if (error.code === 'permission-denied') {
      messageToThrow = "Firestore permission denied when searching users. Please verify your security rules for the 'users' collection allow reads for authenticated users.";
    } else if (error.code === 'failed-precondition' && error.message && error.message.toLowerCase().includes('index')) {
      messageToThrow = `The query for searching users requires a Firestore index. Please check the server logs or the Firebase console. The Firestore error message might contain a link to create the necessary index. Original message: ${error.message}`;
    }
    
    throw new Error(messageToThrow);
  }
}

// Function to update the last message in a chat document
export async function updateChatLastMessage(
  chatId: string,
  messageText: string,
  messageTimestamp: Timestamp | Date | any // Allow flexibility for serverTimestamp
): Promise<void> {
  const chatDocRef = doc(db, CHATS_COLLECTION, chatId);
  try {
    await updateDoc(chatDocRef, {
      lastMessageText: messageText, // Consistent field name
      lastMessageTimestamp: messageTimestamp,
    });
  } catch (error) {
    console.error(`Error updating last message for chat ${chatId}:`, error);
    // Decide if this error should be re-thrown or handled silently
  }
}
