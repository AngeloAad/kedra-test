# 🤖 Valigate AI Chat Bot

A simple React TypeScript chat application that connects to a backend API for AI conversations.

🌐 **[Live Demo](https://kedra-test.vercel.app)** | 📁 **[Source Code](https://github.com/AngeloAad/kedra-test)**

## What it is

This is a basic chat interface where users can:

- Create new chats
- Send messages and get AI responses via streaming
- Rename and delete chats
- View chat history

## Tech Stack

- **React 19** with TypeScript
- **TanStack Router** for routing
- **TanStack Query** for API state management
- **TailwindCSS** for styling
- **Vite** for development and building

## How it works

### API Integration

The app connects to a chat API with these endpoints:

- `GET /chat/user_chats` - Get user's chats
- `POST /chat` - Create new chat
- `DELETE /chat` - Delete chat
- `PUT /chat/rename` - Rename chat
- `GET /chat/messages` - Get chat messages
- `POST /chat/stream` - Stream AI responses (EventSource)

### Codebase Structure

```
src/
├── components/
│   ├── chat/ChatConversation.tsx       # Main chat interface
│   ├── layout/ChatLayout.tsx           # App layout wrapper
│   ├── sidebar/
│   │   ├── ChatSidebar.tsx             # Left sidebar with chat list
│   │   └── ChatListItem.tsx            # Individual chat item
│   └── ui/
│       ├── ChatInput.tsx               # Message input component
│       ├── MessageContent.tsx          # Message display
│       ├── LoadingSpinner.tsx          # Loading states
│       └── ErrorBoundary.tsx           # Error handling
├── services/                           # API layer (domain-driven)
│   ├── chats/
│   │   ├── api.ts                      # Chat API functions
│   │   ├── hooks.ts                    # Chat React Query hooks
│   │   ├── types.ts                    # Chat TypeScript types
│   │   └── queryOptions.ts             # Query configurations
│   └── messages/
│       ├── api.ts                      # Message API functions
│       ├── hooks.ts                    # Message hooks + streaming
│       ├── types.ts                    # Message types
│       └── queryOptions.ts             # Query configurations
├── routes/
│   ├── __root.tsx                      # Root layout
│   ├── index.tsx                       # Home page (chat creation)
│   └── $chatId.tsx                     # Individual chat page
└── lib/
    ├── api-config.ts                   # API configuration
    └── utils.ts                        # Utility functions
```

### Key Features

**Domain-Driven Services Architecture**

- Each domain (chats, messages) has its own folder with API, hooks, types, and query options
- Clean separation of concerns
- Easy to maintain and extend

**Streaming Chat Responses**

- Uses EventSource for real-time AI responses
- AI messages formatted using React Markdown for rich text display
- Handles connection drops with automatic fallback
- Saves partial content and fetches complete messages if streaming fails

**React Query Integration**

- Optimistic updates for immediate UI feedback
- Smart caching with 5-minute stale time
- Cache invalidation for data consistency

**TypeScript Safety**

- All API responses properly typed
- Transform raw API data to clean component interfaces
- Strict type checking throughout

## Configuration

The app uses hardcoded API configuration in `src/lib/api-config.ts`:

```typescript
export const API_CONFIG = {
  baseUrl: "https://api.us.valigate.ai",
  tenantId: "valigate",
  userId: "auth0|67efd0df0f83c40778e7dde2",
  streamUserId: "a51047e3-452e-49ee-a226-1659eaa50c3c",
};
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation & Running

1. **Clone the repository**

   ```bash
   git clone https://github.com/AngeloAad/kedra-test.git
   cd kedra-test
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

4. **Build for production**
   ```bash
   npm run build
   ```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks

## How Data Flows

1. **Create Chat**: User types message → API creates chat → Navigate to chat page
2. **Send Message**: User sends message → Start streaming → Display chunks in real-time → Save complete message
3. **Chat List**: TanStack Query caches chats → Auto-refresh on mutations → Optimistic updates
4. **Error Handling**: Connection drops → Save partial content → Fetch complete message → Seamless UX

The app is designed to be simple, reliable, and provide a smooth chat experience with proper error handling and data management.
