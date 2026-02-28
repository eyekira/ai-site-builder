import { extractTemplateMetadata, parseThemeJson } from '@/lib/theme';
import type { ThemeLayoutConfig, ThemeLayoutKey } from '@/lib/themes/schema';

export const themeLayoutRegistry: Record<ThemeLayoutKey, ThemeLayoutConfig> = {
  bistro_editorial: {
    key: 'bistro_editorial',
    identity: { concept: 'Story-first, editorial pacing with signature dishes and narrative sections.', density: 'airy', spacingScale: 'editorial' },
    navigation: { style: 'minimal_top', logoPlacement: 'center', showSectionLinks: true },
    hero: { pattern: 'split', ctaStrategy: 'inline_per_section' },
    sectionOrder: ['hero', 'about', 'menu', 'photos', 'reviews', 'contact'],
    sections: { about: { layout: 'two_column' }, photos: { layout: 'edge_grid' } },
    cta: { placement: 'inline_per_section', primaryLabelHint: 'Reserve Table' },
  },
  minimal_cafe: {
    key: 'minimal_cafe',
    identity: { concept: 'Calm minimalist layout for quick browse and easy visit intent.', density: 'balanced', spacingScale: 'modular' },
    navigation: { style: 'top_bar', logoPlacement: 'left', showSectionLinks: true },
    hero: { pattern: 'centered', ctaStrategy: 'top_only' },
    sectionOrder: ['hero', 'menu', 'about', 'photos', 'contact'],
    sections: { about: { layout: 'stacked' }, photos: { layout: 'carousel' } },
    cta: { placement: 'top_only', primaryLabelHint: 'Order Ahead' },
  },
  premium_omakase: {
    key: 'premium_omakase',
    identity: { concept: 'Scarcity and ritual. High-intent conversion with policy clarity.', density: 'airy', spacingScale: 'editorial' },
    navigation: { style: 'minimal_top', logoPlacement: 'center', showSectionLinks: false },
    hero: { pattern: 'overlay', ctaStrategy: 'floating' },
    sectionOrder: ['hero', 'about', 'menu', 'reviews', 'photos', 'policies', 'contact'],
    sections: { about: { layout: 'card_based' }, photos: { layout: 'filmstrip' } },
    cta: { placement: 'floating', primaryLabelHint: 'Reserve Seats' },
  },
  modern_fast_casual: {
    key: 'modern_fast_casual',
    identity: { concept: 'Speed and clarity. Conversion-first with dense utility blocks.', density: 'dense', spacingScale: 'compact' },
    navigation: { style: 'sticky_cta_top', logoPlacement: 'left', showSectionLinks: true },
    hero: { pattern: 'compact_cta', ctaStrategy: 'sticky_footer' },
    sectionOrder: ['hero', 'menu', 'photos', 'reviews', 'contact'],
    sections: { about: { layout: 'card_based' }, photos: { layout: 'masonry' } },
    cta: { placement: 'sticky_footer', primaryLabelHint: 'Start Order' },
  },
  cozy_bakery: {
    key: 'cozy_bakery',
    identity: { concept: 'Warm artisanal storefront focused on preorder confidence.', density: 'balanced', spacingScale: 'modular' },
    navigation: { style: 'top_bar', logoPlacement: 'left', showSectionLinks: true },
    hero: { pattern: 'image_heavy', ctaStrategy: 'inline_per_section' },
    sectionOrder: ['hero', 'photos', 'menu', 'about', 'reviews', 'contact'],
    sections: { about: { layout: 'two_column' }, photos: { layout: 'masonry' } },
    cta: { placement: 'inline_per_section', primaryLabelHint: 'Preorder Pickup' },
  },
};

function mapTemplateToLayout(templateKey: string | null): ThemeLayoutKey {
  switch (templateKey) {
    case 'fine_dining_premium':
    case 'omakase_counter':
    case 'steakhouse_classic':
      return 'premium_omakase';
    case 'fast_casual':
    case 'takeout_delivery_first':
      return 'modern_fast_casual';
    case 'bakery_patisserie':
    case 'brunch_social':
      return 'cozy_bakery';
    case 'cafe_cozy':
      return 'minimal_cafe';
    default:
      return 'bistro_editorial';
  }
}

function mapThemeNameToLayout(themeName: string): ThemeLayoutKey {
  switch (themeName) {
    case 'premium_noir':
      return 'premium_omakase';
    case 'express_fresh':
      return 'modern_fast_casual';
    case 'bakery_light':
      return 'cozy_bakery';
    case 'cafe_warm':
      return 'minimal_cafe';
    default:
      return 'bistro_editorial';
  }
}

export function resolveThemeLayoutKey(themeJson: string | null | undefined): ThemeLayoutKey {
  if (!themeJson) return 'bistro_editorial';

  try {
    const parsed = JSON.parse(themeJson) as { layoutKey?: ThemeLayoutKey };
    if (parsed.layoutKey && themeLayoutRegistry[parsed.layoutKey]) {
      return parsed.layoutKey;
    }
  } catch {
    // noop
  }

  const { templateKey } = extractTemplateMetadata(themeJson);
  if (templateKey) return mapTemplateToLayout(templateKey);

  const theme = parseThemeJson(themeJson);
  return mapThemeNameToLayout(theme.name);
}
