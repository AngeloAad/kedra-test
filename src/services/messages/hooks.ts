import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useCallback, useRef } from "react";
import { streamingApi } from "./api";
import { messagesKeys, messagesQueryOptions } from "./queryOptions";
import type { Message, ChatMessagesResponse } from "./types";

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
  const streamingTimeoutRef = useRef<number | null>(null);
  const lastChunkTimeRef = useRef<number>(Date.now());
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

  // Fallback: Fetch complete messages if streaming fails
  const fetchCompleteMessages = useCallback(
    async (chatId: string) => {
      try {
        console.log("Fetching complete messages as fallback...");
        await queryClient.invalidateQueries({
          queryKey: messagesKeys.chat(chatId),
        });
      } catch (error) {
        console.error("Failed to fetch complete messages:", error);
      }
    },
    [queryClient]
  );

  const cleanupStream = useCallback(
    (chatId?: string, shouldFetchFallback = false) => {
      // Clear any timeouts
      if (streamingTimeoutRef.current) {
        clearTimeout(streamingTimeoutRef.current);
        streamingTimeoutRef.current = null;
      }

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      setIsStreaming(false);
      setStreamingContent("");
      setError(null);

      // If we have partial content and should fetch fallback, do it after a short delay
      if (shouldFetchFallback && chatId && streamingContentRef.current.trim()) {
        console.log(
          "Streaming interrupted with partial content, fetching complete messages..."
        );
        setTimeout(() => {
          fetchCompleteMessages(chatId);
        }, 1000); // Wait 1 second for server to finish processing
      }
    },
    [fetchCompleteMessages]
  );

  // Monitor for streaming timeouts (no new chunks for 30 seconds)
  const resetStreamingTimeout = useCallback(
    (chatId: string) => {
      if (streamingTimeoutRef.current) {
        clearTimeout(streamingTimeoutRef.current);
      }

      streamingTimeoutRef.current = setTimeout(() => {
        console.log(
          "Streaming timeout - no new chunks received for 30 seconds"
        );

        // Save what we have and fetch complete messages
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
        }

        cleanupStream(chatId, true); // Trigger fallback fetch
      }, 30000); // 30 second timeout
    },
    [addMessageToCache, cleanupStream]
  );

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
      lastChunkTimeRef.current = Date.now();

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

        // Start timeout monitoring
        resetStreamingTimeout(chatId);

        eventSource.onopen = () => {
          console.log("EventSource connection opened");
          resetStreamingTimeout(chatId);
        };

        eventSource.onmessage = (event: MessageEvent) => {
          console.log("Received chunk:", event.data);
          lastChunkTimeRef.current = Date.now();

          // Reset timeout on every message
          resetStreamingTimeout(chatId);

          // Handle simple text streaming no JSON parsing needed
          // The event.data contains the text chunk directly
          if (event.data && event.data.trim()) {
            setStreamingContent((prev) => {
              const newContent = prev + event.data;
              streamingContentRef.current = newContent;
              return newContent;
            });
          }
        };

        eventSource.onerror = (event) => {
          console.error("EventSource error occurred:", event);
          const timeSinceLastChunk = Date.now() - lastChunkTimeRef.current;

          // If we have accumulated content, save it
          if (streamingContentRef.current.trim()) {
            console.log(
              `Saving partial content (${streamingContentRef.current.length} chars) due to connection error`
            );

            const assistantMessage: Message = {
              id: `ai-${Date.now()}`,
              chat_id: chatId,
              content: streamingContentRef.current,
              role: "assistant",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            addMessageToCache(chatId, assistantMessage);

            // If error happened soon after last chunk, likely incomplete - trigger fallback
            const shouldFetchFallback = timeSinceLastChunk < 5000; // Less than 5 seconds since last chunk
            cleanupStream(chatId, shouldFetchFallback);
          } else {
            setError("Connection error occurred");
            cleanupStream();
          }
        };

        // Handle normal end of stream
        eventSource.addEventListener("close", () => {
          console.log("Stream ended normally");

          // Save final message if we have content
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
          }

          cleanupStream();
        });
      } catch (error) {
        console.error("Failed to start stream:", error);
        setError(
          error instanceof Error ? error.message : "Failed to start streaming"
        );
        setIsStreaming(false);
      }
    },
    [isStreaming, addMessageToCache, cleanupStream, resetStreamingTimeout]
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
      if (streamingTimeoutRef.current) {
        clearTimeout(streamingTimeoutRef.current);
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
