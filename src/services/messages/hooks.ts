import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useCallback, useRef } from "react";
import { streamingApi } from "./api";
import { messagesKeys, messagesQueryOptions } from "./queryOptions";
import type { Message, StreamMessage, ChatMessagesResponse } from "./types";

export function useChatMessages(chatId: string | null) {
  return useQuery({
    ...messagesQueryOptions.chatMessages(chatId || ""),
    enabled: !!chatId,
  });
}

// Streaming hook with proper EventSource handling
export function useStreamingMessage() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const streamingContentRef = useRef<string>("");
  const queryClient = useQueryClient();

  // Keep ref in sync with state for reliable access in event handlers
  useEffect(() => {
    streamingContentRef.current = streamingContent;
  }, [streamingContent]);

  const addMessageToCache = useCallback(
    (chatId: string, message: Message) => {
      queryClient.setQueryData(
        messagesKeys.chat(chatId),
        (oldData: ChatMessagesResponse | undefined) => {
          if (!oldData) return { messages: [message] };
          return {
            ...oldData,
            messages: [...oldData.messages, message],
          };
        }
      );
    },
    [queryClient]
  );

  const cleanupStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsStreaming(false);
    setStreamingContent("");
    setError(null);
  }, []);

  const startStream = useCallback(
    async (chatId: string, message: string) => {
      if (isStreaming) {
        console.warn(
          "Already streaming. Stop current stream before starting a new one."
        );
        return;
      }

      // Reset state
      setIsStreaming(true);
      setStreamingContent("");
      setError(null);
      streamingContentRef.current = "";

      // Add user message immediately
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        chat_id: chatId,
        content: message,
        role: "user",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      addMessageToCache(chatId, userMessage);

      try {
        const eventSource = streamingApi.createEventSource(chatId, message);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          console.log("EventSource connection opened");
        };

        eventSource.onmessage = (event: MessageEvent) => {
          try {
            // Try parsing as structured JSON first
            const data: StreamMessage = JSON.parse(event.data);

            if (data.type === "chunk" && data.content) {
              setStreamingContent((prev) => {
                const newContent = prev + data.content;
                streamingContentRef.current = newContent;
                return newContent;
              });
            } else if (data.type === "done") {
              // Streaming complete - save final message
              const assistantMessage: Message = {
                id: `ai-${Date.now()}`,
                chat_id: chatId,
                content: streamingContentRef.current,
                role: "assistant",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };

              addMessageToCache(chatId, assistantMessage);
              cleanupStream();
            } else if (data.type === "error") {
              setError(data.error || "Streaming error occurred");
              cleanupStream();
            }
          } catch {
            // If not JSON, treat as plain text content
            setStreamingContent((prev) => {
              const newContent = prev + event.data;
              streamingContentRef.current = newContent;
              return newContent;
            });
          }
        };

        eventSource.onerror = () => {
          console.error("EventSource error occurred");

          // If we have accumulated content, save it as a message
          if (streamingContentRef.current.trim()) {
            const assistantMessage: Message = {
              id: `ai-${Date.now()}`,
              chat_id: chatId,
              content: streamingContentRef.current,
              role: "assistant",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            addMessageToCache(chatId, assistantMessage);
          } else {
            setError("Connection error occurred");
          }

          cleanupStream();
        };
      } catch (error) {
        console.error("Failed to start stream:", error);
        setError(
          error instanceof Error ? error.message : "Failed to start streaming"
        );
        setIsStreaming(false);
      }
    },
    [isStreaming, addMessageToCache, cleanupStream]
  );

  const stopStream = useCallback(() => {
    cleanupStream();
  }, [cleanupStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return {
    isStreaming,
    streamingContent,
    error,
    startStream,
    stopStream,
  };
}

// Simplified hook for adding messages
export function useAddMessage() {
  const queryClient = useQueryClient();

  const addMessage = useCallback(
    (chatId: string, message: Message) => {
      queryClient.setQueryData(
        messagesKeys.chat(chatId),
        (oldData: ChatMessagesResponse | undefined) => {
          if (!oldData) return { messages: [message] };
          return {
            ...oldData,
            messages: [...oldData.messages, message],
          };
        }
      );
    },
    [queryClient]
  );

  return { addMessage };
}

// Hook for getting the last message in a chat
export function useLastMessage(chatId: string | null) {
  const { data: messagesData } = useChatMessages(chatId);
  return messagesData?.messages?.[messagesData.messages.length - 1] || null;
}
