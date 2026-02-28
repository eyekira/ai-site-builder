import { StickyMobileCTA } from '@/components/shared/StickyMobileCTA';
import type { LayoutRenderProps } from './types';

export function PremiumLayout({ title, mutedTextClass, heroCtaHref, ctaLabel, sections, surfaceClass, typographyScaleClass }: LayoutRenderProps) {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-10">
      <header className={`border border-white/10 bg-black/40 px-6 py-5 backdrop-blur ${surfaceClass ?? ''}`}>
        <div className={`text-center ${typographyScaleClass ?? ''}`}>
          <p className={`text-[10px] uppercase tracking-[0.35em] ${mutedTextClass}`}>Premium Experience</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
        </div>
      </header>

      {sections.hero && <section className={`border border-white/10 bg-black/30 px-8 py-12 ${surfaceClass ?? ''}`}>{sections.hero}</section>}
      {sections.about && <section className={`border border-white/10 bg-black/20 px-8 py-8 ${surfaceClass ?? ''}`}>{sections.about}</section>}
      {sections.menu && <section className={`border border-white/10 bg-black/20 px-8 py-8 ${surfaceClass ?? ''}`}>{sections.menu}</section>}

      {(sections.reviews || sections.policies || sections.contact) && (
        <section className={`grid gap-8 ${sections.reviews && (sections.policies || sections.contact) ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
          {sections.reviews && <article className={`border border-white/10 bg-black/20 px-6 py-6 ${surfaceClass ?? ''}`}>{sections.reviews}</article>}
          {(sections.policies || sections.contact) && (
            <article className={`border border-white/10 bg-black/20 px-6 py-6 ${surfaceClass ?? ''}`}>{sections.policies ?? sections.contact}</article>
          )}
        </section>
      )}

      {sections.photos && <section className={`border border-white/10 bg-black/20 px-8 py-8 ${surfaceClass ?? ''}`}>{sections.photos}</section>}
      {sections.contact && <section className={`border border-white/10 bg-black/20 px-8 py-8 ${surfaceClass ?? ''}`}>{sections.contact}</section>}

      <a
        href={heroCtaHref}
        className="fixed bottom-6 right-6 z-40 hidden bg-amber-300 px-5 py-3 text-sm font-semibold text-zinc-900 shadow-xl md:inline-flex"
      >
        {ctaLabel}
      </a>
      <StickyMobileCTA label={ctaLabel} href={heroCtaHref} />
    </div>
  );
}
