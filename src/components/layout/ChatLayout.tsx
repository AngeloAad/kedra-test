// External dependencies
import { useState } from "react";
import { Outlet } from "@tanstack/react-router";

// Component imports
import { Bars3Icon } from "@heroicons/react/24/outline";

// Local module imports
import { ChatSidebar } from "@/components/sidebar/ChatSidebar";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export function ChatLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50 relative">
      {/* Sidebar - Desktop: always visible, Mobile: overlay */}
      <div
        className={`
          flex-shrink-0 bg-slate-50 border-r border-gray-200 transition-transform duration-300 ease-in-out
          ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0
          fixed lg:static inset-y-0 left-0 w-80 lg:w-80 z-50 lg:z-auto
        `}
      >
        <ErrorBoundary
          fallback={
            <div className="p-4 text-red-600">Failed to load sidebar</div>
          }
        >
          <ChatSidebar onCloseSidebar={() => setIsSidebarOpen(false)} />
        </ErrorBoundary>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Invisible click area to close sidebar when open on mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 lg:hidden z-40"
            onClick={() => setIsSidebarOpen(false)}
            style={{ left: "320px" }}
          />
        )}

        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between relative z-30">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Valigate AI</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex flex-col min-w-0 relative z-30 h-full overflow-hidden">
          <ErrorBoundary
            fallback={
              <div className="p-4 text-red-600">Failed to load chat</div>
            }
          >
            <Outlet />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
