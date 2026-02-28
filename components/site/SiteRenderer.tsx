import { LAYOUT_COMPONENTS } from '@/components/layouts/layout-registry';
import { AboutContentBlock } from '@/components/sections/AboutContent';
import { ContactContentBlock } from '@/components/sections/ContactContent';
import { HeroContentBlock } from '@/components/sections/HeroContent';
import { MenuSection } from '@/components/sections/MenuSection';
import { PhotosContent } from '@/components/sections/PhotosContent';
import { PoliciesSection } from '@/components/sections/PoliciesSection';
import { ReviewsSection } from '@/components/sections/ReviewsSection';
import { formatHoursFromJson } from '@/lib/hours';
import type { SiteForRender } from '@/lib/site';
import {
  DEFAULT_ABOUT_CONTENT,
  DEFAULT_CONTACT_CONTENT,
  DEFAULT_HERO_CONTENT,
  DEFAULT_PHOTOS_CONTENT,
  parseAboutContent,
  parseContactContent,
  parseHeroContent,
  parseMenuContent,
  parsePhotosContent,
  parseReviewsContent,
} from '@/lib/section-content';
import { parseThemeJson } from '@/lib/theme';
import { resolveThemeLayoutKey } from '@/lib/themes/registry';
import { parseBrandPack } from '@/lib/brandpack/parse';
import { ALL_FONT_VARIABLES, FONT_CLASS_BY_KEY } from '@/lib/brandpack/fonts';


type SiteRendererProps = {
  site: SiteForRender;
  embedMode?: boolean;
};

function parseHoursJson(hoursJson: string | null): string | null {
  if (!hoursJson) return null;
  try {
    const record = JSON.parse(hoursJson) as Record<string, unknown>;
    return formatHoursFromJson(record);
  } catch {
    return null;
  }
}

function safeParseHeroContent(raw: string) {
  try {
    return parseHeroContent(raw);
  } catch {
    return DEFAULT_HERO_CONTENT;
  }
}

function safeParseAboutContent(raw: string) {
  try {
    return parseAboutContent(raw);
  } catch {
    return DEFAULT_ABOUT_CONTENT;
  }
}

function safeParseContactContent(raw: string) {
  try {
    return parseContactContent(raw);
  } catch {
    return DEFAULT_CONTACT_CONTENT;
  }
}

function safeParsePhotosContent(raw: string) {
  try {
    return parsePhotosContent(raw);
  } catch {
    return DEFAULT_PHOTOS_CONTENT;
  }
}

