import React, { useRef, useEffect } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";

interface ChatInputProps {
  message: string;
  setMessage: (message: string) => void;
  onSendMessage: () => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export function ChatInput({
  message,
  setMessage,
  onSendMessage,
  placeholder = "Type your message...",
  disabled = false,
  isLoading = false,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea (expand upward like ChatGPT)
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the actual scrollHeight
      textarea.style.height = "auto";

      // Calculate the new height with a maximum limit
      const maxHeight = 220; // Max height in pixels
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);

      textarea.style.height = `${newHeight}px`;
    }
  }, [message]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
    // Allow Shift+Enter for new lines - don't prevent default
  };

  const handleSend = () => {
    onSendMessage();

    // Reset textarea height after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <div className="pb-4 sm:pb-6 lg:pb-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="relative">
          <div className="flex items-end bg-gray-50 border border-gray-200 rounded-2xl sm:rounded-3xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm hover:shadow-md transition-shadow">
            {/* Brain Icon */}
            <div className="mr-2 sm:mr-3 flex-shrink-0 self-end pb-1">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-pink-100 rounded-full flex items-center justify-center">
                <span className="text-base sm:text-lg">🧠</span>
              </div>
            </div>

            {/* Input */}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="flex-1 bg-transparent text-gray-700 placeholder-gray-400 text-sm sm:text-base focus:outline-none disabled:opacity-50 resize-none min-h-[28px] max-h-[220px] overflow-y-auto py-1"
              rows={1}
              style={{
                height: "auto",
                minHeight: "28px",
                lineHeight: "1.5",
              }}
            />

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!message.trim() || disabled}
              className="ml-2 sm:ml-3 w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300
              rounded-full flex items-center justify-center transition-colors disabled:cursor-not-allowed flex-shrink-0 self-end pb-1"
            >
              {isLoading ? (
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <PaperAirplaneIcon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              )}
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2 text-center hidden sm:block">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
}
