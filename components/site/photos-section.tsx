type PhotoItem = {
  id: number;
  ref: string;
};

type PhotosSectionProps = {
  photos: PhotoItem[];
};

export function PhotosSection({ photos }: PhotosSectionProps) {
  if (photos.length === 0) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-zinc-900">Photos</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photoItem) => (
          <div key={photoItem.id} className="overflow-hidden rounded-2xl border border-zinc-200">
            <img
              src={`/api/places/photo?ref=${encodeURIComponent(photoItem.ref)}&maxwidth=1200`}
              alt="Business photo"
              className="h-44 w-full object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
