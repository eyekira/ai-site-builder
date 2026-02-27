import { type HeroContent } from '@/lib/section-content';

type HeroVariant = 'centered' | 'split' | 'compact';

type HeroSectionProps = {
  businessTitle: string;
  content: HeroContent;
  heroClassName?: string;
  buttonClassName?: string;
  variant?: HeroVariant;
};

export function HeroSection({ businessTitle, content, heroClassName, buttonClassName, variant = 'centered' }: HeroSectionProps) {
  const primaryCta = content.ctas[0];

  if (variant === 'compact') {
    return (
      <section className={`rounded-3xl px-6 py-7 shadow-lg ${heroClassName ?? 'bg-zinc-900 text-white'}`}>
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/60">Local business</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-2xl font-semibold sm:text-3xl">{content.headline || businessTitle}</h1>
          {primaryCta && (
            <a href={primaryCta.href} className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold ${buttonClassName ?? 'bg-white text-zinc-900'}`}>
              {primaryCta.label}
            </a>
          )}
        </div>
        {content.subheadline && <p className="mt-2 text-sm text-white/75">{content.subheadline}</p>}
      </section>
    );
  }

  if (variant === 'split') {
    return (
      <section className={`rounded-3xl px-6 py-10 shadow-lg ${heroClassName ?? 'bg-zinc-900 text-white'}`}>
        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Local business</p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{content.headline || businessTitle}</h1>
            {content.subheadline && <p className="mt-3 text-white/75">{content.subheadline}</p>}
          </div>
          {primaryCta && (
            <div className="flex md:justify-end">
              <a href={primaryCta.href} className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold ${buttonClassName ?? 'bg-white text-zinc-900'}`}>
                {primaryCta.label}
              </a>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className={`rounded-3xl px-6 py-10 shadow-lg ${heroClassName ?? 'bg-zinc-900 text-white'}`}>
      <p className="text-xs uppercase tracking-[0.2em] text-white/60">Local business</p>
      <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{content.headline || businessTitle}</h1>
      {content.subheadline && <p className="mt-3 text-white/70">{content.subheadline}</p>}
      {primaryCta && (
        <a
          href={primaryCta.href}
          className={`mt-6 inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold ${buttonClassName ?? 'bg-white text-zinc-900'}`}
        >
          {primaryCta.label}
        </a>
      )}
    </section>
  );
}
