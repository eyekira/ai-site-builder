import type { HeroContent } from '@/lib/section-content';

export function HeroContentBlock({
  businessTitle,
  content,
  heroClassName,
  buttonClassName,
}: {
  businessTitle: string;
  content: HeroContent;
  heroClassName: string;
  buttonClassName: string;
}) {
  const primary = content.ctas[0];
  return (
    <>
      <p className="text-[10px] uppercase tracking-[0.22em] opacity-70">Local business</p>
      <h1 className={`mt-2 text-3xl font-semibold sm:text-4xl ${heroClassName}`}>{content.headline || businessTitle}</h1>
      {content.subheadline && <p className="mt-3 text-sm opacity-80">{content.subheadline}</p>}
      {primary && (
        <a href={primary.href} className={`mt-5 inline-flex rounded-full px-5 py-2 text-sm font-semibold ${buttonClassName}`}>
          {primary.label}
        </a>
      )}
    </>
  );
}
