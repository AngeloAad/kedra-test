import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: About,
});

function About() {
  return (
    <div className="bg-brand text-white text-2xl text-center">
      <h1>About</h1>
    </div>
  );
}
