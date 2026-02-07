import { Card, CardContent } from '@/components/ui/card';
import { parseAboutContent, parseContactContent, parseHeroContent } from '@/lib/section-content';
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
