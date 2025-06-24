import { createFileRoute } from "@tanstack/react-router";
import { ChatConversation } from "@/components/chat/ChatConversation";
import { z } from "zod";

const chatParamsSchema = z.object({
  chatId: z.string().min(1),
});

const chatSearchSchema = z.object({
  initialMessage: z.string().optional(),
});

export const Route = createFileRoute("/$chatId")({
  params: {
    parse: (params) => chatParamsSchema.parse(params),
    stringify: (params) => params,
  },
  validateSearch: (search) => chatSearchSchema.parse(search),
  component: ChatDetailPage,
});

function ChatDetailPage() {
  const { chatId } = Route.useParams();
  const { initialMessage } = Route.useSearch();

  return <ChatConversation chatId={chatId} initialMessage={initialMessage} />;
}
