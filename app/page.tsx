import { ClientCounter } from "@/app/components/client-counter";

export default function HomePage() {
  return (
    <main>
      <h1>Next.js App Router + TypeScript</h1>
      <p>This project is scaffolded for server/client component separation.</p>
      <ClientCounter />
    </main>
  );
}
