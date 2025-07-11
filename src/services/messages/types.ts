export interface Message {
  id: string;
  chat_id: string;
  content: string;
  role: "user" | "assistant";
  created_at: string;
  updated_at: string;
}

export interface SendMessageRequest {
  message: string;
  chat_id: string;
  user_id: string;
}

export interface ApiMessageItem {
  user_message: string;
  bot_response: string;
  timestamp: string;
}

export type ChatMessagesApiResponse = ApiMessageItem[];

export interface ChatMessagesResponse {
  messages: Message[];
}

// UI State Types
export interface MessageState {
  isStreaming: boolean;
  streamingContent: string;
  error: string | null;
}
