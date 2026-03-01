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

export function inferCulturalStyleKey(textSignals: string[]): string {
  const text = textSignals.join(' ').toLowerCase();
  if (/(sushi|omakase|izakaya)/.test(text)) return 'japanese_minimal';
  if (/(korean|bbq|kimchi)/.test(text)) return 'korean_modern';
  if (/(chinese|dim sum|noodle)/.test(text)) return 'chinese_contemporary';
  if (/(greek|mediterranean|coastal|seafood)/.test(text)) return 'mediterranean_coastal';
  if (/(taco|mexican|taqueria|latin)/.test(text)) return 'latin_street';
  if (/(american|steakhouse|bbq|diner)/.test(text)) return 'american_classic';
  if (/(indian|curry|tandoor)/.test(text)) return 'indian_spice_house';
  if (/(lebanese|shawarma|middle eastern)/.test(text)) return 'middle_eastern_modern';
  if (/(french|brasserie|patisserie|bistro)/.test(text)) return 'french_atelier';
  if (/(italian|trattoria|osteria)/.test(text)) return 'italian_warm_modern';
  return 'american_classic';
}

export function inferLayoutAndCulturalStyle(input: { textSignals: string[] }): { layoutKey: string; culturalStyleKey: string } {
  const text = input.textSignals.join(' ').toLowerCase();
  if (/(sushi|omakase|fine dining|italian fine dining)/.test(text)) return { layoutKey: 'luxury', culturalStyleKey: inferCulturalStyleKey(input.textSignals) };
  if (/(taco|mexican|korean bbq|bbq)/.test(text)) return { layoutKey: 'modern_casual', culturalStyleKey: inferCulturalStyleKey(input.textSignals) };
  if (/(bakery|patisserie)/.test(text)) return { layoutKey: 'cozy_local', culturalStyleKey: inferCulturalStyleKey(input.textSignals) };
  return { layoutKey: 'minimal_contemporary', culturalStyleKey: inferCulturalStyleKey(input.textSignals) };
}