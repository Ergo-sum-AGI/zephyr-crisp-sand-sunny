import { createFileRoute } from "@tanstack/react-router";
import { HaloApp } from "@/components/halo-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main className="min-h-dvh bg-bg text-fg">
      <HaloApp />
    </main>
  );
}
