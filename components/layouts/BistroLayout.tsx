import { StickyMobileCTA } from '@/components/shared/StickyMobileCTA';
import type { LayoutRenderProps } from './types';

export function BistroLayout({ title, mutedTextClass, cardClass, heroCtaHref, ctaLabel, sections }: LayoutRenderProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <header className={`rounded-sm border px-6 py-4 ${cardClass}`}>
        <div className="flex items-center justify-center gap-8">
          <span className={`text-xs uppercase tracking-[0.2em] ${mutedTextClass}`}>Bistro Editorial</span>
          <h1 className="text-lg font-semibold tracking-wide">{title}</h1>
          <nav className={`hidden items-center gap-4 text-xs ${mutedTextClass} md:flex`}>
            <a href="#menu">Menu</a>
            <a href="#photos">Photos</a>
            <a href="#contact">Visit</a>
          </nav>
          <a href={heroCtaHref} className="rounded-sm border border-current px-3 py-1 text-xs font-semibold uppercase">
            {ctaLabel}
          </a>
        </div>
      </header>

      {sections.hero && <section className={`rounded-sm border px-8 py-10 ${cardClass}`}>{sections.hero}</section>}

      <section className="grid gap-8 md:grid-cols-2">
        {sections.about && <article className={`rounded-sm border p-6 ${cardClass}`}>{sections.about}</article>}
        <div className="space-y-8">
          {sections.menu && <article id="menu" className={`rounded-sm border p-6 ${cardClass}`}>{sections.menu}</article>}
          {sections.reviews && <article id="reviews" className={`rounded-sm border p-6 ${cardClass}`}>{sections.reviews}</article>}
        </div>
      </section>

      {sections.photos && <section id="photos" className="space-y-6">{sections.photos}</section>}
      {sections.contact && <article id="contact" className={`rounded-sm border p-6 ${cardClass}`}>{sections.contact}</article>}
      <StickyMobileCTA label={ctaLabel} href={heroCtaHref} />
    </div>
  );
}
