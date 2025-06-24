import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useCallback, useRef } from "react";
import { chatApi, streamingApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { Message, StreamMessage, ChatMessagesResponse } from "@/types/api";

// Hook for fetching chat messages
export function useChatMessages(chatId: string | null) {
  return useQuery({
    queryKey: queryKeys.chatMessages(chatId || ""),
    queryFn: () => chatApi.getChatMessages(chatId!),
    enabled: !!chatId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 3,
  });
}

// Hook for handling streaming messages
export function useStreamingMessage() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const hasReceivedDataRef = useRef<boolean>(false);
  const queryClient = useQueryClient();

  const startStream = useCallback(
    async (chatId: string, message: string) => {
      if (isStreaming) {
        console.warn(
          "Already streaming. Stop current stream before starting a new one."
        );
        return;
      }

      setIsStreaming(true);
      setStreamingContent("");
      setError(null);
      hasReceivedDataRef.current = false;

      // Add user message to cache immediately
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        chat_id: chatId,
        content: message,
        role: "user",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Optimistically update the messages cache
      queryClient.setQueryData(
        queryKeys.chatMessages(chatId),
        (oldData: ChatMessagesResponse | undefined) => {
          if (!oldData) return { messages: [userMessage] };
          return {
            ...oldData,
            messages: [...oldData.messages, userMessage],
          };
        }
      );

      try {
        const eventSource = streamingApi.createEventSource(chatId, message);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          console.log("EventSource connection opened");
        };

        eventSource.onmessage = (event: MessageEvent) => {
          console.log("EventSource received message:", event.data);
          hasReceivedDataRef.current = true; // Mark that we received data

          try {
            // First try to parse as structured JSON
            const data: StreamMessage = JSON.parse(event.data);

            switch (data.type) {
              case "chunk": {
                if (data.content) {
                  setStreamingContent((prev) => prev + data.content);
                }
                break;
              }

              case "done": {
                // Streaming is complete, add the assistant message to cache
                const assistantMessage: Message = {
                  id: `ai-${Date.now()}`,
                  chat_id: chatId,
                  content: streamingContent,
                  role: "assistant",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                };

                queryClient.setQueryData(
                  queryKeys.chatMessages(chatId),
                  (oldData: ChatMessagesResponse | undefined) => {
                    if (!oldData) return { messages: [assistantMessage] };
                    return {
                      ...oldData,
                      messages: [...oldData.messages, assistantMessage],
                    };
                  }
                );

                setIsStreaming(false);
                setStreamingContent("");
                eventSource.close();
                break;
              }

              case "error": {
                setError(data.error || "Unknown streaming error");
                setIsStreaming(false);
                eventSource.close();
                break;
              }
            }
          } catch {
            // If JSON parsing fails, treat as plain text streaming content
            console.log("Treating as plain text content:", event.data);
            setStreamingContent((prev) => prev + event.data);
          }
        };

        eventSource.onerror = (error) => {
          console.error("EventSource error:", error);
          console.error("EventSource readyState:", eventSource.readyState);

          // If we have streaming content when connection closes, save it and don't show error
          if (streamingContent.trim() || hasReceivedDataRef.current) {
            console.log(
              "Connection closed but content received, saving message..."
            );
            const assistantMessage: Message = {
              id: `ai-${Date.now()}`,
              chat_id: chatId,
              content: streamingContent,
              role: "assistant",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            queryClient.setQueryData(
              queryKeys.chatMessages(chatId),
              (oldData: ChatMessagesResponse | undefined) => {
                if (!oldData) return { messages: [assistantMessage] };
                return {
                  ...oldData,
                  messages: [...oldData.messages, assistantMessage],
                };
              }
            );

            // Don't set error if we successfully received content
            setIsStreaming(false);
            setStreamingContent("");
          } else {
            // Only show error if we didn't receive any content at all
            console.log("Connection error with no content received");
            setError("Connection error occurred");
            setIsStreaming(false);
            setStreamingContent("");
          }

          eventSource.close();
        };
      } catch (error) {
        console.error("Failed to start stream:", error);
        setError(
          error instanceof Error ? error.message : "Failed to start streaming"
        );
        setIsStreaming(false);
      }
    },
    [isStreaming, streamingContent, queryClient]
  );

  const stopStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsStreaming(false);
    setStreamingContent("");
    setError(null);
    hasReceivedDataRef.current = false;
  }, []);

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

// Hook for adding a message to a chat (for non-streaming messages)
export function useAddMessage() {
  const queryClient = useQueryClient();

  const addMessage = useCallback(
    (chatId: string, message: Message) => {
      queryClient.setQueryData(
        queryKeys.chatMessages(chatId),
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
