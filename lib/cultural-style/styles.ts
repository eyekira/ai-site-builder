import type { CulturalStyle } from './types';

export const CULTURAL_STYLES: CulturalStyle[] = [
  {
    key: 'japanese_minimal', label: 'Japanese Minimal', defaultFontPairing: { headingKey: 'cormorant', bodyKey: 'inter' },
    headingCase: 'default', headingTracking: 'tight',
    divider: { style: 'hairline', thickness: 1, opacity: 0.35 },
    surface: { treatment: 'flat', radiusBias: 'soft', shadowBias: 'none' },
    button: { shape: 'rounded', variantBias: 'outline' },
    image: { frame: 'none', aspectBias: 'cinematic', hover: 'none' },
    pattern: { kind: 'none', opacity: 0.04, scale: 1.0 }, classNames: { root: 'cs-japanese-minimal' },
  },
  {
    key: 'korean_modern', label: 'Korean Modern', defaultFontPairing: { headingKey: 'space_grotesk', bodyKey: 'inter' },
    headingCase: 'default', headingTracking: 'default',
    divider: { style: 'hairline', thickness: 1, opacity: 0.4 },
    surface: { treatment: 'card', radiusBias: 'soft', shadowBias: 'soft' },
    button: { shape: 'pill', variantBias: 'solid' }, image: { frame: 'soft', aspectBias: 'mixed', hover: 'lift' },
    pattern: { kind: 'grid', opacity: 0.03, scale: 1.0 }, classNames: { root: 'cs-korean-modern' },
  },
  {
    key: 'chinese_contemporary', label: 'Chinese Contemporary', defaultFontPairing: { headingKey: 'merriweather', bodyKey: 'inter' },
    headingCase: 'default', headingTracking: 'default', divider: { style: 'stamp', opacity: 0.35 },
    surface: { treatment: 'paper', radiusBias: 'soft', shadowBias: 'soft' }, button: { shape: 'rounded', variantBias: 'solid' },
    image: { frame: 'soft', aspectBias: 'mixed', hover: 'zoom' }, pattern: { kind: 'tiles', opacity: 0.04, scale: 1.0 }, classNames: { root: 'cs-chinese-contemporary' },
  },
  {
    key: 'mediterranean_coastal', label: 'Mediterranean Coastal', defaultFontPairing: { headingKey: 'playfair_display', bodyKey: 'source_sans_3' },
    headingCase: 'default', headingTracking: 'wide', divider: { style: 'pattern', opacity: 0.3 },
    surface: { treatment: 'flat', radiusBias: 'soft', shadowBias: 'none' }, button: { shape: 'pill', variantBias: 'outline' },
    image: { frame: 'none', aspectBias: 'cinematic', hover: 'none' }, pattern: { kind: 'wave', opacity: 0.05, scale: 1.2 }, classNames: { root: 'cs-mediterranean-coastal' },
  },
  {
    key: 'latin_street', label: 'Latin Street', defaultFontPairing: { headingKey: 'montserrat', bodyKey: 'inter' },
    headingCase: 'uppercase', headingTracking: 'wide', divider: { style: 'stamp', opacity: 0.4 },
    surface: { treatment: 'card', radiusBias: 'pill', shadowBias: 'soft' }, button: { shape: 'pill', variantBias: 'solid' },
    image: { frame: 'sharp', aspectBias: 'mixed', hover: 'lift' }, pattern: { kind: 'stamp', opacity: 0.07, scale: 1.0 }, classNames: { root: 'cs-latin-street' },
  },
  {
    key: 'american_classic', label: 'American Classic', defaultFontPairing: { headingKey: 'roboto_slab', bodyKey: 'source_sans_3' },
    headingCase: 'default', headingTracking: 'default', divider: { style: 'hairline', opacity: 0.35 },
    surface: { treatment: 'paper', radiusBias: 'soft', shadowBias: 'soft' }, button: { shape: 'rounded', variantBias: 'solid' },
    image: { frame: 'sharp', aspectBias: 'mixed', hover: 'none' }, pattern: { kind: 'linen', opacity: 0.05, scale: 1.0 }, classNames: { root: 'cs-american-classic' },
  },
  {
    key: 'indian_spice_house', label: 'Indian Spice House', defaultFontPairing: { headingKey: 'dm_serif_display', bodyKey: 'inter' },
    headingCase: 'default', headingTracking: 'default', divider: { style: 'pattern', opacity: 0.35 },
    surface: { treatment: 'paper', radiusBias: 'soft', shadowBias: 'soft' }, button: { shape: 'rounded', variantBias: 'solid' },
    image: { frame: 'soft', aspectBias: 'mixed', hover: 'zoom' }, pattern: { kind: 'tiles', opacity: 0.06, scale: 1.0 }, classNames: { root: 'cs-indian-spice-house' },
  },
  {
    key: 'middle_eastern_modern', label: 'Middle Eastern Modern', defaultFontPairing: { headingKey: 'cormorant', bodyKey: 'source_sans_3' },
    headingCase: 'default', headingTracking: 'wide', divider: { style: 'pattern', opacity: 0.3 },
    surface: { treatment: 'glass', radiusBias: 'soft', shadowBias: 'none' }, button: { shape: 'rounded', variantBias: 'outline' },
    image: { frame: 'none', aspectBias: 'cinematic', hover: 'none' }, pattern: { kind: 'tiles', opacity: 0.05, scale: 1.0 }, classNames: { root: 'cs-middle-eastern-modern' },
  },
  {
    key: 'french_atelier', label: 'French Atelier', defaultFontPairing: { headingKey: 'playfair_display', bodyKey: 'inter' },
    headingCase: 'default', headingTracking: 'tight', divider: { style: 'hairline', opacity: 0.35 },
    surface: { treatment: 'flat', radiusBias: 'sharp', shadowBias: 'none' }, button: { shape: 'rounded', variantBias: 'outline' },
    image: { frame: 'soft', aspectBias: 'cinematic', hover: 'none' }, pattern: { kind: 'linen', opacity: 0.04, scale: 1.0 }, classNames: { root: 'cs-french-atelier' },
  },
  {
    key: 'italian_warm_modern', label: 'Italian Warm Modern', defaultFontPairing: { headingKey: 'lora', bodyKey: 'inter' },
    headingCase: 'default', headingTracking: 'default', divider: { style: 'hairline', opacity: 0.35 },
    surface: { treatment: 'paper', radiusBias: 'soft', shadowBias: 'soft' }, button: { shape: 'rounded', variantBias: 'solid' },
    image: { frame: 'soft', aspectBias: 'mixed', hover: 'lift' }, pattern: { kind: 'linen', opacity: 0.05, scale: 1.0 }, classNames: { root: 'cs-italian-warm-modern' },
  },
];

