// Static configuration values from API documentation
export const TENANT_ID = "valigate";
export const USER_ID = "auth0|67efd0df0f83c40778e7dde2"; // For all APIs except /stream
export const STREAM_USER_ID = "a51047e3-452e-49ee-a226-1659eaa50c3c"; // For /stream API only

// Base API configuration
export interface ApiConfig {
  baseUrl: string;
  tenantId: typeof TENANT_ID;
  userId: typeof USER_ID;
  streamUserId: typeof STREAM_USER_ID;
}

// Chat Types
export interface Chat {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  tenant_id: string;
}

export interface Message {
  id: string;
  chat_id: string;
  content: string;
  role: "user" | "assistant";
  created_at: string;
  updated_at: string;
}

// API Request/Response Types
export interface CreateChatRequest {
  name: string;
}

export interface CreateChatResponse {
  chat_id: string; // API returns just the chat ID as a string
}

// Raw API response structure (what the API actually returns)
export interface ApiChatItem {
  chat_id: string;
  chat_name: string;
  timestamp_created: string;
}

export interface UserChatsResponse {
  chats: Chat[];
}

// This will be the raw response from the API
export type UserChatsApiResponse = ApiChatItem[];

export interface ChatMessagesResponse {
  messages: Message[];
}

export interface RenameChatRequest {
  chat_id: string;
  name: string;
  tenant_id: string;
  user_id: string;
}

export interface RenameChatResponse {
  success: boolean;
  chat: Chat;
}

export interface DeleteChatRequest {
  chat_id: string;
  tenant_id: string;
  user_id: string;
}

export interface DeleteChatResponse {
  success: boolean;
}

// Streaming Types
export interface StreamMessage {
  type: "chunk" | "done" | "error";
  content?: string;
  error?: string;
}

export interface SendMessageRequest {
  message: string;
  chat_id: string;
  user_id: string;
}

// Error Types
export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

// UI State Types
export interface ChatState {
  activeChat: Chat | null;
  isLoading: boolean;
  error: string | null;
}

export interface MessageState {
  isStreaming: boolean;
  streamingContent: string;
  error: string | null;
}
