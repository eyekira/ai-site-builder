import { ThemeLayoutRenderer } from '@/components/theme-layout/ThemeLayoutRenderer';
import { formatHoursFromJson } from '@/lib/hours';
import type { SiteForRender } from '@/lib/site';
import { DEFAULT_PHOTOS_CONTENT, parsePhotosContent } from '@/lib/section-content';
import { parseThemeJson } from '@/lib/theme';
import { resolveThemeLayoutKey, themeLayoutRegistry } from '@/lib/themes/registry';

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
  const lat = site.lat ?? site.place?.lat ?? null;
  const lng = site.lng ?? site.place?.lng ?? null;

  const theme = parseThemeJson(site.themeJson);
  const layoutKey = resolveThemeLayoutKey(site.themeJson);
  const layout = themeLayoutRegistry[layoutKey];

  const assetMap = new Map(site.assets.map((assetItem) => [assetItem.id, assetItem]));
  const photos =
    site.photos.length > 0
      ? site.photos.map((photo) => ({ id: photo.id, url: photo.url, category: photo.category, isHero: photo.isHero }))
      : (() => {
          const photosSection = site.sections.find((section) => section.type === 'PHOTOS');
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

  const heroSection = site.sections.find((section) => section.type === 'HERO');
  const heroHref = (() => {
    if (!heroSection) return '#';
    try {
      const parsed = JSON.parse(heroSection.contentJson ?? '{}') as { ctas?: Array<{ href?: string }> };
      return parsed.ctas?.[0]?.href ?? '#';
    } catch {
      return '#';
    }
  })();

  return (
    <>
      {embedMode && (
        <style>{`
          body:has([data-site-embed="true"]) header,
          body:has([data-site-embed="true"]) main > div[class*="container"],
          body:has([data-site-embed="true"]) hr {
            display: none;
          }

          body:has([data-site-embed="true"]) main {
            max-width: 100%;
            padding: 0;
          }
        `}</style>
      )}

      <div data-site-embed={embedMode ? 'true' : undefined} className={`mx-auto flex w-full flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8 ${theme.sectionBackgroundClass}`}>
        <ThemeLayoutRenderer
          site={site}
          businessTitle={businessTitle}
          cardClass={theme.cardClass}
          heroClass={theme.heroClass}
          buttonClass={theme.buttonClass}
          mutedTextClass={theme.mutedTextClass}
          layout={layout}
          photos={photos}
          contact={{ address, phone, hoursText, lat, lng }}
          heroCtaHref={heroHref}
        />
      </div>
    </>
  );
}
