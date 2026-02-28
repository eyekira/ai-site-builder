import type { LayoutRenderProps } from './types';

export function MinimalLayout({ title, mutedTextClass, heroCtaHref, ctaLabel, sections }: LayoutRenderProps) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <header className="sticky top-2 z-20 rounded-xl border border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur">
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

      {sections.hero}
      {sections.menu}
      {sections.about}
      {sections.photos}
      {sections.contact}
    </div>
  );
}
