import { SectionType, SiteStatus } from '@prisma/client';
import { notFound, redirect } from 'next/navigation';

import { prisma } from '@/lib/prisma';

import { EditorForm } from './editor-form';

type AboutContent = {
  body?: string;
};

function parseAboutContent(contentJson: string): AboutContent {
  try {
    return JSON.parse(contentJson) as AboutContent;
  } catch {
    return {};
  }
}

export default async function EditorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const site = await prisma.site.findUnique({
    where: { slug },
    include: {
      sections: {
        where: { type: SectionType.ABOUT },
        take: 1,
      },
    },
  });

  if (!site) {
    notFound();
  }

  if (site.status !== SiteStatus.DRAFT) {
    redirect(`/s/${slug}`);
  }

  const aboutSection = site.sections[0];
  const aboutContent = aboutSection ? parseAboutContent(aboutSection.contentJson) : {};

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl space-y-6 bg-gray-50 px-6 py-12">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-gray-900">Editor v0</h1>
        <p className="text-sm text-gray-500">Edit draft title and About section for {slug}.</p>
      </header>

      <EditorForm
        slug={slug}
        initialTitle={site.title}
        initialAboutText={String(aboutContent.body ?? '')}
      />
    </main>
  );
}
