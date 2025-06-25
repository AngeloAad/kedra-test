import { queryOptions } from "@tanstack/react-query";
import { messagesApi } from "./api";

export const messagesKeys = {
  all: ["messages"] as const,
  chat: (chatId: string) => [...messagesKeys.all, "chat", chatId] as const,
} as const;

export const messagesQueryOptions = {
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
