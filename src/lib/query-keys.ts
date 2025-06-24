// Query key factory for consistent cache key management
export const queryKeys = {
  // Chat-related keys
  chats: {
    all: ["chats"] as const,
    user: (userId: string) => [...queryKeys.chats.all, "user", userId] as const,
  },

  // Message-related keys
  messages: {
    all: ["messages"] as const,
    chat: (chatId: string) =>
      [...queryKeys.messages.all, "chat", chatId] as const,
  },

  // Convenience methods for common patterns
  chatMessages: (chatId: string) => queryKeys.messages.chat(chatId),
  userChats: () => queryKeys.chats.all,
} as const;
