import {
  ApiConfig,
  TENANT_ID,
  USER_ID,
  STREAM_USER_ID,
  CreateChatRequest,
  CreateChatResponse,
  UserChatsResponse,
  UserChatsApiResponse,
  ChatMessagesResponse,
  ChatMessagesApiResponse,
  RenameChatResponse,
  DeleteChatResponse,
  Chat,
  Message,
} from "@/types/api";

// API Configuration
const API_CONFIG: ApiConfig = {
  baseUrl: "https://chatai.valigate.io/api",
  tenantId: TENANT_ID,
  userId: USER_ID,
  streamUserId: STREAM_USER_ID,
};

// Custom error class for API errors
export class ApiException extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiException";
  }
}

// Generic fetch wrapper with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_CONFIG.baseUrl}${endpoint}`;

  const defaultHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: { ...defaultHeaders, ...options.headers },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiException(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData.code
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }
    throw new ApiException(
      error instanceof Error ? error.message : "Unknown error occurred",
      0
    );
  }
}

// API Functions
export const chatApi = {
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

  // Get messages for a chat
  getChatMessages: async (chatId: string): Promise<ChatMessagesResponse> => {
    const rawResponse = await apiRequest<ChatMessagesApiResponse>(
      `/chat/messages?chat_id=${chatId}&tenant_name=${API_CONFIG.tenantId}&user_id=${API_CONFIG.userId}`
    );

    // Transform the raw API response to match our Message interface
    const transformedMessages: Message[] = [];

    rawResponse.forEach((apiMessage, index) => {
      const isoTimestamp = apiMessage.timestamp.includes("T")
        ? apiMessage.timestamp
        : apiMessage.timestamp.replace(" ", "T") + "Z";

      // Add user message
      transformedMessages.push({
        id: `user-${chatId}-${index}`,
        chat_id: chatId,
        content: apiMessage.user_message,
        role: "user",
        created_at: isoTimestamp,
        updated_at: isoTimestamp,
      });

      // Add bot response
      transformedMessages.push({
        id: `bot-${chatId}-${index}`,
        chat_id: chatId,
        content: apiMessage.bot_response,
        role: "assistant",
        created_at: isoTimestamp,
        updated_at: isoTimestamp,
      });
    });

    transformedMessages.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    return { messages: transformedMessages };
  },
};

// Streaming API
export const streamingApi = {
  createEventSource: (chatId: string, message: string): EventSource => {
    const params = new URLSearchParams({
      chat_id: chatId,
      user_message: message, // Changed from 'message' to 'user_message' based on 422 error
      user_id: API_CONFIG.streamUserId,
      tenant_name: API_CONFIG.tenantId, // Added missing tenant_name
    });

    const url = `${API_CONFIG.baseUrl}/chat/stream?${params}`;
    console.log("Creating EventSource with URL:", url); // Debug log

    return new EventSource(url);
  },
};

export { API_CONFIG };
