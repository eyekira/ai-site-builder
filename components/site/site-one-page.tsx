import { AboutSection } from '@/components/site/about-section';
import { ContactSection } from '@/components/site/contact-section';
import { HeroSection } from '@/components/site/hero-section';
import { PhotosSection } from '@/components/site/photos-section';
import { formatHoursFromJson } from '@/lib/hours';
import {
  parseAboutContent,
  parseContactContent,
  parseHeroContent,
  parsePhotosContent,
  type SectionType,
} from '@/lib/section-content';

type SiteSection = {
  id: number;
  type: SectionType | string;
  contentJson: string;
};

type SiteAsset = {
  id: number;
  ref: string;
};

type SiteOnePageProps = {
  businessTitle: string;
  address: string | null;
  phone: string | null;
  hoursJson: string | null;
  lat: number | null;
  lng: number | null;
  sections: SiteSection[];
  assets: SiteAsset[];
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

export function SiteOnePage({
  businessTitle,
  address,
  phone,
  hoursJson,
  lat,
  lng,
  sections,
  assets,
}: SiteOnePageProps) {
  const heroSection = sections.find((section) => section.type === 'HERO');
  const aboutSection = sections.find((section) => section.type === 'ABOUT');
  const photosSection = sections.find((section) => section.type === 'PHOTOS');
  const contactSection = sections.find((section) => section.type === 'CONTACT');

  const heroContent = parseHeroContent(heroSection?.contentJson ?? '{}');
  const aboutContent = parseAboutContent(aboutSection?.contentJson ?? '{}');
  const contactContent = parseContactContent(contactSection?.contentJson ?? '{}');
  const photosContent = parsePhotosContent(photosSection?.contentJson ?? '{}');

  const assetMap = new Map(assets.map((assetItem) => [assetItem.id, assetItem]));
  const selectedPhotos = photosContent.assetIds
    .map((assetId) => assetMap.get(assetId))
    .filter((assetItem): assetItem is SiteAsset => Boolean(assetItem))
    .map((assetItem) => ({ id: assetItem.id, ref: assetItem.ref }));

  const hoursText = parseHoursJson(hoursJson);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <HeroSection businessTitle={businessTitle} content={heroContent} />
      <AboutSection content={aboutContent} />
      <PhotosSection photos={selectedPhotos} />
      <ContactSection
        content={contactContent}
        address={address}
        phone={phone}
        hoursText={hoursText}
        lat={lat}
        lng={lng}
      />
    </div>
  );
}
