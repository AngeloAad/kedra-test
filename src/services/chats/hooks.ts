// External dependencies
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";

// Local module imports
import { chatsApi } from "./api";
import { chatsKeys, chatsQueryOptions } from "./queryOptions";
import { messagesKeys } from "../messages/queryOptions";

// Type imports
import type { UserChatsResponse, CreateChatResponse } from "./types";

// Configuration imports
import { API_CONFIG } from "@/lib/api-config";

// Helper function to update chats cache for all pagination combinations
function updateChatsCache(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (oldData: UserChatsResponse | undefined) => UserChatsResponse
) {
  // immediate cache update (optimistic)
  queryClient.setQueryData([...chatsKeys.all, 100, 1], updater);

  queryClient.invalidateQueries({ queryKey: chatsKeys.all });
}

export function useUserChats(pageSize: number = 100, pageNumber: number = 1) {
  return useQuery(chatsQueryOptions.userChats(pageSize, pageNumber));
}

export function useInfiniteUserChats(pageSize: number = 50) {
  return useInfiniteQuery({
    queryKey: [...chatsKeys.all, "infinite", pageSize],
    queryFn: ({ pageParam = 1 }) => chatsApi.getUserChats(pageSize, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.chats.length < pageSize) {
        return undefined;
      }
      return allPages.length + 1;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

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

export function useRenameChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chatId, newName }: { chatId: string; newName: string }) =>
      chatsApi.renameChat(chatId, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatsKeys.all });
    },
    onError: (error) => console.error("Failed to rename chat:", error),
  });
}
