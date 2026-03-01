import { StickyMobileCTA } from '@/components/shared/StickyMobileCTA';
import type { LayoutRenderProps } from './types';

export function FastCasualLayout({ title, mutedTextClass, heroCtaHref, ctaLabel, sections, navLinks = [], anchors = {}, surfaceClass, typographyScaleClass }: LayoutRenderProps) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      <header className={`sticky top-0 z-20 border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-3 shadow-sm ${surfaceClass ?? ''}`}>
        <div className={`flex items-center justify-between ${typographyScaleClass ?? ''}`}>
          <h1 className="text-xs font-extrabold uppercase tracking-[0.14em]">{title}</h1>
          {navLinks.length > 0 && <nav className={`hidden items-center gap-3 text-xs ${mutedTextClass} md:flex`}>{navLinks.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}</nav>}
          <a href={heroCtaHref} className="bp-primary-cta rounded-md px-3 py-1.5 text-xs font-semibold">{ctaLabel}</a>
        </div>
      </header>

      {sections.hero && <section className={`border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-4 ${surfaceClass ?? ''}`}>{sections.hero}</section>}

      {(sections.menu || sections.photos || sections.reviews || sections.contact) && (
        <div className={`grid gap-4 ${(sections.reviews || sections.contact) && (sections.menu || sections.photos) ? 'lg:grid-cols-[1.5fr_1fr]' : 'grid-cols-1'}`}>
          {(sections.menu || sections.photos) && (
            <div className="space-y-4">
              {sections.menu && <article id={anchors.menu} className={`border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-4 ${surfaceClass ?? ''}`}>{sections.menu}</article>}
              {sections.photos && <article id={anchors.photos} className={`border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-4 ${surfaceClass ?? ''}`}>{sections.photos}</article>}
            </div>
          )}
          {(sections.reviews || sections.contact) && (
            <aside className="space-y-4">
              {sections.reviews && <article id={anchors.reviews} className={`border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-4 ${surfaceClass ?? ''}`}>{sections.reviews}</article>}
              {sections.contact && <article id={anchors.contact} className={`border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-4 ${surfaceClass ?? ''}`}>{sections.contact}</article>}
            </aside>
          )}
        </div>
      )}

      <StickyMobileCTA label={ctaLabel} href={heroCtaHref} />
    </div>
  );
}
