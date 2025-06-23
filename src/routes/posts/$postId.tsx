import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/$postId')({
  component: PostId,
  loader: async ({ params }) => {
    // throw new Error();
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return {
      PostId: params.postId,
    };
  },
  pendingComponent: () => <div>Loading....</div>,
  errorComponent: () => <div>Error</div>
})

function PostId() {
  const { PostId } = Route.useLoaderData();
  
  return <div>Hello {PostId}</div>;
}