export function getCulturalStyle(key?: string | null): CulturalStyle {
  return CULTURAL_STYLES.find((s) => s.key === key) ?? CULTURAL_STYLES.find((s) => s.key === 'american_classic')!;
}

type MatchResult = { culturalStyleKey: string; matchReason: string; matchedKeyword: string | null };

function matchStyleByKeywords(text: string): MatchResult {
  const rules: Array<{ key: string; style: string; reason: string }> = [
    { key: 'sushi|omakase|izakaya', style: 'japanese_minimal', reason: 'jp-keyword' },
    { key: 'korean|k-bbq|kbbq|bulgogi|kimchi|bibimbap|tteokbokki|gochujang|soju|seoul', style: 'korean_modern', reason: 'kr-keyword' },
    { key: 'chinese|dim sum|noodle', style: 'chinese_contemporary', reason: 'cn-keyword' },
    { key: 'greek|mediterranean|coastal|seafood', style: 'mediterranean_coastal', reason: 'med-keyword' },
    { key: 'taco|mexican|taqueria|latin', style: 'latin_street', reason: 'latin-keyword' },
    { key: 'american|steakhouse|diner', style: 'american_classic', reason: 'us-keyword' },
    { key: 'indian|curry|tandoor', style: 'indian_spice_house', reason: 'in-keyword' },
    { key: 'lebanese|shawarma|middle eastern', style: 'middle_eastern_modern', reason: 'me-keyword' },
    { key: 'french|brasserie|patisserie|bistro', style: 'french_atelier', reason: 'fr-keyword' },
    { key: 'italian|trattoria|osteria', style: 'italian_warm_modern', reason: 'it-keyword' },
  ];

  for (const rule of rules) {
    const rx = new RegExp(`(${rule.key})`, 'i');
    const hit = text.match(rx);
    if (hit) {
      return { culturalStyleKey: rule.style, matchReason: rule.reason, matchedKeyword: hit[1]?.toLowerCase() ?? null };
    }
  }

  return { culturalStyleKey: 'american_classic', matchReason: 'fallback-default', matchedKeyword: null };
}

export function inferCulturalStyle(input: { textSignals: string[] }): MatchResult {
  const text = input.textSignals.filter(Boolean).join(' ').toLowerCase();
  return matchStyleByKeywords(text);
}

export function inferCulturalStyleKey(textSignals: string[]): string {
  return inferCulturalStyle({ textSignals }).culturalStyleKey;
}

export function inferLayoutAndCulturalStyle(input: { textSignals: string[] }): { layoutKey: string; culturalStyleKey: string; matchReason: string; matchedKeyword: string | null } {
  const text = input.textSignals.filter(Boolean).join(' ').toLowerCase();
  const cultural = inferCulturalStyle({ textSignals: input.textSignals });
  if (/(sushi|omakase|fine dining|italian fine dining)/.test(text)) return { layoutKey: 'luxury', ...cultural };
  if (/(taco|mexican|korean bbq|k-bbq|kbbq|bbq)/.test(text)) return { layoutKey: 'modern_casual', ...cultural };
  if (/(bakery|patisserie)/.test(text)) return { layoutKey: 'cozy_local', ...cultural };
  return { layoutKey: 'minimal_contemporary', ...cultural };
}