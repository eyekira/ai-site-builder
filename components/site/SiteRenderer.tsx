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
  parseHeroContent,
  parsePhotosContent,
} from '@/lib/section-content';

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

export function SiteRenderer({ site, embedMode = false }: SiteRendererProps) {
  const businessTitle = site.businessTitle ?? site.title;
  const address = site.formattedAddress ?? site.place?.address ?? null;
  const phone = site.phone ?? site.place?.phone ?? null;
  const hoursText = parseHoursJson(site.hoursJson ?? site.place?.hoursJson ?? null);
  const lat = site.lat ?? site.place?.lat ?? null;
  const lng = site.lng ?? site.place?.lng ?? null;

  const assetMap = new Map(site.assets.map((assetItem) => [assetItem.id, assetItem]));

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
        className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8"
      >
        {site.sections.map((section) => {
          if (section.type === 'HERO') {
            const heroContent = safeParseHeroContent(section.contentJson ?? '{}');

            return <HeroSection key={section.id} businessTitle={businessTitle} content={heroContent} />;
          }

          if (section.type === 'ABOUT') {
            const aboutContent = safeParseAboutContent(section.contentJson ?? '{}');

            return <AboutSection key={section.id} content={aboutContent} />;
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
              />
            );
          }

          return null;
        })}
      </div>
    </>
  );
}
