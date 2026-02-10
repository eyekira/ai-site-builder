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

  if (!userId) {
    notFound();
  }

  const site = await prisma.site.findFirst({
    where: { slug, ownerId: userId },
    include: {
      sections: {
        orderBy: { order: 'asc' },
      },
      assets: {
        orderBy: { id: 'asc' },
      },
      photos: {
        orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }, { id: 'asc' }],
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
      customDomain={site.customDomain}
      sections={site.sections.map((section) => ({
        id: section.id,
        type: section.type as SectionType,
        order: section.order,
        contentJson: section.contentJson,
      }))}
      assets={site.assets.map((asset) => ({
        id: asset.id,
        kind: asset.kind,
        source: asset.source,
        ref: asset.ref,
        width: asset.width,
        height: asset.height,
      }))}
      photos={site.photos.map((photo) => ({
        id: photo.id,
        source: photo.source,
        url: photo.url,
        category: photo.category,
        confidence: photo.confidence,
        tagsJson: photo.tagsJson,
        sortOrder: photo.sortOrder,
        isHero: photo.isHero,
        isDeleted: photo.isDeleted,
      }))}
    />
  );
}
