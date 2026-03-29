import { ContactSection } from '@/components/site/contact-section';
import { ThemedAbout } from '@/components/theme-layout/ThemedAbout';
import { ThemedCTAController } from '@/components/theme-layout/ThemedCTAController';
import { ThemedHero } from '@/components/theme-layout/ThemedHero';
import { ThemedNav } from '@/components/theme-layout/ThemedNav';
import { ThemedPhotos } from '@/components/theme-layout/ThemedPhotos';
import {
  parseAboutContent,
  parseContactContent,
  parseHeroContent,
  parseMenuContent,
  parseReviewsContent,
  type SectionType,
} from '@/lib/section-content';
import type { SiteForRender } from '@/lib/site';
import type { ThemeLayoutConfig } from '@/lib/themes/schema';

type Props = {
  site: SiteForRender;
  businessTitle: string;
  cardClass: string;
  heroClass: string;
  buttonClass: string;
  mutedTextClass: string;
  layout: ThemeLayoutConfig;
  photos: Array<{ id: number; url: string; category?: string; isHero?: boolean }>;
  contact: {
    address: string | null;
    phone: string | null;
    hoursText: string | null;
    lat: number | null;
    lng: number | null;
  };
  heroCtaHref: string;
  headingFontClass?: string;
};

function sectionByType(site: SiteForRender, type: SectionType) {
  return site.sections.find((s) => s.type === type) ?? null;
}

export function ThemeLayoutRenderer(props: Props) {
  const {
    site,
    businessTitle,
    cardClass,
    heroClass,
    buttonClass,
    mutedTextClass,
    layout,
    photos,
    contact,
    heroCtaHref,
    headingFontClass,
  } = props;

  return (
    <>
      <ThemedNav title={businessTitle} mutedTextClass={mutedTextClass} cardClass={cardClass} previewClass={heroClass} layout={layout} />

      {layout.sectionOrder.map((item) => {
        if (item === 'hero') {
          const section = sectionByType(site, 'HERO');
          if (!section) return null;
          return (
            <ThemedHero
              key={`hero-${section.id}`}
              businessTitle={businessTitle}
              content={parseHeroContent(section.contentJson)}
              heroClass={heroClass}
              buttonClass={buttonClass}
              layout={layout}
            />
          );
        }

        if (item === 'about') {
          const section = sectionByType(site, 'ABOUT');
          if (!section) return null;
          return (
            <ThemedAbout
              key={`about-${section.id}`}
              content={parseAboutContent(section.contentJson)}
              layout={layout}
              cardClass={cardClass}
              mutedTextClass={mutedTextClass}
            />
          );
        }

        if (item === 'menu') {
          const section = sectionByType(site, 'MENU');
          if (!section) return null;
          const menu = parseMenuContent(section.contentJson);
          return (
            <section key={`menu-${section.id}`} className={`rounded-3xl p-6 shadow-sm ${cardClass}`}>
              <h2 className={`text-2xl font-semibold ${headingFontClass ?? ''}`}>{menu.title}</h2>
              <div className="mt-4 space-y-4">
                {menu.items.map((m, i) => (
                  <div key={`${m.name}-${i}`} className="flex items-start justify-between gap-6">
                    <div>
                      <p className="text-base font-semibold">{m.name}</p>
                      {m.description && <p className={`mt-1 text-sm ${mutedTextClass}`}>{m.description}</p>}
                    </div>
                    {m.price && <span className="text-sm font-semibold">{m.price}</span>}
                  </div>
                ))}
              </div>
            </section>
          );
        }

        if (item === 'photos') {
          if (photos.length === 0) return null;
          return <ThemedPhotos key="photos" items={photos} layout={layout} cardClass={cardClass} />;
        }

        if (item === 'reviews') {
          const section = sectionByType(site, 'REVIEWS');
          if (!section) return null;
          const reviews = parseReviewsContent(section.contentJson);
          return (
            <section key={`reviews-${section.id}`} className={`rounded-3xl p-6 shadow-sm ${cardClass}`}>
              <h2 className={`text-2xl font-semibold ${headingFontClass ?? ''}`}>{reviews.title}</h2>
              <div className="mt-4 grid gap-4">
                {reviews.items.map((r, i) => (
                  <div key={`${r.author}-${i}`} className="rounded-xl border border-zinc-200 p-4">
                    <div className="text-sm font-semibold text-amber-500">{'★'.repeat(r.rating)}</div>
                    {r.quote && <p className={`mt-2 text-sm ${mutedTextClass}`}>{r.quote}</p>}
                    <p className="mt-3 text-sm font-semibold">{r.author}</p>
                  </div>
                ))}
              </div>
            </section>
          );
        }

        if (item === 'contact') {
          const section = sectionByType(site, 'CONTACT');
          if (!section) return null;
          return (
            <ContactSection
              key={`contact-${section.id}`}
              content={parseContactContent(section.contentJson)}
              address={contact.address}
              phone={contact.phone}
              hoursText={contact.hoursText}
              lat={contact.lat}
              lng={contact.lng}
              cardClassName={cardClass}
              mutedTextClassName={mutedTextClass}
              buttonClassName={buttonClass}
            />
          );
        }

        return null;
      })}

      <ThemedCTAController layout={layout} href={heroCtaHref} />
    </>
  );
}
