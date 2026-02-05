import { ClientCounter } from "@/app/components/client-counter";

export default function HomePage() {
  const apiKey = process.env['NEXT_PUBLIC_GOOGLE_PLACES_KEY'];
  const apiKey_02 = process.env['GOOGLE_PLACES_SERVER_KEY'];
  if (apiKey) {
    console.log("✅ 키가 로드되었습니다!");
    console.log("키 시작 부분:", apiKey.substring(0, 8) + "****");
    console.log("키 시작 부분:", apiKey_02?.substring(0, 8) + "****");
  } else {
    console.log("❌ 키를 찾을 수 없습니다. Secrets 설정을 확인하세요.");
  }
  return (
    <main>
      <h1>Next.js App Router + TypeScript</h1>
      <p>This project is scaffolded for server/client component separation.</p>
      <ClientCounter />
    </main>
  );
}
