export type ThemeLayoutKey =
  | 'luxury'
  | 'modern_casual'
  | 'cozy_local'
  | 'minimal_contemporary'
  | 'menu_first';

export const LAYOUT_KEYS: ThemeLayoutKey[] = ['luxury', 'modern_casual', 'cozy_local', 'minimal_contemporary', 'menu_first'];

export function isThemeLayoutKey(value: string): value is ThemeLayoutKey {
  return LAYOUT_KEYS.includes(value as ThemeLayoutKey);
}

export type ThemeLayoutConfig = {
  key: ThemeLayoutKey;
  identity: {
    concept: string;
    density: 'airy' | 'balanced' | 'dense';
    spacingScale: 'editorial' | 'compact' | 'modular';
  };
  navigation: {
    style: 'top_bar' | 'minimal_top' | 'sticky_cta_top';
    logoPlacement: 'left' | 'center';
    showSectionLinks: boolean;
  };
  hero: {
    pattern: 'split' | 'centered' | 'overlay' | 'image_heavy' | 'compact_cta';
    ctaStrategy: 'top_only' | 'floating' | 'inline_per_section' | 'sticky_footer';
  };
  sectionOrder: Array<'hero' | 'about' | 'menu' | 'photos' | 'reviews' | 'reservation' | 'contact' | 'policies'>;
  sections: {
    about: { layout: 'two_column' | 'stacked' | 'card_based' };
    photos: { layout: 'masonry' | 'carousel' | 'edge_grid' | 'filmstrip' };
  };
  cta: {
    placement: 'top_only' | 'floating' | 'inline_per_section' | 'sticky_footer';
    primaryLabelHint: string;
  };
};
