import type { LayoutRenderProps } from './types';

export function BakeryLayout({ title, mutedTextClass, heroCtaHref, ctaLabel, sections }: LayoutRenderProps) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-7">
      <header className="rounded-2xl border border-pink-100 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-[10px] uppercase tracking-[0.2em] ${mutedTextClass}`}>Cozy Bakery</p>
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
          <a href={heroCtaHref} className="rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white">
            {ctaLabel}
          </a>
        </div>
      </header>

      {sections.hero && <section className="rounded-3xl border border-pink-100 bg-white px-6 py-8 shadow-sm">{sections.hero}</section>}
      {sections.photos && <section className="rounded-3xl border border-pink-100 bg-white px-6 py-6 shadow-sm">{sections.photos}</section>}
      <section className="grid gap-6 md:grid-cols-2">
        {sections.menu && <article className="rounded-3xl border border-pink-100 bg-white px-6 py-6 shadow-sm">{sections.menu}</article>}
        <div className="space-y-6">
          {sections.about && <article className="rounded-3xl border border-pink-100 bg-white px-6 py-6 shadow-sm">{sections.about}</article>}
          {sections.reviews && <article className="rounded-3xl border border-pink-100 bg-white px-6 py-6 shadow-sm">{sections.reviews}</article>}
        </div>
      </section>
      {sections.contact && <section className="rounded-3xl border border-pink-100 bg-white px-6 py-6 shadow-sm">{sections.contact}</section>}
    </div>
  );
}
