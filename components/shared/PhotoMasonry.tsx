type Item = { id: number; url: string; alt?: string };

export function PhotoMasonry({ items }: { items: Item[] }) {
  return (
    <div className="columns-1 gap-3 sm:columns-2 lg:columns-3">
      {items.map((item) => (
        <img key={item.id} src={item.url} alt={item.alt ?? 'Photo'} className="mb-3 w-full rounded-xl object-cover" />
      ))}
    </div>
  );
}
