import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return <div className="bg-brand text-white text-2xl text-center">
    <h1>Index</h1>
  </div>;
}
