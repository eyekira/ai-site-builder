import type { ThemeName } from '@/lib/theme';
import type { TemplateKey } from '@/lib/templates/types';

export const TEMPLATE_THEME_MAP: Record<TemplateKey, ThemeName> = {
  fine_dining_premium: 'premium_noir',
  omakase_counter: 'premium_noir',
  steakhouse_classic: 'premium_noir',
  family_korean: 'family_homestyle',
  bbq_group: 'family_homestyle',
  cafe_cozy: 'cafe_warm',
  bakery_patisserie: 'bakery_light',
  brunch_social: 'bakery_light',
  fast_casual: 'express_fresh',
  takeout_delivery_first: 'express_fresh',
  default_bistro: 'bistro_core',
};
