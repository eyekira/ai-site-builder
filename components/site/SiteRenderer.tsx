import { AboutSection } from '@/components/site/about-section';
import { ContactSection } from '@/components/site/contact-section';
import { HeroSection } from '@/components/site/hero-section';
import { PhotosSection } from '@/components/site/photos-section';
import { formatHoursFromJson } from '@/lib/hours';
import type { SiteForRender } from '@/lib/site';
import {
  DEFAULT_ABOUT_CONTENT,
  DEFAULT_CONTACT_CONTENT,
  DEFAULT_HERO_CONTENT,
  DEFAULT_PHOTOS_CONTENT,
  parseAboutContent,
  parseContactContent,
  parseGalleryContent,
  parseHeroContent,
  parseMenuContent,
  parsePhotosContent,
  parseReviewsContent,
} from '@/lib/section-content';
import { parseThemeJson, extractTemplateMetadata } from '@/lib/theme';
import { getTemplatePresentation } from '@/lib/templates/presentation';

type SiteRendererProps = {
  site: SiteForRender;
  embedMode?: boolean;
};

function parseHoursJson(hoursJson: string | null): string | null {
  if (!hoursJson) {
    return null;
  }
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

function safeParseMenuContent(raw: string) {
  return parseMenuContent(raw);
}

function safeParseReviewsContent(raw: string) {
  return parseReviewsContent(raw);
}

function safeParseGalleryContent(raw: string) {
  return parseGalleryContent(raw);
}

export function SiteRenderer({ site, embedMode = false }: SiteRendererProps) {
  const businessTitle = site.businessTitle ?? site.title;
  const address = site.formattedAddress ?? site.place?.address ?? null;
  const phone = site.phone ?? site.place?.phone ?? null;
  const hoursText = parseHoursJson(site.hoursJson ?? site.place?.hoursJson ?? null);
  const lat = site.lat ?? site.place?.lat ?? null;
  const lng = site.lng ?? site.place?.lng ?? null;

  const assetMap = new Map(site.assets.map((assetItem) => [assetItem.id, assetItem]));
  const theme = parseThemeJson(site.themeJson);
  const { templateKey } = extractTemplateMetadata(site.themeJson);
  const presentation = getTemplatePresentation(templateKey);

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

      <div
        data-site-embed={embedMode ? 'true' : undefined}
        className={`mx-auto flex w-full ${presentation.containerWidth} flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8 ${theme.sectionBackgroundClass}`}
      >
        <header
          className={`rounded-2xl border px-4 py-3 ${theme.cardClass} ${
            presentation.navStyle === 'luxury' ? 'shadow-lg' : presentation.navStyle === 'casual' ? 'shadow-sm' : ''
          }`}
        >
          <div
            className={`flex items-center gap-4 ${
              presentation.logoPlacement === 'center' ? 'justify-center' : 'justify-between'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${theme.previewClass}`}>
                {businessTitle.slice(0, 1).toUpperCase()}
              </div>
              <span className="text-sm font-semibold tracking-wide">{businessTitle}</span>
            </div>
            {presentation.logoPlacement !== 'center' && (
              <nav className={`hidden items-center gap-4 text-xs ${theme.mutedTextClass} md:flex`}>
                {presentation.navItems.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </nav>
            )}
          </div>
        </header>

        {site.sections.map((section) => {
          if (section.type === 'HERO') {
            const heroContent = safeParseHeroContent(section.contentJson ?? '{}');

            return (
              <HeroSection
                key={section.id}
                businessTitle={businessTitle}
                content={heroContent}
                heroClassName={theme.heroClass}
                buttonClassName={theme.buttonClass}
                variant={presentation.heroVariant}
              />
            );
          }

          if (section.type === 'ABOUT') {
            const aboutContent = safeParseAboutContent(section.contentJson ?? '{}');

            return (
              <AboutSection
                key={section.id}
                content={aboutContent}
                cardClassName={theme.cardClass}
                mutedTextClassName={theme.mutedTextClass}
                bulletClassName={theme.accentTextClass.replace('text-', 'bg-')}
              />
            );
          }

          if (section.type === 'PHOTOS') {
            if (site.photos.length > 0) {
              return (
                <PhotosSection
                  key={section.id}
                  photos={site.photos.map((photo) => ({
                    id: photo.id,
                    url: photo.url,
                    category: photo.category,
                    isHero: photo.isHero,
                  }))}
                />
              );
            }

            const photosContent = safeParsePhotosContent(section.contentJson ?? '{}');
            const selectedPhotos = photosContent.assetIds
              .map((assetId) => assetMap.get(assetId))
              .filter((assetItem): assetItem is { id: number; ref: string } => Boolean(assetItem))
              .map((assetItem) => ({
                id: assetItem.id,
                url: `/api/places/photo?ref=${encodeURIComponent(assetItem.ref)}&maxwidth=1200`,
              }));

            return <PhotosSection key={section.id} photos={selectedPhotos} />;
          }

          if (section.type === 'MENU') {
            const menuContent = safeParseMenuContent(section.contentJson ?? '{}');

            return (
              <section key={section.id} className={`${presentation.sectionClass} ${theme.cardClass}`}>
                <h2 className={presentation.headingClass}>{menuContent.title}</h2>
                <div className={presentation.menuStyle === 'dense' ? 'mt-3 space-y-2' : 'mt-4 space-y-4'}>
                  {menuContent.items.map((item, index) => (
                    <div key={`${item.name}-${index}`} className={presentation.menuStyle === 'dense' ? presentation.menuItemClass : 'flex items-start justify-between gap-6'}>
                      <div>
                        <p className="text-base font-semibold">{item.name}</p>
                        {item.description && <p className={`mt-1 text-sm ${theme.mutedTextClass}`}>{item.description}</p>}
                      </div>
                      {item.price && <span className="text-sm font-semibold">{item.price}</span>}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (section.type === 'REVIEWS') {
            const reviewsContent = safeParseReviewsContent(section.contentJson ?? '{}');

            return (
              <section key={section.id} className={`${presentation.sectionClass} ${theme.cardClass}`}>
                <h2 className={presentation.headingClass}>{reviewsContent.title}</h2>
                <div className="mt-4 grid gap-4">
                  {reviewsContent.items.map((item, index) => (
                    <div
                      key={`${item.author}-${index}`}
                      className={
                        presentation.reviewStyle === 'quotes'
                          ? 'rounded-xl border-l-4 border-amber-400 bg-black/20 p-4'
                          : 'rounded-xl border border-zinc-200 p-4'
                      }
                    >
                      <div className="text-sm font-semibold text-amber-500">{'★'.repeat(item.rating)}</div>
                      {item.quote && <p className={`mt-2 text-sm ${theme.mutedTextClass}`}>{item.quote}</p>}
                      <p className="mt-3 text-sm font-semibold">{item.author}</p>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (section.type === 'GALLERY') {
            const galleryContent = safeParseGalleryContent(section.contentJson ?? '{}');

            return (
              <section key={section.id} className={`${presentation.sectionClass} ${theme.cardClass}`}>
                <h2 className={presentation.headingClass}>{galleryContent.title}</h2>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {galleryContent.items.map((item, index) => (
                    <figure key={`${item.url}-${index}`} className="overflow-hidden rounded-xl border border-zinc-200">
                      <img src={item.url} alt={item.caption || 'Gallery image'} className="h-48 w-full object-cover" />
                      {item.caption && <figcaption className={`px-3 py-2 text-sm ${theme.mutedTextClass}`}>{item.caption}</figcaption>}
                    </figure>
                  ))}
                </div>
              </section>
            );
          }

          if (section.type === 'CONTACT') {
            const contactContent = safeParseContactContent(section.contentJson ?? '{}');

            return (
              <ContactSection
                key={section.id}
                content={contactContent}
                address={address}
                phone={phone}
                hoursText={hoursText}
                lat={lat}
                lng={lng}
                cardClassName={theme.cardClass}
                mutedTextClassName={theme.mutedTextClass}
                buttonClassName={theme.buttonClass}
              />
            );
          }

          return null;
        })}
      </div>
    </>
  );
}
