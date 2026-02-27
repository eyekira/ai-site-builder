export type TemplateKey =
  | 'fine_dining_premium'
  | 'cozy_cafe'
  | 'fast_casual'
  | 'family_korean_asian'
  | 'brunch_bakery'
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
