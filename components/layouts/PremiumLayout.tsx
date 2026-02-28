import { StickyMobileCTA } from '@/components/shared/StickyMobileCTA';
import type { LayoutRenderProps } from './types';

export function PremiumLayout({ title, mutedTextClass, heroCtaHref, ctaLabel, sections }: LayoutRenderProps) {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-10">
      <header className="rounded-2xl border border-white/10 bg-black/40 px-6 py-5 backdrop-blur">
        <div className="text-center">
          <p className={`text-[10px] uppercase tracking-[0.3em] ${mutedTextClass}`}>Premium Experience</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h1>
        </div>
      </header>

      {sections.hero}
      {sections.about}
      {sections.menu}

      <section className="grid gap-8 md:grid-cols-2">
        {sections.reviews}
        {sections.policies ?? sections.contact}
      </section>

      {sections.photos}
      {sections.contact}

      <a
        href={heroCtaHref}
        className="fixed bottom-6 right-6 z-40 hidden rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-zinc-900 shadow-xl md:inline-flex"
      >
        {ctaLabel}
      </a>
      <StickyMobileCTA label={ctaLabel} href={heroCtaHref} />
    </div>
  );
}
