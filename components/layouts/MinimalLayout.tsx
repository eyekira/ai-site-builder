import type { LayoutRenderProps } from './types';

export function MinimalLayout({ title, mutedTextClass, heroCtaHref, ctaLabel, sections, surfaceClass }: LayoutRenderProps) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <header className={`sticky top-2 z-20 border border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur ${surfaceClass ?? ''}`}>
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-semibold tracking-wide">{title}</h1>
          <nav className={`hidden items-center gap-4 text-xs ${mutedTextClass} md:flex`}>
            <span>Menu</span>
            <span>Photos</span>
            <span>Visit</span>
          </nav>
          <a href={heroCtaHref} className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white">
            {ctaLabel}
          </a>
        </div>
      </header>

      {sections.hero && <section className={`bg-white px-6 py-8 ${surfaceClass ?? 'shadow-sm'}`}>{sections.hero}</section>}
      {sections.menu && <section className={`bg-white px-6 py-6 ${surfaceClass ?? 'shadow-sm'}`}>{sections.menu}</section>}
      {sections.about && <section className={`bg-white px-6 py-6 ${surfaceClass ?? 'shadow-sm'}`}>{sections.about}</section>}
      {sections.photos && <section className={`bg-white px-6 py-6 ${surfaceClass ?? 'shadow-sm'}`}>{sections.photos}</section>}
      {sections.contact && <section className={`bg-white px-6 py-6 ${surfaceClass ?? 'shadow-sm'}`}>{sections.contact}</section>}
    </div>
  );
}
