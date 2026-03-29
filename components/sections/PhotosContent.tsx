type PhotoItem = {
  id: number;
  url: string;
  category?: string;
  isHero?: boolean;
};

export function PhotosContent({ photos }: { photos: PhotoItem[] }) {
  if (photos.length === 0) return null;
  const ordered = [...photos].sort((a, b) => Number(b.isHero) - Number(a.isHero));
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {ordered.map((photoItem) => (
        <div key={photoItem.id} className="overflow-hidden rounded-2xl border border-zinc-200">
          <img src={photoItem.url} alt={photoItem.category ? `${photoItem.category} photo` : 'Business photo'} className="h-44 w-full object-cover" />
        </div>
      ))}
    </div>
  );
}
