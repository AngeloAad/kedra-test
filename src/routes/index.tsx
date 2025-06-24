import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useCreateChat } from "@/services/chats";
import { ChatInput } from "@/components/ui/ChatInput";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const createChatMutation = useCreateChat();

  const handleStartConversation = async () => {
    if (!message.trim() || createChatMutation.isPending) return;

    const messageContent = message.trim();
    setMessage("");

    try {
      // Create a new chat with the message content as the name (truncated if too long)
      const chatName =
        messageContent.length > 50
          ? messageContent.substring(0, 50).trim() + "..."
          : messageContent;

      const result = await createChatMutation.mutateAsync(chatName);

      // Navigate to the new chat with the initial message
      navigate({
        to: "/$chatId",
        params: { chatId: result.chat_id },
        search: { initialMessage: messageContent },
      });
    } catch (error) {
      console.error("Failed to create chat:", error);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium text-gray-800 mb-4">
            Welcome to Valigate AI
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 px-4">
            Select a chat from the sidebar or create a new one to get started.
          </p>
        </div>
      </div>

      {/* Input Field  */}
      <ChatInput
        message={message}
        setMessage={setMessage}
        onSendMessage={handleStartConversation}
        placeholder="What's in your mind?..."
        disabled={createChatMutation.isPending}
        isLoading={createChatMutation.isPending}
      />
    </div>
  );
}
