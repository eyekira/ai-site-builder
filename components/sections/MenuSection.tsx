import type { MenuContent } from '@/lib/section-content';

export function MenuSection({ content, mutedTextClass }: { content: MenuContent; mutedTextClass: string }) {
  return (
    <>
      <h2 className="text-2xl font-semibold">{content.title}</h2>
      <div className="mt-4 space-y-4">
        {content.items.map((item, index) => (
          <div key={`${item.name}-${index}`} className="flex items-start justify-between gap-6">
            <div>
              <p className="text-base font-semibold">{item.name}</p>
              {item.description && <p className={`mt-1 text-sm ${mutedTextClass}`}>{item.description}</p>}
            </div>
            {item.price && <span className="text-sm font-semibold">{item.price}</span>}
          </div>
        ))}
      </div>
    </>
  );
}
