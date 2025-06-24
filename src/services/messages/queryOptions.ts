import { queryOptions } from "@tanstack/react-query";
import { messagesApi } from "./api";

// Query key factory for messages
export const messagesKeys = {
  all: ["messages"] as const,
  chat: (chatId: string) => [...messagesKeys.all, "chat", chatId] as const,
} as const;

// Query options for messages
export const messagesQueryOptions = {
  // Get messages for a chat
  chatMessages: (chatId: string) =>
    queryOptions({
      queryKey: messagesKeys.chat(chatId),
      queryFn: () => messagesApi.getChatMessages(chatId),
      enabled: !!chatId,
      staleTime: 1000 * 60 * 2, // 2 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 3,
    }),
} as const;
