import { NextRequest, NextResponse } from 'next/server';

import { completeMenuReview, getPreviewSessionRecord } from '@/lib/preview-session';
import { prisma } from '@/lib/prisma';
import type { SiteForRender } from '@/lib/site';
import type { MenuContent } from '@/lib/section-content';
import { placeholderMenu, withMenuContent } from '@/lib/menu-section';

type MenuMode = 'auto' | 'upload' | 'skip';
type MergeMode = 'replace' | 'merge';
type MenuOcrEvidence = {
  mode: 'uploaded' | 'google_photos' | 'sample';
  usedPhotoRefs: string[];
  candidatePhotoRefs?: string[];
  lastRunAt?: string;
};

function normalizePrice(raw: string): string {
  const cleaned = (raw ?? '').trim();
  if (!cleaned) return '';
  const numeric = cleaned.replace(/[^\d.]/g, '');
  if (!numeric) return '';
  const value = Number.parseFloat(numeric);
  if (Number.isNaN(value)) return '';
  return `$${Number.isInteger(value) ? value.toString() : value.toFixed(2)}`;
}

function categoryForItem(name: string, description: string): 'Starters' | 'Mains' | 'Drinks' | 'Desserts' {
  const text = `${name} ${description}`.toLowerCase();
  if (/(coffee|tea|latte|juice|soda|beer|wine|cocktail|drink)/i.test(text)) return 'Drinks';
  if (/(cake|dessert|ice cream|cookie|brownie|pudding|pie)/i.test(text)) return 'Desserts';
  if (/(salad|soup|starter|appetizer|fries|wings|dumpling)/i.test(text)) return 'Starters';
  return 'Mains';
}

function normalizeMenu(input: MenuContent | null | undefined): MenuContent {
  const fallback = placeholderMenu();
  if (!input) return fallback;

  const items = (input.items ?? [])
    .map((item) => ({
      name: (item.name ?? '').trim(),
      description: (item.description ?? '').trim(),
      price: normalizePrice(item.price ?? ''),
      category: categoryForItem(item.name ?? '', item.description ?? ''),
    }))
    .filter((item) => item.name.length > 0)
    .slice(0, 80);

  if (items.length === 0) return fallback;

  return {
    title: (input.title ?? 'Menu').trim() || 'Menu',
    items,
  };
}

function autoMenu(site: SiteForRender): MenuContent {
  const title = site.businessTitle || site.title || 'Menu';
  return normalizeMenu({
    title: 'Menu',
    items: [
      { name: `${title} Signature`, description: 'Chef-recommended house favorite', price: '$18' },
      { name: 'Seasonal Special', description: 'Fresh seasonal ingredients', price: '$16' },
      { name: 'Guest Favorite', description: 'Most ordered by regulars', price: '$14' },
    ],
  });
}

function menuFromSite(site: SiteForRender): MenuContent | null {
  const section = site.sections.find((s) => s.type === 'MENU');
  if (!section) return null;
  try {
    return normalizeMenu(JSON.parse(section.contentJson) as MenuContent);
  } catch {
    return null;
  }
}

function mergeMenus(current: MenuContent | null, incoming: MenuContent, mode: MergeMode): MenuContent {
  if (mode === 'replace' || !current) return incoming;

  const seen = new Set<string>();
  const merged = [...current.items, ...incoming.items].filter((item) => {
    const key = `${item.name.toLowerCase()}|${item.price.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return { title: incoming.title || current.title || 'Menu', items: merged.slice(0, 80) };
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | {
        previewId?: string;
        mode?: MenuMode;
        mergeMode?: MergeMode;
        menu?: MenuContent;
        evidence?: MenuOcrEvidence;
      }
    | null;

  if (!body?.previewId || !body?.mode) {
    return NextResponse.json({ error: 'INVALID_PAYLOAD' }, { status: 400 });
  }

  const session = await getPreviewSessionRecord(body.previewId);
  if (!session) {
    return NextResponse.json({ error: 'PREVIEW_NOT_FOUND' }, { status: 404 });
  }

  let site: SiteForRender;
  try {
    site = JSON.parse(session.dataJson) as SiteForRender;
  } catch {
    return NextResponse.json({ error: 'INVALID_PREVIEW_DATA' }, { status: 400 });
  }

  const mergeMode: MergeMode = body.mergeMode === 'merge' ? 'merge' : 'replace';
  const currentMenu = menuFromSite(site);

  let nextMenu: MenuContent;
  if (body.mode === 'skip') {
    nextMenu = placeholderMenu();
  } else if (body.mode === 'upload') {
    if (!body.menu) {
      return NextResponse.json({ error: 'MENU_REQUIRED' }, { status: 400 });
    }
    nextMenu = mergeMenus(currentMenu, normalizeMenu(body.menu), mergeMode);
  } else {
    nextMenu = mergeMenus(currentMenu, autoMenu(site), mergeMode);
  }

  const evidence: MenuOcrEvidence = body.evidence ?? {
    mode: body.mode === 'upload' ? 'uploaded' : body.mode === 'auto' ? 'sample' : 'sample',
    usedPhotoRefs: [],
    lastRunAt: new Date().toISOString(),
  };

  const updated = {
    ...withMenuContent(site, nextMenu),
    __menuOcrEvidence: evidence,
  } as SiteForRender;

  await completeMenuReview(body.previewId, updated);

  if (updated.id > 0) {
    const existing = await prisma.section.findFirst({ where: { siteId: updated.id, type: 'MENU' }, select: { id: true } });
    if (existing) {
      await prisma.section.update({ where: { id: existing.id }, data: { contentJson: JSON.stringify(nextMenu) } });
    } else {
      const maxOrder = await prisma.section.aggregate({ where: { siteId: updated.id }, _max: { order: true } });
      await prisma.section.create({
        data: {
          siteId: updated.id,
          type: 'MENU',
          order: (maxOrder._max.order ?? 0) + 1,
          contentJson: JSON.stringify(nextMenu),
        },
      });
    }
  }

  return NextResponse.json({ ok: true, menu: nextMenu, menuReviewCompleted: true });
}
