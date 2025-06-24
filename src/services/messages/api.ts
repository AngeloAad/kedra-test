import { API_CONFIG, apiRequest } from "@/lib/api-config";
import type {
  Message,
  ChatMessagesResponse,
  ChatMessagesApiResponse,
} from "./types";

export const messagesApi = {
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
