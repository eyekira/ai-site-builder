import { notFound } from 'next/navigation';

import { Card, CardContent } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';

type SectionContent = Record<string, unknown>;

function parseContent(contentJson: string): SectionContent {
  try {
    return JSON.parse(contentJson) as SectionContent;
  } catch {
    return {};
  }
}

export default async function SitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

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

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      {site.sections.map((section) => {
        const content = parseContent(section.contentJson);

        if (section.type === 'HERO') {
          return (
            <Card key={section.id} className="rounded-2xl bg-gray-900 text-white">
              <CardContent className="p-8">
                <h1 className="text-4xl font-bold">{String(content.headline ?? site.title)}</h1>
                {content.subheadline && <p className="mt-2 text-gray-200">{String(content.subheadline)}</p>}
              </CardContent>
            </Card>
          );
        }

        if (section.type === 'ABOUT') {
          return (
            <Card key={section.id} className="rounded-2xl">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold">About</h2>
                <p className="mt-2 text-muted-foreground">{String(content.body ?? '')}</p>
              </CardContent>
            </Card>
          );
        }

        if (section.type === 'CONTACT') {
          return (
            <Card key={section.id} className="rounded-2xl">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold">Contact</h2>
                <div className="mt-3 space-y-1 text-muted-foreground">
                  {content.address && <p>Address: {String(content.address)}</p>}
                  {content.phone && <p>Phone: {String(content.phone)}</p>}
                  {content.website && (
                    <p>
                      Website:{' '}
                      <a href={String(content.website)} className="text-primary underline underline-offset-4">
                        {String(content.website)}
                      </a>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        }

        return null;
      })}
    </section>
  );
}
