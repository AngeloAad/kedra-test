// Core Chat entity
export interface Chat {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  tenant_id: string;
}

// API Request/Response Types
export interface CreateChatRequest {
  name: string;
}

export interface CreateChatResponse {
  chat_id: string; // API returns just the chat ID as a string
}

export interface DeleteChatRequest {
  chat_id: string;
  tenant_id: string;
  user_id: string;
}

export interface DeleteChatResponse {
  success: boolean;
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

// UI State Types
export interface ChatState {
  activeChat: Chat | null;
  isLoading: boolean;
  error: string | null;
}
