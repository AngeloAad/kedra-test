import { queryOptions } from "@tanstack/react-query";
import { chatsApi } from "./api";

// Query key factory for chats
export const chatsKeys = {
  all: ["chats"] as const,
  user: (userId: string) => [...chatsKeys.all, "user", userId] as const,
} as const;

// Query options for chats
export const chatsQueryOptions = {
  // Get all user chats
  userChats: () =>
    queryOptions({
      queryKey: chatsKeys.all,
      queryFn: () => chatsApi.getUserChats(),
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 3,
    }),
} as const;
