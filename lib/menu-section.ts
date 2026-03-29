import type { SiteForRender } from '@/lib/site';
import type { MenuContent } from '@/lib/section-content';

export function withMenuContent(site: SiteForRender, menu: MenuContent): SiteForRender {
  const sections = [...site.sections];
  const idx = sections.findIndex((s) => s.type === 'MENU');
  const contentJson = JSON.stringify(menu);

  if (idx >= 0) {
    sections[idx] = { ...sections[idx], contentJson };
  } else {
    const nextId = sections.reduce((maxId, s) => Math.max(maxId, s.id), 0) + 1;
    sections.push({
      id: nextId,
      type: 'MENU',
      contentJson,
    });
  }

  return { ...site, sections };
}

export function placeholderMenu(): MenuContent {
  return {
    title: 'Menu coming soon',
    items: [
      {
        name: 'Menu not added yet',
        description: 'Use editor to add your menu items or import from menu photos.',
        price: '',
      },
    ],
  };
}
