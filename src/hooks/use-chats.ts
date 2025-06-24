// Tanstack
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Internal utilities
import { API_CONFIG, chatApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

// Types
import {
  UserChatsResponse,
  CreateChatResponse,
  RenameChatResponse,
} from "@/types/api";

export function useUserChats() {
  return useQuery({
    queryKey: queryKeys.userChats(),
    queryFn: () => chatApi.getUserChats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 3,
  });
}

export function useCreateChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => chatApi.createChat(name),
    onSuccess: (data: CreateChatResponse) => {
      const newChat = {
        id: data.chat_id,
        name: "New Chat",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: API_CONFIG.userId,
        tenant_id: API_CONFIG.tenantId,
      };

      // Update the chats cache to include the new chat
      queryClient.setQueryData(
        queryKeys.userChats(),
        (oldData: UserChatsResponse | undefined) => {
          if (!oldData) return { chats: [newChat] };
          return {
            ...oldData,
            chats: [newChat, ...oldData.chats],
          };
        }
      );
    },
    onError: (error) => {
      console.error("Failed to create chat:", error);
    },
  });
}

export function useDeleteChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (chatId: string) => chatApi.deleteChat(chatId),
    onSuccess: (_, chatId) => {
      // Remove the chat from the cache
      queryClient.setQueryData(
        queryKeys.userChats(),
        (oldData: UserChatsResponse | undefined) => {
          if (!oldData) return { chats: [] };
          return {
            ...oldData,
            chats: oldData.chats.filter((chat) => chat.id !== chatId),
          };
        }
      );

      // Also remove any cached messages for this chat
      queryClient.removeQueries({
        queryKey: queryKeys.chatMessages(chatId),
      });
    },
    onError: (error) => {
      console.error("Failed to delete chat:", error);
    },
  });
}

// Hook for renaming a chat
export function useRenameChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chatId, newName }: { chatId: string; newName: string }) =>
      chatApi.renameChat(chatId, newName),
    onSuccess: (data: RenameChatResponse) => {
      // Update the chat in the cache
      queryClient.setQueryData(
        queryKeys.userChats(),
        (oldData: UserChatsResponse | undefined) => {
          if (!oldData) return { chats: [data.chat] };
          return {
            ...oldData,
            chats: oldData.chats.map((chat) =>
              chat.id === data.chat.id ? data.chat : chat
            ),
          };
        }
      );
    },
    onError: (error) => {
      console.error("Failed to rename chat:", error);
    },
  });
}
