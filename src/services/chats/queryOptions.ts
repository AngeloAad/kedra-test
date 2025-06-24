import { queryOptions } from "@tanstack/react-query";
import { chatsApi } from "./api";

export const chatsKeys = {
  all: ["chats"] as const,
  user: (userId: string) => [...chatsKeys.all, "user", userId] as const,
} as const;

// Query options for chats
export const chatsQueryOptions = {
  userChats: (pageSize: number = 100, pageNumber: number = 1) =>
    queryOptions({
      queryKey: [...chatsKeys.all, pageSize, pageNumber],
      queryFn: () => chatsApi.getUserChats(pageSize, pageNumber),
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 3,
    }),
} as const;
