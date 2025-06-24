import { useState, useRef, useEffect, useMemo } from "react";
import { useChatMessages, useStreamingMessage } from "@/hooks/use-messages";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ChatInput } from "@/components/ui/ChatInput";
import { MessageContent } from "@/components/ui/MessageContent";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/api";

interface ChatConversationProps {
  chatId: string;
  initialMessage?: string;
}

export function ChatConversation({
  chatId,
  initialMessage,
}: ChatConversationProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messagesData, isLoading } = useChatMessages(chatId);
  const { isStreaming, streamingContent, error, startStream } =
    useStreamingMessage();

  const messages = useMemo(() => messagesData?.messages || [], [messagesData?.messages]);

  useEffect(() => {
    if (initialMessage && !isLoading && messages.length === 0 && !isStreaming) {
      startStream(chatId, initialMessage).catch(console.error);
    }
  }, [
    initialMessage,
    isLoading,
    messages.length,
    isStreaming,
    chatId,
    startStream,
  ]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const handleSendMessage = async () => {
    if (!message.trim() || isStreaming) return;

    const messageToSend = message.trim();
    setMessage("");

    try {
      await startStream(chatId, messageToSend);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {messages.length === 0 && !isStreaming ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
              <p className="text-sm">
                Send a message to begin chatting with the AI
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg: Message) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {/* Streaming message */}
            {isStreaming && (
              <div className="flex justify-start">
                <div className="max-w-[85%] sm:max-w-[80%] lg:max-w-[75%] bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 sm:px-5 py-3 sm:py-4 overflow-hidden">
                  <div className="text-sm sm:text-base leading-relaxed">
                    <MessageContent
                      content={streamingContent}
                      isUser={false}
                      className="text-gray-900 dark:text-gray-100"
                    />
                    <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse" />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-center">
                <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm">
                  Error: {error}
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Using Reusable ChatInput Component */}
      <ChatInput
        message={message}
        setMessage={setMessage}
        onSendMessage={handleSendMessage}
        placeholder="Type your message..."
        disabled={isStreaming}
        isLoading={isStreaming}
      />
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] sm:max-w-[80%] lg:max-w-[75%] rounded-2xl px-4 sm:px-5 py-3 sm:py-4 overflow-hidden",
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        )}
      >
        {!isUser && (
          <div className="text-xs sm:text-sm opacity-60 mb-1 text-gray-600 dark:text-gray-400">
            AI Assistant
          </div>
        )}
        <div className="text-sm sm:text-base leading-relaxed">
          <MessageContent
            content={message.content}
            isUser={isUser}
            className={
              isUser ? "text-white" : "text-gray-900 dark:text-gray-100"
            }
          />
        </div>
      </div>
    </div>
  );
}
