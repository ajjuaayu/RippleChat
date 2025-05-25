
import type { Timestamp } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
  username?: string | null; // Added for @username
}

export interface Message {
  id: string;
  text: string;
  userId: string;
  userName?: string | null; // This will be the @username
  userPhotoURL?: string | null;
  timestamp: Timestamp | Date | any; // Firestore Timestamp server-side, Date client-side or any for flexibility
  isModerated?: boolean;
}

export interface Chat {
  id: string; // The chatId (e.g., uid1_uid2)
  participantUids: string[];
  // participantInfo?: { [uid: string]: { displayName?: string | null, username?: string | null, photoURL?: string | null } }; // Optional: denormalized info
  createdAt: Timestamp | Date;
  lastMessage?: string | null;
  lastMessageTimestamp?: Timestamp | Date | null;
  // unreadCounts?: { [uid: string]: number }; // Optional for unread message counts
}
