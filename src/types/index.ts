
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
  // Removed message.username as userName will now hold the @username for messages.
  // If we need both original displayName and @username, we can add @username separately.
  // For now, simplifying to use userName for the displayable chat name.
}
