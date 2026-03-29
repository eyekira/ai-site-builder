import type { HeroContent } from '@/lib/section-content';
import type { ThemeLayoutConfig } from '@/lib/themes/schema';

type Props = {
  businessTitle: string;
  content: HeroContent;
  heroClass: string;
  buttonClass: string;
  layout: ThemeLayoutConfig;
};

export function ThemedHero({ businessTitle, content, heroClass, buttonClass, layout }: Props) {
  const primaryCta = content.ctas[0];
  const headline = content.headline || businessTitle;

  if (layout.hero.pattern === 'compact_cta') {
    return (
      <section className={`rounded-3xl px-6 py-7 shadow-lg ${heroClass}`}>
        <h1 className="text-2xl font-semibold sm:text-3xl">{headline}</h1>
        {content.subheadline && <p className="mt-2 text-sm opacity-80">{content.subheadline}</p>}
        {primaryCta && <a href={primaryCta.href} className={`mt-4 inline-flex rounded-full px-4 py-2 text-sm font-semibold ${buttonClass}`}>{primaryCta.label}</a>}
      </section>
    );
  }

  if (layout.hero.pattern === 'split') {
    return (
      <section className={`rounded-3xl px-6 py-10 shadow-lg ${heroClass}`}>
        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div>
            <h1 className="text-3xl font-semibold sm:text-4xl">{headline}</h1>
            {content.subheadline && <p className="mt-3 opacity-80">{content.subheadline}</p>}
          </div>
          {primaryCta && <a href={primaryCta.href} className={`inline-flex rounded-full px-6 py-3 text-sm font-semibold ${buttonClass}`}>{primaryCta.label}</a>}
        </div>
      </section>
    );
  }

  if (layout.hero.pattern === 'overlay') {
    return (
      <section className={`relative overflow-hidden rounded-3xl px-6 py-14 shadow-lg ${heroClass}`}>
        <div className="absolute inset-0 bg-black/25" />
        <div className="relative">
          <h1 className="text-3xl font-semibold sm:text-4xl">{headline}</h1>
          {content.subheadline && <p className="mt-3 max-w-xl opacity-90">{content.subheadline}</p>}
          {primaryCta && <a href={primaryCta.href} className={`mt-6 inline-flex rounded-full px-6 py-3 text-sm font-semibold ${buttonClass}`}>{primaryCta.label}</a>}
        </div>
      </section>
    );
  }

  return (
    <section className={`rounded-3xl px-6 py-10 shadow-lg ${heroClass}`}>
      <h1 className="text-3xl font-semibold sm:text-4xl">{headline}</h1>
      {content.subheadline && <p className="mt-3 opacity-80">{content.subheadline}</p>}
      {primaryCta && <a href={primaryCta.href} className={`mt-6 inline-flex rounded-full px-5 py-2 text-sm font-semibold ${buttonClass}`}>{primaryCta.label}</a>}
    </section>
  );
}
