import { Button } from '@/components/ui/button';
import type { HeroContent } from '@/lib/section-content';

export function HeroContentBlock({
  businessTitle,
  content,
  heroClassName,
}: {
  businessTitle: string;
  content: HeroContent;
  heroClassName: string;
}) {
  const primary = content.ctas[0];
  return (
    <>
      <p className="text-[10px] uppercase tracking-[0.22em] opacity-70">Local business</p>
      <h1 className={`mt-2 text-3xl font-semibold sm:text-4xl ${heroClassName}`}>{content.headline || businessTitle}</h1>
      {content.subheadline && <p className="mt-3 text-sm opacity-80">{content.subheadline}</p>}
      {primary && (
        <Button asChild intent="primary" variant="solid" size="md" className="mt-5">
          <a href={primary.href}>{primary.label}</a>
        </Button>
      )}
    </>
  );
}
