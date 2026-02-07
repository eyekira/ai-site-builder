import { notFound } from 'next/navigation';

import EditorShell from './EditorShell';
import { prisma } from '@/lib/prisma';
import { canAccessSite, getViewerContext } from '@/lib/rbac';
import { type SectionType } from '@/lib/section-content';
import { parseThemeJson } from '@/lib/theme';

export default async function EditorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const viewer = await getViewerContext();
  const userId = viewer.userId;

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

  if (!canAccessSite(site, viewer)) {
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
      themeName={parseThemeJson(site.themeJson).name}
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
