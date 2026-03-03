type PhotoItem = {
  id: number;
  url: string;
  ref?: string;
  category?: string;
  isHero?: boolean;
};

type PhotosSectionProps = {
  photos: PhotoItem[];
};

function readRefFromUrl(url: string): string | null {
  try {
    const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
    const parsed = new URL(url, base);
    const ref = parsed.searchParams.get('ref')?.trim();
    return ref && ref.length > 0 ? ref : null;
  } catch {
    return null;
  }
}

export function PhotosSection({ photos }: PhotosSectionProps) {
  if (photos.length === 0) {
    return null;
  }

  const ordered = [...photos].sort((a, b) => Number(b.isHero) - Number(a.isHero));

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-zinc-900">Photos</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ordered.map((photoItem) => {
          const keyRef = photoItem.ref ?? readRefFromUrl(photoItem.url) ?? String(photoItem.id);
          return (
            <div key={keyRef} className="overflow-hidden rounded-2xl border border-zinc-200">
              <img src={photoItem.url} alt={photoItem.category ? `${photoItem.category} photo` : 'Business photo'} className="h-44 w-full object-cover" />
            </div>
          );
        })}
      </div>
    </section>
  );
}
