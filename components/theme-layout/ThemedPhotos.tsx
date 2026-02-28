import { PhotoCarousel } from '@/components/shared/PhotoCarousel';
import { PhotoMasonry } from '@/components/shared/PhotoMasonry';
import type { ThemeLayoutConfig } from '@/lib/themes/schema';

type Item = { id: number; url: string; alt?: string };

export function ThemedPhotos({ items, layout, cardClass }: { items: Item[]; layout: ThemeLayoutConfig; cardClass: string }) {
  if (layout.sections.photos.layout === 'carousel' || layout.sections.photos.layout === 'filmstrip') {
    return (
      <section className={`rounded-3xl p-6 shadow-sm ${cardClass}`}>
        <h2 className="text-2xl font-semibold">Photos</h2>
        <div className="mt-4">
          <PhotoCarousel items={items} />
        </div>
      </section>
    );
  }

  if (layout.sections.photos.layout === 'edge_grid') {
    return (
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Photos</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <img key={item.id} src={item.url} alt={item.alt ?? 'Photo'} className="h-56 w-full rounded-xl object-cover" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={`rounded-3xl p-6 shadow-sm ${cardClass}`}>
      <h2 className="text-2xl font-semibold">Photos</h2>
      <div className="mt-4">
        <PhotoMasonry items={items} />
      </div>
    </section>
  );
}
