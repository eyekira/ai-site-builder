'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { canAccessSite, getViewerContext } from '@/lib/rbac';
import { defaultContentForType, parseSectionContent, type SectionType } from '@/lib/section-content';
import { getThemeByName, isThemeName, type ThemeName } from '@/lib/theme';
import { isTemplateKey } from '@/lib/templates/types';
import { TEMPLATE_THEME_MAP } from '@/lib/templates/catalog';
import { resolveThemeLayoutKey } from '@/lib/themes/registry';
import { isThemeLayoutKey, type ThemeLayoutKey } from '@/lib/themes/schema';
import { parseBrandPack } from '@/lib/brandpack/parse';
import { ensureBrandPackContrast } from '@/lib/brandpack/safety';
import type { FontKey } from '@/lib/brandpack/types';

const FONT_KEYS: FontKey[] = ['inter', 'playfair_display', 'manrope', 'nunito', 'dm_sans', 'lora'];

function isHexColor(value: string): boolean {
  return /^#([0-9a-fA-F]{6})$/.test(value);
}

function mapLayoutToThemeName(layoutKey: ThemeLayoutKey): ThemeName {
  switch (layoutKey) {
    case 'premium_omakase':
      return 'premium_noir';
    case 'modern_fast_casual':
      return 'express_fresh';
    case 'cozy_bakery':
      return 'bakery_light';
    case 'minimal_cafe':
      return 'cafe_warm';
    default:
      return 'bistro_core';
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

async function getSiteSection(siteId: number, sectionId: number, ownerId: number) {
  const section = await prisma.section.findFirst({
    where: { id: sectionId, siteId, site: { ownerId } },
    include: {
      site: {
        select: { slug: true, ownerId: true, anonSessionId: true },
      },
    },
  });

  if (!section) {
    throw new Error('Section not found for site.');
  }

  return section;
}

export async function updateSection(siteId: number, sectionId: number, contentJsonString: string) {
  const viewer = await getViewerContext();
  if (!viewer.userId) {
    throw new Error('Authentication required to edit this site.');
  }
  const section = await getSiteSection(siteId, sectionId, viewer.userId);

  if (!canAccessSite(section.site, viewer)) {
    throw new Error('Not authorized to edit this site.');
  }

  const normalizedContent = parseSectionContent(section.type as SectionType, contentJsonString);

  await prisma.section.update({
    where: { id: sectionId },
    data: {
      contentJson: JSON.stringify(normalizedContent),
    },
  });

  revalidatePath(`/${section.site.slug}`);
  revalidatePath(`/editor/${section.site.slug}`);
  revalidatePath(`/editor/${section.site.slug}/preview`);
  revalidatePath(`/s/${section.site.slug}`);
}

export async function reorderSections(siteId: number, orderedSectionIds: number[]) {
  const viewer = await getViewerContext();
  if (!viewer.userId) {
    throw new Error('Authentication required to edit this site.');
  }
  const sections = await prisma.section.findMany({
    where: { siteId, site: { ownerId: viewer.userId } },
    include: { site: { select: { slug: true, ownerId: true, anonSessionId: true } } },
    orderBy: [{ order: 'asc' }, { id: 'asc' }],
  });
  const site = sections[0]?.site;
  if (!site || !canAccessSite(site, viewer)) {
    throw new Error('Not authorized to edit this site.');
  }

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
    revalidatePath(`/${slug}`);
    revalidatePath(`/editor/${slug}`);
    revalidatePath(`/editor/${slug}/preview`);
    revalidatePath(`/s/${slug}`);
  }
}

export async function addSection(siteId: number, type: SectionType) {
  if (!['HERO', 'ABOUT', 'CONTACT', 'PHOTOS', 'MENU', 'GALLERY', 'REVIEWS'].includes(type)) {
    throw new Error('Unsupported section type for editor.');
  }

  const viewer = await getViewerContext();
  if (!viewer.userId) {
    throw new Error('Authentication required to edit this site.');
  }
  const site = await prisma.site.findFirst({
    where: { id: siteId, ownerId: viewer.userId },
    select: { id: true, slug: true, ownerId: true, anonSessionId: true, _count: { select: { sections: true } } },
  });

  if (!site) {
    throw new Error('Site not found.');
  }

  if (!canAccessSite(site, viewer)) {
    throw new Error('Not authorized to edit this site.');
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

  revalidatePath(`/${site.slug}`);
  revalidatePath(`/editor/${site.slug}`);
  revalidatePath(`/editor/${site.slug}/preview`);
  revalidatePath(`/s/${site.slug}`);
}

export async function updateTheme(siteId: number, themeName: ThemeName) {
  const viewer = await getViewerContext();
  if (!viewer.userId) {
    throw new Error('Authentication required to edit this site.');
  }
  const site = await prisma.site.findFirst({
    where: { id: siteId, ownerId: viewer.userId },
    select: { id: true, slug: true, ownerId: true, anonSessionId: true, themeJson: true },
  });

  if (!site) {
    throw new Error('Site not found.');
  }

  if (!canAccessSite(site, viewer)) {
    throw new Error('Not authorized to edit this site.');
  }

  if (!isThemeName(themeName)) {
    throw new Error('Unsupported theme selection.');
  }

  const theme = getThemeByName(themeName);
  let existingThemeJson: Record<string, unknown> = {};
  if (site.themeJson) {
    try {
      existingThemeJson = JSON.parse(site.themeJson) as Record<string, unknown>;
    } catch {
      existingThemeJson = {};
    }
  }

  await prisma.site.update({
    where: { id: siteId },
    data: {
      themeJson: JSON.stringify({
        ...existingThemeJson,
        name: theme.name,
      }),
    },
  });

  revalidatePath(`/${site.slug}`);
  revalidatePath(`/editor/${site.slug}`);
  revalidatePath(`/editor/${site.slug}/preview`);
  revalidatePath(`/s/${site.slug}`);
}

export async function updateTemplate(siteId: number, templateKey: string) {
  const viewer = await getViewerContext();
  if (!viewer.userId) {
    throw new Error('Authentication required to edit this site.');
  }

  const site = await prisma.site.findFirst({
    where: { id: siteId, ownerId: viewer.userId },
    select: { id: true, slug: true, ownerId: true, anonSessionId: true, themeJson: true },
  });

  if (!site) {
    throw new Error('Site not found.');
  }

  if (!canAccessSite(site, viewer)) {
    throw new Error('Not authorized to edit this site.');
  }

  if (!isTemplateKey(templateKey)) {
    throw new Error('Unsupported template selection.');
  }

  let existingThemeJson: Record<string, unknown> = {};
  if (site.themeJson) {
    try {
      existingThemeJson = JSON.parse(site.themeJson) as Record<string, unknown>;
    } catch {
      existingThemeJson = {};
    }
  }

  const mappedTheme = TEMPLATE_THEME_MAP[templateKey];
  const candidateThemeJson = JSON.stringify({
    ...existingThemeJson,
    name: mappedTheme,
    templateKey,
    templateConfidence: 1,
  });
  const layoutKey = resolveThemeLayoutKey(candidateThemeJson);

  await prisma.site.update({
    where: { id: siteId },
    data: {
      themeJson: JSON.stringify({
        ...existingThemeJson,
        name: mappedTheme,
        templateKey,
        templateConfidence: 1,
        layoutKey,
      }),
    },
  });

  revalidatePath(`/${site.slug}`);
  revalidatePath(`/editor/${site.slug}`);
  revalidatePath(`/editor/${site.slug}/preview`);
  revalidatePath(`/s/${site.slug}`);
}
export async function updateLayout(siteId: number, layoutKey: string) {
  const viewer = await getViewerContext();
  if (!viewer.userId) {
    throw new Error('Authentication required to edit this site.');
  }

  const site = await prisma.site.findFirst({
    where: { id: siteId, ownerId: viewer.userId },
    select: { id: true, slug: true, ownerId: true, anonSessionId: true, themeJson: true },
  });

  if (!site) {
    throw new Error('Site not found.');
  }

  if (!canAccessSite(site, viewer)) {
    throw new Error('Not authorized to edit this site.');
  }

  if (!isThemeLayoutKey(layoutKey)) {
    throw new Error('Unsupported layout selection.');
  }

  let existingThemeJson: Record<string, unknown> = {};
  if (site.themeJson) {
    try {
      existingThemeJson = JSON.parse(site.themeJson) as Record<string, unknown>;
    } catch {
      existingThemeJson = {};
    }
  }

  const mappedTheme = mapLayoutToThemeName(layoutKey);

  await prisma.site.update({
    where: { id: siteId },
    data: {
      themeJson: JSON.stringify({
        ...existingThemeJson,
        name: mappedTheme,
        layoutKey,
      }),
    },
  });

  revalidatePath(`/${site.slug}`);
  revalidatePath(`/editor/${site.slug}`);
  revalidatePath(`/editor/${site.slug}/preview`);
  revalidatePath(`/s/${site.slug}`);
}

export async function updateBrandCustomization(
  siteId: number,
  payload: { primary: string; accent: string; headingFontKey: string; bodyFontKey: string },
) {
  const viewer = await getViewerContext();
  if (!viewer.userId) {
    throw new Error('Authentication required to edit this site.');
  }

  const site = await prisma.site.findFirst({
    where: { id: siteId, ownerId: viewer.userId },
    select: { id: true, slug: true, ownerId: true, anonSessionId: true, brandPackJson: true },
  });

  if (!site) {
    throw new Error('Site not found.');
  }

  if (!canAccessSite(site, viewer)) {
    throw new Error('Not authorized to edit this site.');
  }

  if (!isHexColor(payload.primary) || !isHexColor(payload.accent)) {
    throw new Error('Colors must be valid hex values.');
  }

  if (!FONT_KEYS.includes(payload.headingFontKey as FontKey) || !FONT_KEYS.includes(payload.bodyFontKey as FontKey)) {
    throw new Error('Unsupported font selection.');
  }

  const current = parseBrandPack(site.brandPackJson);
  const updated = ensureBrandPackContrast({
    ...current,
    palette: {
      ...current.palette,
      primary: payload.primary,
      accent: payload.accent,
    },
    typography: {
      headingFontKey: payload.headingFontKey as FontKey,
      bodyFontKey: payload.bodyFontKey as FontKey,
    },
    source: {
      ...current.source,
      signals: [...current.source.signals, 'editor_override'].slice(0, 10),
    },
  });

  await prisma.site.update({
    where: { id: siteId },
    data: { brandPackJson: JSON.stringify(updated) },
  });

  revalidatePath(`/${site.slug}`);
  revalidatePath(`/editor/${site.slug}`);
  revalidatePath(`/editor/${site.slug}/preview`);
  revalidatePath(`/s/${site.slug}`);
}
