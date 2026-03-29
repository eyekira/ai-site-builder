export type TemplateKey =
  | 'fine_dining_premium'
  | 'omakase_counter'
  | 'steakhouse_classic'
  | 'family_korean'
  | 'bbq_group'
  | 'cafe_cozy'
  | 'bakery_patisserie'
  | 'brunch_social'
  | 'fast_casual'
  | 'takeout_delivery_first'
  | 'default_bistro';

export type TemplateSelectionSignals = {
  keywordMatch: string[];
  photoMix: Partial<Record<'exterior' | 'interior' | 'food' | 'menu' | 'drink' | 'people' | 'other', number>>;
};

export type TemplateSelectionResult = {
  templateKey: TemplateKey;
  confidence: number;
  signals: TemplateSelectionSignals;
};

export const TEMPLATE_KEYS: TemplateKey[] = [
  'fine_dining_premium',
  'omakase_counter',
  'steakhouse_classic',
  'family_korean',
  'bbq_group',
  'cafe_cozy',
  'bakery_patisserie',
  'brunch_social',
  'fast_casual',
  'takeout_delivery_first',
  'default_bistro',
];

export function isTemplateKey(value: string): value is TemplateKey {
  return TEMPLATE_KEYS.includes(value as TemplateKey);
}

export const TEMPLATE_LABELS: Record<TemplateKey, string> = {
  fine_dining_premium: 'Luxury Fine Dining',
  omakase_counter: 'Omakase Counter',
  steakhouse_classic: 'Classic Steakhouse',
  family_korean: 'Family Korean',
  bbq_group: 'BBQ Group Dining',
  cafe_cozy: 'Cozy Cafe',
  bakery_patisserie: 'Bakery / Patisserie',
  brunch_social: 'Brunch Social',
  fast_casual: 'Fast Casual',
  takeout_delivery_first: 'Takeout / Delivery First',
  default_bistro: 'Bistro (Default)',
};
