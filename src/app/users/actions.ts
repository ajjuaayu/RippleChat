
"use server";

import { z } from "zod";
import { searchUsersByUsername as fbSearchUsersByUsername } from "@/lib/firebase/firestore";
import type { UserProfile } from "@/types";

const SearchUsersSchema = z.object({
  searchTerm: z.string().min(2, "Search term must be at least 2 characters.").max(50, "Search term too long."),
});

export interface SearchUsersActionState {
  users?: UserProfile[];
  error?: string;
  searchTerm?: string;
}

export async function searchUsersAction(
  prevState: SearchUsersActionState | undefined,
  formData: FormData
): Promise<SearchUsersActionState> {
  const rawSearchTerm = formData.get("searchTerm");
  const currentUserId = formData.get("currentUserId") as string | null; // Read from hidden input

  if (typeof rawSearchTerm !== 'string') {
    return { error: "Invalid search term." };
  }

  if (!currentUserId) {
    // This check is important. UserSearch.tsx should ensure currentUserId is passed.
    return { error: "User identifier (currentUserId) is missing from the form data. You must be logged in to search users." };
  }

  const validationResult = SearchUsersSchema.safeParse({ searchTerm: rawSearchTerm });

  if (!validationResult.success) {
    return { error: validationResult.error.errors.map((e) => e.message).join(", ") };
  }

  const { searchTerm } = validationResult.data;

  if (!searchTerm.startsWith("@")) {
    return { error: "Username search must start with '@'." };
  }
  
  try {
    const users = await fbSearchUsersByUsername(searchTerm, currentUserId);
    return { users, searchTerm };
  } catch (error: any) {
    // Log the detailed error message received from fbSearchUsersByUsername
    console.error("Error in searchUsersAction:", error.message, error); 
    // Pass the potentially more detailed error message to the client
    return { error: error.message || "User search action failed. Please check server logs for more details.", searchTerm };
  }
}
