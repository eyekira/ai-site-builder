import { StickyMobileCTA } from '@/components/shared/StickyMobileCTA';
import type { LayoutRenderProps } from './types';

export function BistroLayout({ title, mutedTextClass, cardClass, heroCtaHref, ctaLabel, sections }: LayoutRenderProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <header className={`rounded-sm border px-6 py-4 ${cardClass}`}>
        <div className="flex items-center justify-center gap-8">
          <span className={`text-xs uppercase tracking-[0.2em] ${mutedTextClass}`}>Bistro Editorial</span>
          <h1 className="text-lg font-semibold tracking-wide">{title}</h1>
          <a href={heroCtaHref} className="rounded-sm border border-current px-3 py-1 text-xs font-semibold uppercase">
            {ctaLabel}
          </a>
        </div>
      </header>

      {sections.hero}

      <section className="grid gap-8 md:grid-cols-2">
        {sections.about}
        <div className="space-y-8">
          {sections.menu}
          {sections.reviews}
        </div>
      </section>

      {sections.photos}
      {sections.contact}
      <StickyMobileCTA label={ctaLabel} href={heroCtaHref} />
    </div>
  );
}
