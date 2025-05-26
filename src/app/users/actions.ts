
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
  const currentUserId = formData.get("currentUserId") as string | null;

  if (typeof rawSearchTerm !== 'string') {
    return { error: "Invalid search term." };
  }

  if (!currentUserId) {
    return { error: "You must be logged in to search users. User identifier is missing." };
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
    console.error("Error in searchUsersAction:", error);
    return { error: error.message || "Failed to search for users.", searchTerm };
  }
}
