import type { LayoutRenderProps } from './types';

export function BakeryLayout({ title, mutedTextClass, heroCtaHref, ctaLabel, sections, surfaceClass, typographyScaleClass }: LayoutRenderProps) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-7">
      <header className={`border border-pink-100 bg-white px-5 py-4 shadow-sm ${surfaceClass ?? ''}`}>
        <div className={`flex items-center justify-between ${typographyScaleClass ?? ''}`}>
          <div>
            <p className={`text-[10px] uppercase tracking-[0.2em] ${mutedTextClass}`}>Cozy Bakery</p>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          </div>
          <a href={heroCtaHref} className="rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white">
            {ctaLabel}
          </a>
        </div>
      </header>

      {sections.hero && <section className={`border border-pink-100 bg-white px-6 py-8 shadow-sm ${surfaceClass ?? ''}`}>{sections.hero}</section>}
      {sections.photos && <section className={`border border-pink-100 bg-white px-6 py-6 shadow-sm ${surfaceClass ?? ''}`}>{sections.photos}</section>}
      <section className="grid gap-6 md:grid-cols-2">
        {sections.menu && <article className={`border border-pink-100 bg-white px-6 py-6 shadow-sm ${surfaceClass ?? ''}`}>{sections.menu}</article>}
        <div className="space-y-6">
          {sections.about && <article className={`border border-pink-100 bg-white px-6 py-6 shadow-sm ${surfaceClass ?? ''}`}>{sections.about}</article>}
          {sections.reviews && <article className={`border border-pink-100 bg-white px-6 py-6 shadow-sm ${surfaceClass ?? ''}`}>{sections.reviews}</article>}
        </div>
      </section>
      {sections.contact && <section className={`border border-pink-100 bg-white px-6 py-6 shadow-sm ${surfaceClass ?? ''}`}>{sections.contact}</section>}
    </div>
  );
}
