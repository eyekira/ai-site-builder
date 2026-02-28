import { StickyMobileCTA } from '@/components/shared/StickyMobileCTA';
import type { LayoutRenderProps } from './types';

export function FastCasualLayout({ title, mutedTextClass, heroCtaHref, ctaLabel, sections }: LayoutRenderProps) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      <header className="sticky top-0 z-20 border border-zinc-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-bold uppercase tracking-wide">{title}</h1>
          <nav className={`hidden items-center gap-3 text-xs ${mutedTextClass} md:flex`}>
            <span>Order</span>
            <span>Deals</span>
            <span>Locations</span>
          </nav>
          <a href={heroCtaHref} className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white">
            {ctaLabel}
          </a>
        </div>
      </header>

      <section className="rounded-xl border border-zinc-200 bg-white px-4 py-4">{sections.hero}</section>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <article className="rounded-xl border border-zinc-200 bg-white px-4 py-4">{sections.menu}</article>
          <article className="rounded-xl border border-zinc-200 bg-white px-4 py-4">{sections.photos}</article>
        </div>
        <aside className="space-y-4">
          <article className="rounded-xl border border-zinc-200 bg-white px-4 py-4">{sections.reviews}</article>
          <article className="rounded-xl border border-zinc-200 bg-white px-4 py-4">{sections.contact}</article>
        </aside>
      </div>

      <StickyMobileCTA label={ctaLabel} href={heroCtaHref} />
    </div>
  );
}
