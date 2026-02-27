import type { ThemeName } from '@/lib/theme';
import type { TemplateKey } from '@/lib/templates/types';

export const TEMPLATE_THEME_MAP: Record<TemplateKey, ThemeName> = {
  fine_dining_premium: 'bistro_core',
  cozy_cafe: 'cafe_warm',
  fast_casual: 'express_fresh',
  family_korean_asian: 'bistro_core',
  brunch_bakery: 'cafe_warm',
  default_bistro: 'bistro_core',
};