export function SiteRenderer({ site, embedMode = false }: SiteRendererProps) {
  const businessTitle = site.businessTitle ?? site.title;
  const address = site.formattedAddress ?? site.place?.address ?? null;
  const phone = site.phone ?? site.place?.phone ?? null;
  const hoursText = parseHoursJson(site.hoursJson ?? site.place?.hoursJson ?? null);

  const theme = parseThemeJson(site.themeJson);
  const layoutKey = resolveThemeLayoutKey(site.themeJson);
  const Layout = LAYOUT_COMPONENTS[layoutKey] ?? LAYOUT_COMPONENTS.bistro_editorial;
  const brandPack = parseBrandPack(site.brandPackJson);
  const headingFontClass = FONT_CLASS_BY_KEY[brandPack.typography.headingFontKey];
  const bodyFontClass = FONT_CLASS_BY_KEY[brandPack.typography.bodyFontKey];

  const heroSection = site.sections.find((section) => section.type === 'HERO');
  const aboutSection = site.sections.find((section) => section.type === 'ABOUT');
  const menuSection = site.sections.find((section) => section.type === 'MENU');
  const photosSection = site.sections.find((section) => section.type === 'PHOTOS');
  const reviewsSection = site.sections.find((section) => section.type === 'REVIEWS');
  const contactSection = site.sections.find((section) => section.type === 'CONTACT');

  const assetMap = new Map(site.assets.map((assetItem) => [assetItem.id, assetItem]));

  const photos =
    site.photos.length > 0
      ? site.photos.map((photo) => ({ id: photo.id, url: photo.url, category: photo.category, isHero: photo.isHero }))
      : (() => {
          if (!photosSection) return [];
          const parsed = safeParsePhotosContent(photosSection.contentJson ?? '{}');
          return parsed.assetIds
            .map((assetId) => assetMap.get(assetId))
            .filter((assetItem): assetItem is { id: number; ref: string } => Boolean(assetItem))
            .map((assetItem) => ({
              id: assetItem.id,
              url: `/api/places/photo?ref=${encodeURIComponent(assetItem.ref)}&maxwidth=1200`,
            }));
        })();

  const heroHref = (() => {
    if (!heroSection) return '#';
    try {
      const parsed = JSON.parse(heroSection.contentJson ?? '{}') as { ctas?: Array<{ href?: string; label?: string }> };
      return parsed.ctas?.[0]?.href ?? '#';
    } catch {
      return '#';
    }
  })();

  const ctaLabel = (() => {
    if (!heroSection) return 'Reserve';
    try {
      const parsed = JSON.parse(heroSection.contentJson ?? '{}') as { ctas?: Array<{ href?: string; label?: string }> };
      return parsed.ctas?.[0]?.label ?? 'Reserve';
    } catch {
      return 'Reserve';
    }
  })();

  const sections = {
    hero: heroSection ? (
      <HeroContentBlock
        businessTitle={businessTitle}
        content={safeParseHeroContent(heroSection.contentJson ?? '{}')}
        heroClassName="text-current"
        buttonClassName={theme.buttonClass}
      />
    ) : undefined,
    about: aboutSection ? <AboutContentBlock content={safeParseAboutContent(aboutSection.contentJson ?? '{}')} mutedTextClass={theme.mutedTextClass} /> : undefined,
    menu: menuSection ? <MenuSection content={parseMenuContent(menuSection.contentJson ?? '{}')} mutedTextClass={theme.mutedTextClass} /> : undefined,
    photos: photos.length > 0 ? <PhotosContent photos={photos} /> : undefined,
    reviews: reviewsSection ? <ReviewsSection content={parseReviewsContent(reviewsSection.contentJson ?? '{}')} mutedTextClass={theme.mutedTextClass} /> : undefined,
    contact: contactSection ? (
      <ContactContentBlock
        content={safeParseContactContent(contactSection.contentJson ?? '{}')}
        address={address}
        phone={phone}
        hoursText={hoursText}
        buttonClassName={theme.buttonClass}
        mutedTextClass={theme.mutedTextClass}
      />
    ) : undefined,
    policies: <PoliciesSection />,
  };

  return (
    <>
      {embedMode && (
        <style>{`
          body:has([data-site-embed="true"]) header,
          body:has([data-site-embed="true"]) main > div[class*="container"],
          body:has([data-site-embed="true"]) hr { display: none; }
          body:has([data-site-embed="true"]) main { max-width: 100%; padding: 0; }
        `}</style>
      )}

      <div
        data-site-embed={embedMode ? 'true' : undefined}
        className={`mx-auto flex w-full flex-col gap-6 bg-[var(--brand-bg)] px-4 py-10 text-[var(--brand-text)] sm:px-6 lg:px-8 ${ALL_FONT_VARIABLES} ${bodyFontClass}`}
        style={{
          ['--brand-primary' as string]: brandPack.palette.primary,
          ['--brand-secondary' as string]: brandPack.palette.secondary,
          ['--brand-accent' as string]: brandPack.palette.accent,
          ['--brand-bg' as string]: brandPack.palette.background,
          ['--brand-surface' as string]: brandPack.palette.surface,
          ['--brand-text' as string]: brandPack.palette.text,
          ['--brand-muted' as string]: brandPack.palette.muted,
          ['--brand-border' as string]: brandPack.palette.border,
        }}
      >
        <div className={headingFontClass}>
          <Layout
            title={businessTitle}
            mutedTextClass={theme.mutedTextClass}
            cardClass={theme.cardClass}
            heroCtaHref={heroHref}
            ctaLabel={ctaLabel}
            sections={sections}
          />
        </div>
      </div>
    </>
  );
}
