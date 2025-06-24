# 🤖 Valigate AI Chat Bot

A modern, type-safe ChatGPT-like experience built with React, TypeScript, TanStack Router, TanStack Query, and TailwindCSS.

## 🚀 Features

- **Real-time Streaming**: Server-sent events (SSE) for real-time AI responses
- **Chat Management**: Create, rename, delete, and search chats
- **Markdown Support**: Rich text formatting for AI responses
- **Type Safety**: Full TypeScript coverage with strict type checking
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Error Handling**: Robust error boundaries and graceful fallbacks
- **Optimistic Updates**: Immediate UI feedback with cache management
- **Accessibility**: WCAG compliant with keyboard navigation

## 🏗️ Architecture

### Tech Stack

- **React 19** - UI library with concurrent features
- **TypeScript** - Type safety and developer experience
- **TanStack Router** - File-based routing with type safety
- **TanStack Query** - Server state management with caching
- **TailwindCSS** - Utility-first CSS framework
- **Heroicons** - Beautiful hand-crafted SVG icons

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── chat/           # Chat-specific components
│   ├── sidebar/        # Sidebar components
│   ├── ui/             # Base UI components
│   └── layout/         # Layout components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
├── types/              # TypeScript type definitions
├── api/                # API layer and query functions
└── routes/             # File-based routes
```

### Design Patterns

- **Custom Hooks**: Business logic encapsulation
- **Query Key Factory**: Organized cache management
- **Error Boundaries**: Resilient error handling
- **Optimistic Updates**: Immediate UI feedback
- **Type-Safe APIs**: Runtime and compile-time validation

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Modern browser with ES2020+ support

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd valigate-chat-bot

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup

Create a `.env.local` file:

```bash
VITE_API_BASE_URL=https://your-api-endpoint.com
```

## 📡 API Integration

### Endpoints

| Method | Endpoint               | Purpose                  |
| ------ | ---------------------- | ------------------------ |
| GET    | `/api/chat/user_chats` | Get all user chats       |
| POST   | `/api/chat`            | Create a new chat        |
| DELETE | `/api/chat`            | Delete a chat            |
| PUT    | `/api/chat/rename`     | Rename a chat            |
| GET    | `/api/chat/messages`   | Get messages for a chat  |
| GET    | `/api/chat/stream`     | Stream AI chat responses |

### Static Configuration

```typescript
// Required for all API calls
const TENANT_ID = "valigate";
const USER_ID = "auth0|67efd0df0f83c40778e7dde2"; // Most APIs
const STREAM_USER_ID = "a51047e3-452e-49ee-a226-1659eaa50c3c"; // Streaming only
```

## 🎯 Implementation Plan

### Phase 1: Foundation (✅ Complete)

- [x] TypeScript types and interfaces
- [x] API layer with error handling
- [x] Query key factory for cache management
- [x] Custom hooks for data fetching
- [x] Route structure with TanStack Router

### Phase 2: Core Components (🔄 In Progress)

- [x] Error boundary implementation
- [x] Chat sidebar with search and creation
- [ ] Chat list item with actions
- [ ] Loading spinner component
- [ ] Main chat conversation area
- [ ] Message input component
- [ ] Message display with markdown
- [ ] Streaming message handling

### Phase 3: Advanced Features (⏳ Planned)

- [x] Chat rename functionality
- [x] Chat deletion with confirmation
- [ ] Message search and filtering
- [ ] Responsive mobile optimizations
- [ ] Keyboard shortcuts
- [ ] Accessibility improvements

### Phase 4: Polish & Optimization (⏳ Future)

- [ ] Performance optimizations
- [ ] Bundle size optimization
- [ ] Testing suite (unit + integration)
- [ ] Documentation improvements
- [ ] Deployment configuration

## 🎨 Design System

### Color Palette

```css
/* Primary */
--blue-500: #3b82f6;
--blue-600: #2563eb;

/* Neutral */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-500: #6b7280;
--gray-900: #111827;

/* Semantic */
--red-500: #ef4444; /* Error */
--green-500: #10b981; /* Success */
--yellow-500: #f59e0b; /* Warning */
```

### Typography Scale

```css
/* Headings */
.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}
.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}
.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

