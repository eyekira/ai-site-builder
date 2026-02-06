import { notFound } from 'next/navigation';

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
    <main className="mx-auto min-h-screen w-full max-w-3xl space-y-6 px-6 py-12">
      {site.sections.map((section) => {
        const content = parseContent(section.contentJson);

        if (section.type === 'HERO') {
          return (
            <section key={section.id} className="rounded-2xl bg-gray-900 p-8 text-white">
              <h1 className="text-4xl font-bold">{String(content.headline ?? site.title)}</h1>
              {content.subheadline && (
                <p className="mt-2 text-gray-200">{String(content.subheadline)}</p>
              )}
            </section>
          );
        }

        if (section.type === 'ABOUT') {
          return (
            <section key={section.id} className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-2xl font-semibold text-gray-900">About</h2>
              <p className="mt-2 text-gray-700">{String(content.body ?? '')}</p>
            </section>
          );
        }

        if (section.type === 'CONTACT') {
          return (
            <section key={section.id} className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-2xl font-semibold text-gray-900">Contact</h2>
              <div className="mt-3 space-y-1 text-gray-700">
                {content.address && <p>Address: {String(content.address)}</p>}
                {content.phone && <p>Phone: {String(content.phone)}</p>}
                {content.website && (
                  <p>
                    Website:{' '}
                    <a href={String(content.website)} className="text-blue-600 underline">
                      {String(content.website)}
                    </a>
                  </p>
                )}
              </div>
            </section>
          );
        }

        return null;
      })}
    </main>
  );
}
