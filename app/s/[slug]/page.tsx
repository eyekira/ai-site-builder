import { notFound } from 'next/navigation';
import { SiteStatus } from '@prisma/client';

import { Card, CardContent } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import { parseAboutContent, parseContactContent, parseHeroContent } from '@/lib/section-content';

type SitePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ embed?: string | string[]; preview?: string | string[]; token?: string | string[] }>;
};

function isEmbedMode(embedParam: string | string[] | undefined): boolean {
  const embedValue = Array.isArray(embedParam) ? embedParam[0] : embedParam;

  return embedValue === '1' || embedValue === 'true';
}

function isPreviewAllowed(
  previewParam: string | string[] | undefined,
  tokenParam: string | string[] | undefined,
  siteToken: string | null,
): boolean {
  const previewValue = Array.isArray(previewParam) ? previewParam[0] : previewParam;
  if (previewValue !== '1' && previewValue !== 'true') {
    return false;
  }

  const tokenValue = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;
  const allowedTokens = [siteToken, process.env.PREVIEW_TOKEN].filter((token): token is string => Boolean(token));

  return Boolean(tokenValue && allowedTokens.includes(tokenValue));
}

export default async function SitePage({ params, searchParams }: SitePageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const embedMode = isEmbedMode(query.embed);

  const site = await prisma.site.findUnique({
    where: { slug },
    include: {
      sections: {
        orderBy: { order: 'asc' },
      },
      place: true,
    },
  });

  if (!site) {
    notFound();
  }

  const canPreview = isPreviewAllowed(query.preview, query.token, site.previewToken);

  if (site.status !== SiteStatus.PUBLISHED && !canPreview) {
    return (
      <section className="mx-auto flex w-full max-w-2xl flex-col gap-4 rounded-3xl border border-dashed border-zinc-300 bg-white p-8 text-center">
        <h1 className="text-2xl font-semibold">This site isn&apos;t published yet.</h1>
        <p className="text-sm text-muted-foreground">
          Ask the owner for a preview link or check back after publishing.
        </p>
      </section>
    );
  }

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
        className={`flex w-full flex-col gap-6 ${embedMode ? 'mx-0 max-w-none bg-zinc-100 p-6' : 'mx-auto max-w-3xl'}`}
      >
      {site.sections.map((section) => {
        if (section.type === 'HERO') {
          const content = parseHeroContent(section.contentJson);

          return (
            <Card key={section.id} className="rounded-2xl bg-gray-900 text-white">
              <CardContent className="p-8">
                <h1 className="text-4xl font-bold">{content.headline || site.title}</h1>
                {content.subheadline && <p className="mt-2 text-gray-200">{content.subheadline}</p>}
                <div className="mt-5 flex flex-wrap gap-3">
                  {content.ctas.map((cta) => (
                    <a
                      key={`${cta.label}-${cta.href}`}
                      href={cta.href}
                      className="rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-900"
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
            <Card key={section.id} className="rounded-2xl">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold">About</h2>
                <p className="mt-2 text-muted-foreground">{content.text}</p>
              </CardContent>
            </Card>
          );
        }

        if (section.type === 'CONTACT') {
          const content = parseContactContent(section.contentJson);

          return (
            <Card key={section.id} className="rounded-2xl">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold">Contact</h2>
                <div className="mt-3 space-y-1 text-muted-foreground">
                  {content.address && <p>Address: {content.address}</p>}
                  {content.phone && <p>Phone: {content.phone}</p>}
                  {content.website && (
                    <p>
                      Website:{' '}
                      <a href={content.website} className="text-primary underline underline-offset-4">
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
          <Card key={section.id} className="rounded-2xl">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold">{section.type}</h2>
              <p className="mt-2 text-muted-foreground">Coming soon.</p>
            </CardContent>
          </Card>
        );
      })}
      </section>
    </>
  );
}
