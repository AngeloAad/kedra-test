import { createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ChatLayout } from "@/components/layout/ChatLayout";

export const Route = createRootRoute({
  component: () => (
    <>
      {/* <Outlet /> */}
      <ChatLayout />
      <TanStackRouterDevtools />
    </>
  ),
});
