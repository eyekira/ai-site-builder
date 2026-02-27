import type { ThemeName } from '@/lib/theme';
import type { TemplateKey } from '@/lib/templates/types';

export const TEMPLATE_THEME_MAP: Record<TemplateKey, ThemeName> = {
  fine_dining_premium: 'classic',
  cozy_cafe: 'sunset',
  fast_casual: 'ocean',
  family_korean_asian: 'classic',
  brunch_bakery: 'sunset',
  default_bistro: 'classic',
};
