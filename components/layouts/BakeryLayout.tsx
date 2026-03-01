import type { LayoutRenderProps } from './types';

export function BakeryLayout({ title, mutedTextClass, heroCtaHref, ctaLabel, sections, navLinks = [], anchors = {}, surfaceClass, typographyScaleClass }: LayoutRenderProps) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-7">
      <header className={`cs-nav border border-[var(--brand-border)] bg-[var(--brand-surface)] px-5 py-4 shadow-sm ${surfaceClass ?? ''}`}>
        <div className={`flex items-center justify-between ${typographyScaleClass ?? ''}`}>
          <div>
            <p className={`text-[10px] uppercase tracking-[0.2em] ${mutedTextClass}`}>Cozy Bakery</p>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          </div>
          {navLinks.length > 0 && <nav className={`cs-nav hidden items-center gap-3 text-xs ${mutedTextClass} md:flex`}>{navLinks.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}</nav>}
          <a href={heroCtaHref} className="rounded-full bg-[var(--brand-accent)] px-4 py-2 text-xs font-semibold text-[var(--brand-bg)]">{ctaLabel}</a>
        </div>
      </header>

      {sections.hero && <section className={`cs-section border border-[var(--brand-border)] bg-[var(--brand-surface)] px-6 py-8 shadow-sm ${surfaceClass ?? ''}`}>{sections.hero}</section>}
      {sections.photos && <section id={anchors.photos} className={`border border-[var(--brand-border)] bg-[var(--brand-surface)] px-6 py-6 shadow-sm ${surfaceClass ?? ''}`}>{sections.photos}</section>}
      {(sections.menu || sections.about || sections.reviews) && (
        <section className={`cs-section grid gap-6 ${sections.menu && (sections.about || sections.reviews) ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
          {sections.menu && <article id={anchors.menu} className={`border border-[var(--brand-border)] bg-[var(--brand-surface)] px-6 py-6 shadow-sm ${surfaceClass ?? ''}`}>{sections.menu}</article>}
          {(sections.about || sections.reviews) && (
            <div className="cs-photo space-y-6">
              {sections.about && <article id={anchors.about} className={`border border-[var(--brand-border)] bg-[var(--brand-surface)] px-6 py-6 shadow-sm ${surfaceClass ?? ''}`}>{sections.about}</article>}
              {sections.reviews && <article id={anchors.reviews} className={`border border-[var(--brand-border)] bg-[var(--brand-surface)] px-6 py-6 shadow-sm ${surfaceClass ?? ''}`}>{sections.reviews}</article>}
            </div>
          )}
        </section>
      )}
      {sections.contact && <section id={anchors.contact} className={`border border-[var(--brand-border)] bg-[var(--brand-surface)] px-6 py-6 shadow-sm ${surfaceClass ?? ''}`}>{sections.contact}</section>}
    </div>
  );
}
