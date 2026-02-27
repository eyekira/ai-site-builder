import type { ThemeName } from '@/lib/theme';
import type { TemplateKey } from '@/lib/templates/types';

export const TEMPLATE_THEME_MAP: Record<TemplateKey, ThemeName> = {
  fine_dining_premium: 'premium_noir',
  cozy_cafe: 'cafe_warm',
  fast_casual: 'express_fresh',
  family_korean_asian: 'family_homestyle',
  brunch_bakery: 'bakery_light',
  default_bistro: 'bistro_core',
};
