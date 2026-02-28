type Item = { id: number; url: string; alt?: string };

export function PhotoCarousel({ items }: { items: Item[] }) {
  return (
    <div className="flex snap-x gap-3 overflow-x-auto pb-2">
      {items.map((item) => (
        <img
          key={item.id}
          src={item.url}
          alt={item.alt ?? 'Photo'}
          className="h-48 w-[75%] shrink-0 snap-center rounded-xl object-cover sm:w-[45%]"
        />
      ))}
    </div>
  );
}
