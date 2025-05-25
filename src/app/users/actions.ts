
"use server";

import { z } from "zod";
import { searchUsersByUsername as fbSearchUsersByUsername } from "@/lib/firebase/firestore";
import type { UserProfile } from "@/types";
import { auth } from "@/lib/firebase/config"; // To get current user's ID

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

  if (typeof rawSearchTerm !== 'string') {
    return { error: "Invalid search term." };
  }

  const validationResult = SearchUsersSchema.safeParse({ searchTerm: rawSearchTerm });

  if (!validationResult.success) {
    return { error: validationResult.error.errors.map((e) => e.message).join(", ") };
  }

  const { searchTerm } = validationResult.data;

  if (!searchTerm.startsWith("@")) {
    return { error: "Username search must start with '@'." };
  }
  
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return { error: "You must be logged in to search users." };
  }


  try {
    const users = await fbSearchUsersByUsername(searchTerm, currentUser.uid);
    return { users, searchTerm };
  } catch (error: any) {
    console.error("Error in searchUsersAction:", error);
    return { error: error.message || "Failed to search for users.", searchTerm };
  }
}
