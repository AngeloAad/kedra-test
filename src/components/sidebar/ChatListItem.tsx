import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  EllipsisHorizontalIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import type { Chat } from "@/types/api";
import { cn } from "@/lib/utils";

interface ChatListItemProps {
  chat: Chat;
  isActive: boolean;
  onRename?: (chatId: string, newName: string) => void;
  onDelete?: (chatId: string) => void;
}

export function ChatListItem({
  chat,
  isActive,
  onRename,
  onDelete,
}: ChatListItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(chat.name);

  const handleRename = () => {
    if (onRename && newName.trim() && newName !== chat.name) {
      onRename(chat.id, newName.trim());
    }
    setIsRenaming(false);
    setShowMenu(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(chat.id);
    }
    setShowMenu(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRename();
    } else if (e.key === "Escape") {
      setNewName(chat.name);
      setIsRenaming(false);
      setShowMenu(false);
    }
  };

  // Function to truncate text and add ellipsis
  const getTruncatedText = (text: string, maxLength: number = 25) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  return (
    <div
      className={cn(
        "group relative flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors touch-manipulation",
        isActive
          ? "bg-blue-100 text-blue-800 font-medium"
          : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
      )}
      onMouseLeave={() => setShowMenu(false)}
    >
      <Link
        to="/$chatId"
        params={{ chatId: chat.id }}
        className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0"
      >
        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full flex-shrink-0" />
        {isRenaming ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm"
            autoFocus
            onClick={(e) => e.preventDefault()}
          />
        ) : (
          <span className="truncate leading-relaxed">
            {getTruncatedText(chat.name)}
          </span>
        )}
      </Link>

      <button
        onClick={(e) => {
          e.preventDefault();
          setShowMenu(!showMenu);
        }}
        className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0 text-gray-500 hover:text-gray-700"
      >
        <EllipsisHorizontalIcon className="w-4 h-4" />
      </button>

      {/* Dropdown menu */}
      {showMenu && (
        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[120px]">
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsRenaming(true);
              setShowMenu(false);
            }}
            className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 flex items-center gap-2"
          >
            <PencilIcon className="w-4 h-4" />
            Rename
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 text-red-600 flex items-center gap-2"
          >
            <TrashIcon className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
