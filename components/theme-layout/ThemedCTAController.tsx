import { StickyMobileCTA } from '@/components/shared/StickyMobileCTA';
import type { ThemeLayoutConfig } from '@/lib/themes/schema';

export function ThemedCTAController({ layout, href }: { layout: ThemeLayoutConfig; href: string }) {
  if (layout.cta.placement === 'sticky_footer') {
    return <StickyMobileCTA label={layout.cta.primaryLabelHint} href={href} />;
  }

  if (layout.cta.placement === 'floating') {
    return (
      <a
        href={href}
        className="fixed bottom-6 right-6 z-40 hidden rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-lg md:inline-flex"
      >
        {layout.cta.primaryLabelHint}
      </a>
    );
  }

  return null;
}
