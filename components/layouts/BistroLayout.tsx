import { StickyMobileCTA } from '@/components/shared/StickyMobileCTA';
import type { LayoutRenderProps } from './types';

export function BistroLayout({ title, mutedTextClass, cardClass, heroCtaHref, ctaLabel, sections, navLinks = [], anchors = {}, surfaceClass, typographyScaleClass }: LayoutRenderProps) {
  const primaryLabel = /call\s*us|phone/i.test(ctaLabel) ? 'Reserve' : ctaLabel;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <header className={`cs-nav border px-6 py-4 ${cardClass} ${surfaceClass ?? ''}`}>
        <div className={`flex items-center justify-center gap-6 ${typographyScaleClass ?? ''}`}>
          <span className={`text-xs uppercase tracking-[0.2em] ${mutedTextClass}`}>Bistro Editorial</span>
          <h1 className="text-lg font-semibold tracking-wide">{title}</h1>
          {navLinks.length > 0 && <nav className={`cs-nav hidden items-center gap-4 text-xs ${mutedTextClass} md:flex`}>{navLinks.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}</nav>}
          <a href={heroCtaHref} className="border border-current px-3 py-1 text-xs font-semibold uppercase">{primaryLabel}</a>
        </div>
      </header>

      {sections.hero && <section className={`cs-section border px-8 py-10 ${cardClass} ${surfaceClass ?? ''}`}>{sections.hero}</section>}

      {(sections.about || sections.menu || sections.reviews) && (
        <section className={`cs-section grid gap-8 ${sections.about && (sections.menu || sections.reviews) ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
          {sections.about && <article id={anchors.about} className={`border p-6 ${cardClass} ${surfaceClass ?? ''}`}>{sections.about}</article>}
          {(sections.menu || sections.reviews) && (
            <div className="space-y-8">
              {sections.menu && <article id={anchors.menu} className={`border p-6 ${cardClass} ${surfaceClass ?? ''}`}>{sections.menu}</article>}
              {sections.reviews && <article id={anchors.reviews} className={`border p-6 ${cardClass} ${surfaceClass ?? ''}`}>{sections.reviews}</article>}
            </div>
          )}
        </section>
      )}

      {sections.photos && <section id={anchors.photos} className="cs-photo space-y-6">{sections.photos}</section>}
      {sections.contact && <article id={anchors.contact} className={`border p-6 ${cardClass} ${surfaceClass ?? ''}`}>{sections.contact}</article>}

      {navLinks.length > 0 && (
        <div className={`fixed inset-x-0 bottom-0 z-40 border-t bg-[var(--brand-surface)]/95 px-3 py-2 backdrop-blur md:hidden ${surfaceClass ?? ''}`}>
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <div className="flex items-center gap-3">{navLinks.slice(0, 3).map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}</div>
            <a href={heroCtaHref} className="cs-btn-outline rounded-full bg-[var(--brand-primary)] px-3 py-1.5 text-[var(--brand-bg)]">{primaryLabel}</a>
          </div>
        </div>
      )}
      <StickyMobileCTA label={primaryLabel} href={heroCtaHref} />
    </div>
  );
}
