import { notFound } from 'next/navigation';

import EditorShell from './EditorShell';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { type SectionType } from '@/lib/section-content';

export default async function EditorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  const userId = session?.user?.id ? Number(session.user.id) : null;

  const site = await prisma.site.findUnique({
    where: { slug },
    include: {
      sections: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!site) {
    notFound();
  }

  const user = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: { subscribed: true },
      })
    : null;

  return (
    <EditorShell
      siteId={site.id}
      slug={site.slug}
      siteStatus={site.status}
      isLoggedIn={Boolean(userId)}
      isSubscribed={Boolean(user?.subscribed)}
      sections={site.sections.map((section) => ({
        id: section.id,
        type: section.type as SectionType,
        order: section.order,
        contentJson: section.contentJson,
      }))}
    />
  );
}
