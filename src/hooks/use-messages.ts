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

        eventSource.onmessage = (event: MessageEvent) => {
          try {
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
          } catch (parseError) {
            console.error("Failed to parse streaming data:", parseError);
            setError("Failed to parse response");
            setIsStreaming(false);
            eventSource.close();
          }
        };

        eventSource.onerror = () => {
          console.error("EventSource error");
          setError("Connection error occurred");
          setIsStreaming(false);
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
