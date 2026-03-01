import { StickyMobileCTA } from '@/components/shared/StickyMobileCTA';
import type { LayoutRenderProps } from './types';

export function PremiumLayout({ title, mutedTextClass, heroCtaHref, ctaLabel, sections, navLinks = [], anchors = {}, surfaceClass, typographyScaleClass }: LayoutRenderProps) {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-10">
      <header className={`cs-nav border border-[var(--brand-border)] bg-[var(--brand-surface)] px-6 py-5 backdrop-blur ${surfaceClass ?? ''}`}>
        <div className={`flex items-center justify-between gap-4 ${typographyScaleClass ?? ''}`}>
          <div>
            <p className={`text-[10px] uppercase tracking-[0.35em] ${mutedTextClass}`}>Premium Experience</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
          </div>
          {navLinks.length > 0 && <nav className={`cs-nav hidden items-center gap-4 text-xs ${mutedTextClass} md:flex`}>{navLinks.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}</nav>}
          <a href={heroCtaHref} className="rounded-md bg-[var(--brand-primary)] px-4 py-2 text-xs font-semibold text-[var(--brand-bg)]">{ctaLabel}</a>
        </div>
      </header>

      {sections.hero && <section className={`cs-section border border-[var(--brand-border)] bg-[var(--brand-surface)] px-8 py-12 ${surfaceClass ?? ''}`}>{sections.hero}</section>}
      {sections.about && <section id={anchors.about} className={`border border-[var(--brand-border)] bg-[var(--brand-surface)] px-8 py-8 ${surfaceClass ?? ''}`}>{sections.about}</section>}
      {sections.menu && <section id={anchors.menu} className={`border border-[var(--brand-border)] bg-[var(--brand-surface)] px-8 py-8 ${surfaceClass ?? ''}`}>{sections.menu}</section>}

      {(sections.reviews || sections.policies || sections.contact) && (
        <section className={`cs-section grid gap-8 ${sections.reviews && (sections.policies || sections.contact) ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
          {sections.reviews && <article id={anchors.reviews} className={`border border-[var(--brand-border)] bg-[var(--brand-surface)] px-6 py-6 ${surfaceClass ?? ''}`}>{sections.reviews}</article>}
          {(sections.policies || sections.contact) && (
            <article className={`cs-card cs-section border border-[var(--brand-border)] bg-[var(--brand-surface)] px-6 py-6 ${surfaceClass ?? ''}`}>{sections.policies ?? sections.contact}</article>
          )}
        </section>
      )}

      {sections.photos && <section id={anchors.photos} className={`border border-[var(--brand-border)] bg-[var(--brand-surface)] px-8 py-8 ${surfaceClass ?? ''}`}>{sections.photos}</section>}
      {sections.contact && <section id={anchors.contact} className={`border border-[var(--brand-border)] bg-[var(--brand-surface)] px-8 py-8 ${surfaceClass ?? ''}`}>{sections.contact}</section>}

      <StickyMobileCTA label={ctaLabel} href={heroCtaHref} />
    </div>
  );
}
