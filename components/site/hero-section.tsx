import { type HeroContent } from '@/lib/section-content';

type HeroSectionProps = {
  businessTitle: string;
  content: HeroContent;
  heroClassName?: string;
  buttonClassName?: string;
};

export function HeroSection({ businessTitle, content, heroClassName, buttonClassName }: HeroSectionProps) {
  const primaryCta = content.ctas[0];

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
