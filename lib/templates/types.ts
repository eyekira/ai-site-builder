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
