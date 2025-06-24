import { useParams, useNavigate } from "@tanstack/react-router";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useUserChats, useRenameChat, useDeleteChat } from "@/services/chats";
import { ChatListItem } from "@/components/sidebar/ChatListItem";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { Chat } from "@/services/chats";

interface ChatSidebarProps {
  onCloseSidebar?: () => void;
}

export function ChatSidebar({ onCloseSidebar }: ChatSidebarProps = {}) {
  const { chatId } = useParams({ strict: false });
  const navigate = useNavigate();

  // Check if we're on the root page
  const isOnRootPage = !chatId;

  const { data: chatsData, isLoading, error } = useUserChats();
  const { mutate: renameChat } = useRenameChat();
  const { mutate: deleteChat } = useDeleteChat();

  const filteredChats = chatsData?.chats || [];

  // Group chats by time periods
  const groupChatsByTime = (chats: Chat[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const groups = {
      today: [] as Chat[],
      yesterday: [] as Chat[],
      lastWeek: [] as Chat[],
      lastMonth: [] as Chat[],
      older: [] as Chat[],
    };

    chats.forEach((chat) => {
      const chatDate = new Date(chat.created_at);
      if (chatDate >= today) {
        groups.today.push(chat);
      } else if (chatDate >= yesterday) {
        groups.yesterday.push(chat);
      } else if (chatDate >= lastWeek) {
        groups.lastWeek.push(chat);
      } else if (chatDate >= lastMonth) {
        groups.lastMonth.push(chat);
      } else {
        groups.older.push(chat);
      }
    });

    return groups;
  };

  const chatGroups = groupChatsByTime(filteredChats);

  const renderChatGroup = (chats: Chat[]) => {
    return chats.map((chat: Chat) => (
      <ChatListItem
        key={chat.id}
        chat={chat}
        isActive={chat.id === chatId}
        onRename={(chatId, newName) => {
          renameChat({ chatId, newName });
        }}
        onDelete={(deleteChatId) => {
          if (deleteChatId === chatId) {
            navigate({ to: "/" });
          }
          deleteChat(deleteChatId);
        }}
      />
    ));
  };

  const handleNewChat = async () => {
    // If we're on a chat page, just navigate to root
    if (!isOnRootPage) {
      navigate({ to: "/" });
      return;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-gray-900">Valigate AI</h1>
          {/* Close button for mobile */}
          {onCloseSidebar && (
            <button
              onClick={onCloseSidebar}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Close sidebar</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          )}
        </div>

        <button
          onClick={handleNewChat}
          disabled={isOnRootPage}
          className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-left rounded-full transition-colors font-medium text-sm sm:text-base ${
            isOnRootPage
              ? "bg-gray-300 text-gray-500 "
              : "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
          }`}
        >
          <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span>{isOnRootPage ? "New chat" : "New chat"}</span>
        </button>
      </div>

      {/* Conversations Header */}
      <div className="px-4 sm:px-6 py-2">
        <h2 className="text-xs sm:text-sm font-medium text-gray-700">
          Your conversations
        </h2>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pt-2">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner size="md" />
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-600">
            Failed to load chats
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No chats yet</div>
        ) : (
          <div className="space-y-1">
            {/* Today's chats */}
            {chatGroups.today.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-gray-600 mb-2 px-2">
                  Today
                </h3>
                <div className="space-y-1 mb-4">
                  {renderChatGroup(chatGroups.today)}
                </div>
              </div>
            )}

            {/* Yesterday's chats */}
            {chatGroups.yesterday.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-gray-600 mb-2 px-2">
                  Yesterday
                </h3>
                <div className="space-y-1 mb-4">
                  {renderChatGroup(chatGroups.yesterday)}
                </div>
              </div>
            )}

            {/* Last 7 days chats */}
            {chatGroups.lastWeek.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-gray-600 mb-2 px-2">
                  Last 7 Days
                </h3>
                <div className="space-y-1 mb-4">
                  {renderChatGroup(chatGroups.lastWeek)}
                </div>
              </div>
            )}

            {/* Last 30 days chats */}
            {chatGroups.lastMonth.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-gray-600 mb-2 px-2">
                  Last 30 Days
                </h3>
                <div className="space-y-1 mb-4">
                  {renderChatGroup(chatGroups.lastMonth)}
                </div>
              </div>
            )}

            {/* Older chats */}
            {chatGroups.older.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-gray-600 mb-2 px-2">
                  Older
                </h3>
                <div className="space-y-1">
                  {renderChatGroup(chatGroups.older)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4"></div>
    </div>
  );
}