/* Body */
.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}
.text-base {
  font-size: 1rem;
  line-height: 1.5rem;
}
```

### Spacing System

```css
/* Consistent spacing scale */
.p-2 {
  padding: 0.5rem;
}
.p-4 {
  padding: 1rem;
}
.p-6 {
  padding: 1.5rem;
}
.p-8 {
  padding: 2rem;
}

.gap-2 {
  gap: 0.5rem;
}
.gap-4 {
  gap: 1rem;
}
.gap-6 {
  gap: 1.5rem;
}
```

## 🔧 Custom Hooks

### Chat Management

```typescript
// Fetch user chats with caching
const { data, isLoading, error } = useUserChats();

// Create new chat with optimistic updates - PROPER DESTRUCTURING
const { mutateAsync: createChat, isPending } = useCreateChat();
await createChat("Chat Name");

// Delete chat with cache invalidation - PROPER DESTRUCTURING
const { mutate: deleteChat } = useDeleteChat();
deleteChat(chatId);

// Rename chat with rollback on error - PROPER DESTRUCTURING
const { mutate: renameChat } = useRenameChat();
renameChat({ chatId, newName });
```

### Message Management

```typescript
// Fetch messages for a chat
const { data: messages } = useChatMessages(chatId);

// Handle streaming responses
const { isStreaming, streamingContent, startStream, stopStream } =
  useStreamingMessage();

// Start streaming a message
await startStream(chatId, "Hello AI!");
```

## ⚡ Performance Optimizations

### TanStack Query Configuration

```typescript
// Optimized query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
```

### Code Splitting

```typescript
// Automatic route-based code splitting
const ChatConversation = lazy(() => import("./ChatConversation"));
const MessageInput = lazy(() => import("./MessageInput"));
```

### Bundle Optimization

```typescript
// Tree-shakable imports
import { PlusIcon } from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
```

## 🧪 Testing Strategy

### Unit Tests

```typescript
// Component testing with React Testing Library
test('ChatSidebar renders chat list', () => {
  render(<ChatSidebar />);
  expect(screen.getByText('New Chat')).toBeInTheDocument();
});

// Hook testing with custom render
test('useUserChats fetches chats', async () => {
  const { result } = renderHook(() => useUserChats());
  await waitFor(() => expect(result.current.data).toBeDefined());
});
```

### Integration Tests

```typescript
// End-to-end user flows
test("user can create and send message in chat", async () => {
  // Test complete user journey
});
```

## 🔒 Error Handling

### API Errors

```typescript
// Custom error class with context
class ApiException extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
  }
}

// Graceful error boundaries
<ErrorBoundary fallback={<ErrorFallback />}>
  <ChatComponent />
</ErrorBoundary>
```

### Network Resilience

```typescript
// Retry configuration for failed requests
const { data } = useQuery({
  queryKey: ["chats"],
  queryFn: fetchChats,
  retry: (failureCount, error) => {
    if (error.status === 404) return false;
    return failureCount < 3;
  },
});
```

## 🎯 Best Practices

### Type Safety

- Use strict TypeScript configuration
- Define interfaces for all API responses
- Validate route parameters with Zod
- Use generic types for reusable components

### Performance

- Implement query key factories for cache organization
- Use optimistic updates for immediate feedback
- Lazy load non-critical components
- Minimize bundle size with tree-shaking

### Accessibility

- Semantic HTML structure
- ARIA labels for dynamic content
- Keyboard navigation support
- Focus management for modals

### Code Organization

- Co-locate related files
- Use barrel exports for clean imports
- Consistent naming conventions
- Separate business logic into custom hooks

### Hook Usage Best Practices

```typescript
// ✅ GOOD: Properly destructure mutation hooks
const { mutate: createChat, isPending, isError, error } = useCreateChat();

// ❌ BAD: Don't use the entire mutation object
const createChatMutation = useCreateChat();
const isLoading = createChatMutation.isPending; // Harder to track

// ✅ GOOD: Destructure what you need
const { mutateAsync: deleteChat, isPending: isDeleting } = useDeleteChat();

// ✅ GOOD: Rename when you have multiple similar hooks
const { mutate: renameChat, isPending: isRenaming } = useRenameChat();

const { mutate: deleteChat, isPending: isDeleting } = useDeleteChat();
```

## 🚀 Deployment

### Build Configuration

```bash
# Production build
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

### Environment Variables

```bash
# Production
VITE_API_BASE_URL=https://api.valigate.com
VITE_APP_ENV=production
```






