'use server';

import { revalidatePath } from 'next/cache';

import { getMvpUserIdFromRequest } from '@/lib/mvp-auth';
import { prisma } from '@/lib/prisma';
import { defaultContentForType, parseSectionContent, type SectionType } from '@/lib/section-content';

async function requireOwnedSite(siteId: number) {
  const mvpUserId = await getMvpUserIdFromRequest();

  if (!mvpUserId) {
    throw new Error('Missing MVP user header.');
  }

  const site = await prisma.site.findFirst({
    where: { id: siteId, ownerId: mvpUserId },
    select: { id: true },
  });

  if (!site) {
    throw new Error('Unauthorized site access.');
  }
}

async function normalizeSiteSectionOrders(siteId: number) {
  const sections = await prisma.section.findMany({
    where: { siteId },
    orderBy: [{ order: 'asc' }, { id: 'asc' }],
    select: { id: true, order: true },
  });

  await prisma.$transaction(
    sections.map((section, index) =>
      prisma.section.update({
        where: { id: section.id },
        data: { order: index + 1 },
      }),
    ),
  );
}

async function getSiteSection(siteId: number, sectionId: number) {
  const section = await prisma.section.findFirst({
    where: { id: sectionId, siteId },
    include: {
      site: {
        select: { slug: true },
      },
    },
  });

  if (!section) {
    throw new Error('Section not found for site.');
  }

  return section;
}

export async function updateSection(siteId: number, sectionId: number, contentJsonString: string) {
  await requireOwnedSite(siteId);
  const section = await getSiteSection(siteId, sectionId);

  const normalizedContent = parseSectionContent(section.type as SectionType, contentJsonString);

  await prisma.section.update({
    where: { id: sectionId },
    data: {
      contentJson: JSON.stringify(normalizedContent),
    },
  });

  revalidatePath(`/editor/${section.site.slug}`);
  revalidatePath(`/s/${section.site.slug}`);
}

export async function reorderSections(siteId: number, orderedSectionIds: number[]) {
  await requireOwnedSite(siteId);
  const sections = await prisma.section.findMany({
    where: { siteId },
    include: { site: { select: { slug: true } } },
    orderBy: [{ order: 'asc' }, { id: 'asc' }],
  });

  const sectionIds = sections.map((section) => section.id);
  const payloadIds = new Set(orderedSectionIds);
  const validIds = new Set(sectionIds);

  if (sections.length === 0 || orderedSectionIds.length !== sections.length) {
    throw new Error('Invalid section order payload.');
  }

  if (payloadIds.size !== sectionIds.length) {
    throw new Error('Payload contains duplicate section ids.');
  }

  const isSameSet = [...payloadIds].every((id) => validIds.has(id));

  if (!isSameSet) {
    throw new Error('Payload contains invalid section ids.');
  }

  await prisma.$transaction(
    orderedSectionIds.map((id, index) =>
      prisma.section.update({
        where: { id },
        data: { order: index + 1 },
      }),
    ),
  );

  await normalizeSiteSectionOrders(siteId);

  const slug = sections[0]?.site.slug;
  if (slug) {
    revalidatePath(`/editor/${slug}`);
    revalidatePath(`/s/${slug}`);
  }
}

export async function addSection(siteId: number, type: SectionType) {
  await requireOwnedSite(siteId);
  if (!['HERO', 'ABOUT', 'CONTACT'].includes(type)) {
    throw new Error('Unsupported section type for editor MVP.');
  }

  const site = await prisma.site.findUnique({
    where: { id: siteId },
    select: { id: true, slug: true, _count: { select: { sections: true } } },
  });

  if (!site) {
    throw new Error('Site not found.');
  }

  await prisma.section.create({
    data: {
      siteId,
      type,
      order: site._count.sections + 1,
      contentJson: defaultContentForType(type),
    },
  });

  await normalizeSiteSectionOrders(siteId);

  revalidatePath(`/editor/${site.slug}`);
  revalidatePath(`/s/${site.slug}`);
}
