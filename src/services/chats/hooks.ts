import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatsApi } from "./api";
import { chatsKeys, chatsQueryOptions } from "./queryOptions";
import { messagesKeys } from "../messages/queryOptions";
import type { UserChatsResponse, CreateChatResponse } from "./types";
import { API_CONFIG } from "@/lib/api-config";

// Helper function to update chats cache
function updateChatsCache(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (oldData: UserChatsResponse | undefined) => UserChatsResponse
) {
  queryClient.setQueryData(chatsKeys.all, updater);
}

// Get all user chats
export function useUserChats() {
  return useQuery(chatsQueryOptions.userChats());
}

// Create a new chat
export function useCreateChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => chatsApi.createChat(name),
    onSuccess: (data: CreateChatResponse) => {
      const newChat = {
        id: data.chat_id,
        name: "New Chat",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: API_CONFIG.userId,
        tenant_id: API_CONFIG.tenantId,
      };

      updateChatsCache(queryClient, (oldData) => {
        if (!oldData) return { chats: [newChat] };
        return { ...oldData, chats: [newChat, ...oldData.chats] };
      });
    },
    onError: (error) => console.error("Failed to create chat:", error),
  });
}

// Delete a chat
export function useDeleteChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (chatId: string) => chatsApi.deleteChat(chatId),
    onSuccess: (_, chatId) => {
      updateChatsCache(queryClient, (oldData) => {
        if (!oldData) return { chats: [] };
        return {
          ...oldData,
          chats: oldData.chats.filter((chat) => chat.id !== chatId),
        };
      });

      // Remove cached messages for this chat
      queryClient.removeQueries({ queryKey: messagesKeys.chat(chatId) });
    },
    onError: (error) => console.error("Failed to delete chat:", error),
  });
}

// Rename a chat
export function useRenameChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chatId, newName }: { chatId: string; newName: string }) =>
      chatsApi.renameChat(chatId, newName),
    onSuccess: () => {
      // Invalidate to refetch fresh data since API doesn't return updated chat
      queryClient.invalidateQueries({ queryKey: chatsKeys.all });
    },
    onError: (error) => console.error("Failed to rename chat:", error),
  });
}
