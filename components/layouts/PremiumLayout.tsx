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

      <section className="rounded-2xl border border-white/10 bg-black/30 px-8 py-12">{sections.hero}</section>
      <section className="rounded-2xl border border-white/10 bg-black/20 px-8 py-8">{sections.about}</section>
      <section className="rounded-2xl border border-white/10 bg-black/20 px-8 py-8">{sections.menu}</section>

      <section className="grid gap-8 md:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-black/20 px-6 py-6">{sections.reviews}</article>
        <article className="rounded-2xl border border-white/10 bg-black/20 px-6 py-6">{sections.policies ?? sections.contact}</article>
      </section>

      <section className="rounded-2xl border border-white/10 bg-black/20 px-8 py-8">{sections.photos}</section>
      <section className="rounded-2xl border border-white/10 bg-black/20 px-8 py-8">{sections.contact}</section>

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
