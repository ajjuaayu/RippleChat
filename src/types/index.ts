import type { Timestamp } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
}

export interface Message {
  id: string;
  text: string;
  userId: string;
  userName?: string | null;
  userPhotoURL?: string | null;
  timestamp: Timestamp | Date | any; // Firestore Timestamp server-side, Date client-side or any for flexibility
  isModerated?: boolean;
}
