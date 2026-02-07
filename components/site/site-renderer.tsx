import { Card, CardContent } from '@/components/ui/card';
import {
  parseAboutContent,
  parseContactContent,
  parseGalleryContent,
  parseHeroContent,
  parseMenuContent,
  parseReviewsContent,
} from '@/lib/section-content';
import { parseThemeJson } from '@/lib/theme';

type SiteSection = {
  id: number;
  type: string;
  contentJson: string;
};

type SiteRendererProps = {
  title: string;
  sections: SiteSection[];
  themeJson?: string | null;
  embedMode?: boolean;
};

export function SiteRenderer({ title, sections, themeJson, embedMode = false }: SiteRendererProps) {
  const theme = parseThemeJson(themeJson);

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

      <section
        data-site-embed={embedMode ? 'true' : undefined}
        className={`flex w-full flex-col gap-6 ${
          embedMode ? `mx-0 max-w-none p-6 ${theme.sectionBackgroundClass}` : 'mx-auto max-w-3xl'
        }`}
      >
        {sections.map((section) => {
          if (section.type === 'HERO') {
            const content = parseHeroContent(section.contentJson);

            return (
              <Card key={section.id} className={`rounded-2xl ${theme.heroClass}`}>
                <CardContent className="p-8">
                  <h1 className="text-4xl font-bold">{content.headline || title}</h1>
                  {content.subheadline && <p className="mt-2 text-white/80">{content.subheadline}</p>}
                  <div className="mt-5 flex flex-wrap gap-3">
                    {content.ctas.map((cta, index) => (
                      <a
                        key={`${cta.label}-${cta.href}-${index}`}
                        href={cta.href}
                        className={`rounded-md px-4 py-2 text-sm font-medium ${theme.buttonClass}`}
                      >
                        {cta.label}
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          }

          if (section.type === 'ABOUT') {
            const content = parseAboutContent(section.contentJson);

            return (
              <Card key={section.id} className={`rounded-2xl ${theme.cardClass}`}>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold">About</h2>
                  <p className={`mt-2 ${theme.mutedTextClass}`}>{content.text}</p>
                </CardContent>
              </Card>
            );
          }

          if (section.type === 'CONTACT') {
            const content = parseContactContent(section.contentJson);

            return (
              <Card key={section.id} className={`rounded-2xl ${theme.cardClass}`}>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold">Contact</h2>
                  <div className={`mt-3 space-y-1 ${theme.mutedTextClass}`}>
                    {content.address && <p>Address: {content.address}</p>}
                    {content.phone && <p>Phone: {content.phone}</p>}
                    {content.website && (
                      <p>
                        Website:{' '}
                        <a href={content.website} className={`underline underline-offset-4 ${theme.accentTextClass}`}>
                          {content.website}
                        </a>
                      </p>
                    )}
                    {content.hours && <p>Hours: {content.hours}</p>}
                  </div>
                </CardContent>
              </Card>
            );
          }

          if (section.type === 'MENU') {
            const content = parseMenuContent(section.contentJson);

            return (
              <Card key={section.id} className={`rounded-2xl ${theme.cardClass}`}>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold">{content.title}</h2>
                  <div className="mt-4 space-y-4">
                    {content.items.map((item, index) => (
                      <div key={`${item.name}-${index}`} className="flex items-start justify-between gap-6">
                        <div>
                          <p className="text-base font-semibold">{item.name}</p>
                          {item.description && <p className={`mt-1 text-sm ${theme.mutedTextClass}`}>{item.description}</p>}
                        </div>
                        {item.price && <span className="text-sm font-semibold text-zinc-900">{item.price}</span>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          }

          if (section.type === 'GALLERY') {
            const content = parseGalleryContent(section.contentJson);

            return (
              <Card key={section.id} className={`rounded-2xl ${theme.cardClass}`}>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold">{content.title}</h2>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {content.items.map((item, index) => (
                      <figure key={`${item.url}-${index}`} className="overflow-hidden rounded-xl border border-zinc-200">
                        <img src={item.url} alt={item.caption || 'Gallery image'} className="h-48 w-full object-cover" />
                        {item.caption && <figcaption className={`px-3 py-2 text-sm ${theme.mutedTextClass}`}>{item.caption}</figcaption>}
                      </figure>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          }

          if (section.type === 'REVIEWS') {
            const content = parseReviewsContent(section.contentJson);

            return (
              <Card key={section.id} className={`rounded-2xl ${theme.cardClass}`}>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold">{content.title}</h2>
                  <div className="mt-4 grid gap-4">
                    {content.items.map((item, index) => (
                      <div key={`${item.author}-${index}`} className="rounded-xl border border-zinc-200 p-4">
                        <div className="text-sm font-semibold text-amber-500">{'★'.repeat(item.rating)}</div>
                        {item.quote && <p className={`mt-2 text-sm ${theme.mutedTextClass}`}>{item.quote}</p>}
                        <p className="mt-3 text-sm font-semibold text-zinc-900">{item.author}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          }

          return (
            <Card key={section.id} className={`rounded-2xl ${theme.cardClass}`}>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold">{section.type}</h2>
                <p className={`mt-2 ${theme.mutedTextClass}`}>Coming soon.</p>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </>
  );
}
