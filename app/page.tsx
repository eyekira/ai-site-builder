import { PlaceSearch } from '@/app/components/place-search';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-50 px-6 py-24">
      <div className="mb-10 text-center">
        <h1 className="text-5xl font-semibold tracking-tight text-gray-900">Restaurant Finder</h1>
        <p className="mt-3 text-gray-500">Search a restaurant and use it to start your site instantly.</p>
      </div>
      <PlaceSearch />
    </main>
  );
}
