import { notFound } from 'next/navigation';

import EditorShell from './EditorShell';
import { prisma } from '@/lib/prisma';
import { canAccessSite, getViewerContext } from '@/lib/rbac';
import { type SectionType } from '@/lib/section-content';
import { extractLayoutKey, extractTemplateMetadata } from '@/lib/theme';
import { isMissingTableError } from '@/lib/prisma-errors';

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
    },
  });

  if (!site) {
    notFound();
  }

  if (!canAccessSite(site, viewer)) {
    notFound();
  }

  let photos: Array<{
    id: number;
    source: 'google' | 'upload' | 'ai';
    url: string;
    category: 'exterior' | 'interior' | 'food' | 'menu' | 'drink' | 'people' | 'other';
    confidence: number;
    tagsJson: string | null;
    sortOrder: number;
    isHero: boolean;
    isDeleted: boolean;
  }> = [];

  try {
    photos = await prisma.photo.findMany({
      where: { siteId: site.id },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        source: true,
        url: true,
        category: true,
        confidence: true,
        tagsJson: true,
        sortOrder: true,
        isHero: true,
        isDeleted: true,
      },
    });
  } catch (error) {
    if (!isMissingTableError(error, 'Photo')) {
      throw error;
    }
  }

  const user = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: { subscribed: true },
      })
    : null;

  const templateMeta = extractTemplateMetadata(site.themeJson);

  return (
    <EditorShell
      siteId={site.id}
      slug={site.slug}
      siteStatus={site.status}
      templateKey={templateMeta.templateKey}
      templateConfidence={templateMeta.templateConfidence}
      layoutKey={extractLayoutKey(site.themeJson)}
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
      photos={photos.map((photo) => ({
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
