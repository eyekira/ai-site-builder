import type { ReviewsContent } from '@/lib/section-content';

export function ReviewsSection({ content, mutedTextClass }: { content: ReviewsContent; mutedTextClass: string }) {
  return (
    <>
      <h2 className="text-2xl font-semibold">{content.title}</h2>
      <div className="mt-4 grid gap-4">
        {content.items.map((item, index) => (
          <div key={`${item.author}-${index}`} className="rounded-xl border border-zinc-200 p-4">
            <div className="text-sm font-semibold text-amber-500">{'★'.repeat(item.rating)}</div>
            {item.quote && <p className={`mt-2 text-sm ${mutedTextClass}`}>{item.quote}</p>}
            <p className="mt-3 text-sm font-semibold">{item.author}</p>
          </div>
        ))}
      </div>
    </>
  );
}
