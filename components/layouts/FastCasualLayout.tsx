import { StickyMobileCTA } from '@/components/shared/StickyMobileCTA';
import type { LayoutRenderProps } from './types';

export function FastCasualLayout({ title, mutedTextClass, heroCtaHref, ctaLabel, sections, surfaceClass, typographyScaleClass }: LayoutRenderProps) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      <header className={`sticky top-0 z-20 border border-zinc-200 bg-white px-4 py-3 shadow-sm ${surfaceClass ?? ''}`}>
        <div className={`flex items-center justify-between ${typographyScaleClass ?? ''}`}>
          <h1 className="text-xs font-extrabold uppercase tracking-[0.14em]">{title}</h1>
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

      {sections.hero && <section className={`border border-zinc-200 bg-white px-4 py-4 ${surfaceClass ?? ''}`}>{sections.hero}</section>}

      {(sections.menu || sections.photos || sections.reviews || sections.contact) && (
        <div className={`grid gap-4 ${(sections.reviews || sections.contact) && (sections.menu || sections.photos) ? 'lg:grid-cols-[1.5fr_1fr]' : 'grid-cols-1'}`}>
          {(sections.menu || sections.photos) && (
            <div className="space-y-4">
              {sections.menu && <article className={`border border-zinc-200 bg-white px-4 py-4 ${surfaceClass ?? ''}`}>{sections.menu}</article>}
              {sections.photos && <article className={`border border-zinc-200 bg-white px-4 py-4 ${surfaceClass ?? ''}`}>{sections.photos}</article>}
            </div>
          )}
          {(sections.reviews || sections.contact) && (
            <aside className="space-y-4">
              {sections.reviews && <article className={`border border-zinc-200 bg-white px-4 py-4 ${surfaceClass ?? ''}`}>{sections.reviews}</article>}
              {sections.contact && <article className={`border border-zinc-200 bg-white px-4 py-4 ${surfaceClass ?? ''}`}>{sections.contact}</article>}
            </aside>
          )}
        </div>
      )}

      <StickyMobileCTA label={ctaLabel} href={heroCtaHref} />
    </div>
  );
}
