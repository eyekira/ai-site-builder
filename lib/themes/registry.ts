import { extractTemplateMetadata, parseThemeJson } from '@/lib/theme';
import type { ThemeLayoutConfig, ThemeLayoutKey } from '@/lib/themes/schema';

export const themeLayoutRegistry: Record<ThemeLayoutKey, ThemeLayoutConfig> = {
  luxury: {
    key: 'luxury',
    identity: { concept: 'Full-bleed visual storytelling with low section count and reservation-first conversion.', density: 'airy', spacingScale: 'editorial' },
    navigation: { style: 'minimal_top', logoPlacement: 'center', showSectionLinks: true },
    hero: { pattern: 'overlay', ctaStrategy: 'floating' },
    sectionOrder: ['hero', 'about', 'menu', 'photos', 'reviews', 'contact'],
    sections: { about: { layout: 'two_column' }, photos: { layout: 'filmstrip' } },
    cta: { placement: 'floating', primaryLabelHint: 'Reserve' },
  },
  modern_casual: {
    key: 'modern_casual',
    identity: { concept: 'Sticky navigation, dense utility, and order-focused conversion.', density: 'dense', spacingScale: 'compact' },
    navigation: { style: 'sticky_cta_top', logoPlacement: 'left', showSectionLinks: true },
    hero: { pattern: 'compact_cta', ctaStrategy: 'sticky_footer' },
    sectionOrder: ['hero', 'menu', 'photos', 'reviews', 'contact'],
    sections: { about: { layout: 'card_based' }, photos: { layout: 'masonry' } },
    cta: { placement: 'sticky_footer', primaryLabelHint: 'Order Now' },
  },
  cozy_local: {
    key: 'cozy_local',
    identity: { concept: 'Warm local rhythm with story and specials emphasis.', density: 'balanced', spacingScale: 'modular' },
    navigation: { style: 'top_bar', logoPlacement: 'left', showSectionLinks: true },
    hero: { pattern: 'image_heavy', ctaStrategy: 'inline_per_section' },
    sectionOrder: ['hero', 'about', 'menu', 'photos', 'reviews', 'contact'],
    sections: { about: { layout: 'two_column' }, photos: { layout: 'masonry' } },
    cta: { placement: 'inline_per_section', primaryLabelHint: 'Visit Today' },
  },
  minimal_contemporary: {
    key: 'minimal_contemporary',
    identity: { concept: 'Clean grid, split hero, and strong typographic hierarchy.', density: 'balanced', spacingScale: 'modular' },
    navigation: { style: 'top_bar', logoPlacement: 'left', showSectionLinks: true },
    hero: { pattern: 'split', ctaStrategy: 'top_only' },
    sectionOrder: ['hero', 'about', 'menu', 'photos', 'contact'],
    sections: { about: { layout: 'stacked' }, photos: { layout: 'carousel' } },
    cta: { placement: 'top_only', primaryLabelHint: 'Book / Order' },
  },
  menu_first: {
    key: 'menu_first',
    identity: { concept: 'Conversion-speed structure with menu immediately visible after hero.', density: 'dense', spacingScale: 'compact' },
    navigation: { style: 'sticky_cta_top', logoPlacement: 'left', showSectionLinks: true },
    hero: { pattern: 'centered', ctaStrategy: 'sticky_footer' },
    sectionOrder: ['hero', 'menu', 'reviews', 'photos', 'contact'],
    sections: { about: { layout: 'stacked' }, photos: { layout: 'edge_grid' } },
    cta: { placement: 'sticky_footer', primaryLabelHint: 'Order Fast' },
  },
};

function legacyLayoutAlias(value: string): ThemeLayoutKey | null {
  const map: Record<string, ThemeLayoutKey> = {
    premium_omakase: 'luxury',
    modern_fast_casual: 'modern_casual',
    cozy_bakery: 'cozy_local',
    minimal_cafe: 'minimal_contemporary',
    bistro_editorial: 'minimal_contemporary',
  };
  return map[value] ?? null;
}

function mapTemplateToLayout(templateKey: string | null): ThemeLayoutKey {
  switch (templateKey) {
    case 'fine_dining_premium':
    case 'omakase_counter':
    case 'steakhouse_classic':
      return 'luxury';
    case 'fast_casual':
    case 'takeout_delivery_first':
      return 'menu_first';
    case 'bakery_patisserie':
      return 'cozy_local';
    default:
      return 'minimal_contemporary';
  }
}

function mapThemeNameToLayout(themeName: string): ThemeLayoutKey {
  switch (themeName) {
    case 'premium_noir':
      return 'luxury';
    case 'express_fresh':
      return 'modern_casual';
    case 'bakery_light':
      return 'cozy_local';
    default:
      return 'minimal_contemporary';
  }
}

export function resolveThemeLayoutKey(themeJson: string | null | undefined): ThemeLayoutKey {
  if (!themeJson) return 'minimal_contemporary';

  try {
    const parsed = JSON.parse(themeJson) as { layoutKey?: string };
    if (parsed.layoutKey && themeLayoutRegistry[parsed.layoutKey as ThemeLayoutKey]) {
      return parsed.layoutKey as ThemeLayoutKey;
    }
    const legacy = parsed.layoutKey ? legacyLayoutAlias(parsed.layoutKey) : null;
    if (legacy) return legacy;
  } catch {
    // noop
  }

  const { templateKey } = extractTemplateMetadata(themeJson);
  if (templateKey) return mapTemplateToLayout(templateKey);

  const theme = parseThemeJson(themeJson);
  return mapThemeNameToLayout(theme.name);
}
