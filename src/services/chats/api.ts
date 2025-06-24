import { API_CONFIG, apiRequest } from "@/lib/api-config";
import type {
  Chat,
  CreateChatRequest,
  CreateChatResponse,
  DeleteChatResponse,
  RenameChatResponse,
  UserChatsResponse,
  UserChatsApiResponse,
} from "./types";

export const chatsApi = {
  // Get all user chats
  getUserChats: async (): Promise<UserChatsResponse> => {
    const rawResponse = await apiRequest<UserChatsApiResponse>(
      `/chat/user_chats?tenant_name=${API_CONFIG.tenantId}&user_id=${API_CONFIG.userId}`
    );

    // Transform the raw API response to match our Chat interface
    const transformedChats: Chat[] = rawResponse
      .map((apiChat) => ({
        id: apiChat.chat_id,
        name: apiChat.chat_name,
        created_at: apiChat.timestamp_created,
        updated_at: apiChat.timestamp_created, // API doesn't provide updated_at, so use created
        user_id: API_CONFIG.userId,
        tenant_id: API_CONFIG.tenantId,
      }))
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ); // Sort by newest first

    return { chats: transformedChats };
  },

  // Create new chat
  createChat: async (name: string): Promise<CreateChatResponse> => {
    const payload: CreateChatRequest = {
      name,
    };

    const queryParams = new URLSearchParams({
      user_id: API_CONFIG.userId,
      tenant_name: API_CONFIG.tenantId,
    });

    const chatId = await apiRequest<string>(`/chat?${queryParams}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return { chat_id: chatId };
  },

  // Delete chat
  deleteChat: async (chatId: string): Promise<DeleteChatResponse> => {
    const queryParams = new URLSearchParams({
      chat_id: chatId,
      tenant_name: API_CONFIG.tenantId,
      user_id: API_CONFIG.userId,
    });

    return apiRequest<DeleteChatResponse>(`/chat?${queryParams}`, {
      method: "DELETE",
    });
  },

  // Rename chat
  renameChat: async (
    chatId: string,
    newName: string
  ): Promise<RenameChatResponse> => {
    const queryParams = new URLSearchParams({
      chat_id: chatId,
      tenant_name: API_CONFIG.tenantId,
      user_id: API_CONFIG.userId,
      new_name: newName,
    });

    return apiRequest<RenameChatResponse>(`/chat/rename?${queryParams}`, {
      method: "PUT",
    });
  },
};
