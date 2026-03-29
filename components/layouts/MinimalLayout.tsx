import { Button } from '@/components/ui/button';
import type { LayoutRenderProps } from './types';

export function MinimalLayout({ title, mutedTextClass, heroCtaHref, ctaLabel, sections, navLinks = [], anchors = {}, surfaceClass, typographyScaleClass }: LayoutRenderProps) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <header className={`sticky top-2 z-20 border border-[var(--brand-border)] bg-[var(--brand-surface)]/90 px-4 py-3 backdrop-blur ${surfaceClass ?? ''}`}>
        <div className={`flex items-center justify-between ${typographyScaleClass ?? ''}`}>
          <h1 className="text-sm font-semibold tracking-wide">{title}</h1>
          {navLinks.length > 0 && (
            <nav className={`hidden items-center gap-4 text-xs ${mutedTextClass} md:flex`}>
              {navLinks.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
            </nav>
          )}
          <Button asChild intent="primary" variant="solid" size="sm"><a href={heroCtaHref}>{ctaLabel}</a></Button>
        </div>
      </header>

      {sections.hero && <section className={`bg-[var(--brand-surface)] px-6 py-8 ${surfaceClass ?? 'shadow-sm'}`}>{sections.hero}</section>}
      {sections.menu && <section id={anchors.menu} className={`bg-[var(--brand-surface)] px-6 py-6 ${surfaceClass ?? 'shadow-sm'}`}>{sections.menu}</section>}
      {sections.about && <section id={anchors.about} className={`bg-[var(--brand-surface)] px-6 py-6 ${surfaceClass ?? 'shadow-sm'}`}>{sections.about}</section>}
      {sections.photos && <section id={anchors.photos} className={`bg-[var(--brand-surface)] px-6 py-6 ${surfaceClass ?? 'shadow-sm'}`}>{sections.photos}</section>}
      {sections.contact && <section id={anchors.contact} className={`bg-[var(--brand-surface)] px-6 py-6 ${surfaceClass ?? 'shadow-sm'}`}>{sections.contact}</section>}
    </div>
  );
}
