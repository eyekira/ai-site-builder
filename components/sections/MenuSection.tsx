import type { MenuContent } from '@/lib/section-content';

export function MenuSection({ content, mutedTextClass }: { content: MenuContent; mutedTextClass: string }) {
  const grouped = content.items.reduce<Record<string, typeof content.items>>((acc, item) => {
    const category = item.category?.trim() || 'Menu';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  const groupEntries = Object.entries(grouped);

  return (
    <>
      <h2 className="text-2xl font-semibold">{content.title}</h2>
      <div className="mt-4 space-y-6">
        {groupEntries.map(([category, items]) => (
          <section key={category}>
            {groupEntries.length > 1 && <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--brand-muted)]">{category}</h3>}
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={`${item.name}-${index}`} className="flex items-start justify-between gap-6">
                  <div>
                    <p className="text-base font-semibold">{item.name}</p>
                    {item.description && <p className={`mt-1 text-sm ${mutedTextClass}`}>{item.description}</p>}
                  </div>
                  {item.price && <span className="text-sm font-semibold">{item.price}</span>}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
