import type { ThemeLayoutKey } from '@/lib/themes/schema';
import type { CulturalStyle } from './types';

export const CULTURAL_STYLES: CulturalStyle[] = [
  {
    key: 'japanese_minimal',
    label: 'Japanese Minimal',
    defaultFontPairing: { headingKey: 'playfair_display', bodyKey: 'inter' },
    headingTracking: 'tight',
    divider: { style: 'hairline', thickness: 1, opacity: 0.3 },
    surface: { treatment: 'flat', radiusBias: 'soft', shadowBias: 'none' },
    button: { shape: 'rounded', variantBias: 'outline' },
    image: { frame: 'none', aspectBias: 'cinematic', hover: 'none' },
    pattern: { kind: 'grid', opacity: 0.04, scale: 18 },
    classNames: { root: 'cultural-japanese-minimal', divider: 'cultural-divider-hairline' },
  },
  {
    key: 'korean_modern',
    label: 'Korean Modern',
    defaultFontPairing: { headingKey: 'space_grotesk', bodyKey: 'inter' },
    divider: { style: 'hairline', thickness: 1, opacity: 0.28 },
    surface: { treatment: 'card', radiusBias: 'soft', shadowBias: 'soft' },
    button: { shape: 'rounded', variantBias: 'solid' },
    image: { frame: 'soft', aspectBias: 'mixed', hover: 'lift' },
    pattern: { kind: 'grid', opacity: 0.05, scale: 22 },
    classNames: { root: 'cultural-korean-modern', divider: 'cultural-divider-hairline' },
  },
  {
    key: 'chinese_contemporary',
    label: 'Chinese Contemporary',
    defaultFontPairing: { headingKey: 'merriweather', bodyKey: 'inter' },
    divider: { style: 'stamp', thickness: 1, opacity: 0.34 },
    surface: { treatment: 'paper', radiusBias: 'soft', shadowBias: 'soft' },
    button: { shape: 'rounded', variantBias: 'solid' },
    image: { frame: 'soft', aspectBias: 'mixed', hover: 'zoom' },
    pattern: { kind: 'tiles', opacity: 0.04, scale: 20 },
    classNames: { root: 'cultural-chinese-contemporary', divider: 'cultural-divider-stamp' },
  },
  {
    key: 'mediterranean_coastal',
    label: 'Mediterranean Coastal',
    defaultFontPairing: { headingKey: 'playfair_display', bodyKey: 'inter' },
    divider: { style: 'pattern', thickness: 1, opacity: 0.3 },
    surface: { treatment: 'flat', radiusBias: 'soft', shadowBias: 'none' },
    button: { shape: 'pill', variantBias: 'outline' },
    image: { frame: 'none', aspectBias: 'cinematic', hover: 'none' },
    pattern: { kind: 'wave', opacity: 0.05, scale: 26 },
    classNames: { root: 'cultural-mediterranean-coastal', divider: 'cultural-divider-pattern' },
  },
  {
    key: 'latin_street',
    label: 'Latin Street',
    defaultFontPairing: { headingKey: 'poppins', bodyKey: 'inter' },
    headingCase: 'uppercase',
    divider: { style: 'pattern', thickness: 2, opacity: 0.4 },
    surface: { treatment: 'card', radiusBias: 'soft', shadowBias: 'soft' },
    button: { shape: 'pill', variantBias: 'solid' },
    image: { frame: 'soft', aspectBias: 'mixed', hover: 'lift' },
    pattern: { kind: 'stamp', opacity: 0.07, scale: 30 },
    classNames: { root: 'cultural-latin-street', divider: 'cultural-divider-pattern' },
  },
  {
    key: 'american_classic',
    label: 'American Classic',
    defaultFontPairing: { headingKey: 'merriweather', bodyKey: 'inter' },
    divider: { style: 'hairline', thickness: 1, opacity: 0.26 },
    surface: { treatment: 'paper', radiusBias: 'sharp', shadowBias: 'none' },
    button: { shape: 'rounded', variantBias: 'solid' },
    image: { frame: 'sharp', aspectBias: 'mixed', hover: 'none' },
    pattern: { kind: 'linen', opacity: 0.04, scale: 18 },
    classNames: { root: 'cultural-american-classic', divider: 'cultural-divider-hairline' },
  },
  {
    key: 'indian_spice_house',
    label: 'Indian Spice House',
    defaultFontPairing: { headingKey: 'playfair_display', bodyKey: 'inter' },
    divider: { style: 'pattern', thickness: 1, opacity: 0.34 },
    surface: { treatment: 'paper', radiusBias: 'soft', shadowBias: 'soft' },
    button: { shape: 'rounded', variantBias: 'solid' },
    image: { frame: 'soft', aspectBias: 'mixed', hover: 'zoom' },
    pattern: { kind: 'tiles', opacity: 0.06, scale: 24 },
    classNames: { root: 'cultural-indian-spice', divider: 'cultural-divider-pattern' },
  },
  {
    key: 'middle_eastern_modern',
    label: 'Middle Eastern Modern',
    defaultFontPairing: { headingKey: 'playfair_display', bodyKey: 'inter' },
    divider: { style: 'pattern', thickness: 1, opacity: 0.32 },
    surface: { treatment: 'paper', radiusBias: 'soft', shadowBias: 'soft' },
    button: { shape: 'rounded', variantBias: 'outline' },
    image: { frame: 'none', aspectBias: 'cinematic', hover: 'none' },
    pattern: { kind: 'tiles', opacity: 0.05, scale: 16 },
    classNames: { root: 'cultural-middle-eastern-modern', divider: 'cultural-divider-pattern' },
  },
  {
    key: 'french_atelier',
    label: 'French Atelier',
    defaultFontPairing: { headingKey: 'playfair_display', bodyKey: 'inter' },
    headingTracking: 'wide',
    divider: { style: 'hairline', thickness: 1, opacity: 0.32 },
    surface: { treatment: 'flat', radiusBias: 'sharp', shadowBias: 'none' },
    button: { shape: 'rounded', variantBias: 'outline' },
    image: { frame: 'soft', aspectBias: 'mixed', hover: 'none' },
    classNames: { root: 'cultural-french-atelier', divider: 'cultural-divider-hairline' },
  },
  {
    key: 'italian_warm_modern',
    label: 'Italian Warm Modern',
    defaultFontPairing: { headingKey: 'lora', bodyKey: 'inter' },
    divider: { style: 'hairline', thickness: 1, opacity: 0.3 },
    surface: { treatment: 'paper', radiusBias: 'soft', shadowBias: 'soft' },
    button: { shape: 'rounded', variantBias: 'solid' },
    image: { frame: 'soft', aspectBias: 'mixed', hover: 'none' },
    pattern: { kind: 'linen', opacity: 0.04, scale: 24 },
    classNames: { root: 'cultural-italian-warm', divider: 'cultural-divider-hairline' },
  },
];

const LEGACY_STYLE_ALIASES: Record<string, string> = {
  japanese: 'japanese_minimal',
  korean: 'korean_modern',
  chinese: 'chinese_contemporary',
  mediterranean: 'mediterranean_coastal',
  latin: 'latin_street',
  indian: 'indian_spice_house',
  middle_eastern: 'middle_eastern_modern',
  french: 'french_atelier',
  italian: 'italian_warm_modern',
};

export function getCulturalStyle(key: string | null | undefined): CulturalStyle {
  const normalized = key ? LEGACY_STYLE_ALIASES[key] ?? key : key;
  return CULTURAL_STYLES.find((s) => s.key === normalized) ?? CULTURAL_STYLES.find((s) => s.key === 'american_classic') ?? CULTURAL_STYLES[0];
}

export function inferLayoutAndCulturalStyle(input: { textSignals: string[] }): { layoutKey: ThemeLayoutKey; culturalStyleKey: string } {
  const text = input.textSignals.join(' ').toLowerCase();

  const layoutKey: ThemeLayoutKey =
    /(tasting|chef(?:\W|$)|reservation|reserve|prix fixe|omakase|fine dining|price\s*level\s*[45]|luxury)/.test(text)
      ? 'luxury'
      : /(order now|delivery|pickup|fast|takeout|quick service|grab and go)/.test(text)
        ? /(menu|price|items|combo|set menu)/.test(text)
          ? 'menu_first'
          : 'modern_casual'
        : /(bakery|cafe|brunch|cozy|pastry)/.test(text)
          ? 'cozy_local'
          : /(menu|prices|many dishes|extensive menu|menu-heavy)/.test(text)
            ? 'menu_first'
            : /(modern|studio|bar|minimal)/.test(text)
              ? 'minimal_contemporary'
              : 'minimal_contemporary';

  const culturalStyleKey =
    /(sushi|omakase|izakaya|japanese)/.test(text)
      ? 'japanese_minimal'
      : /(korean|bbq|kimchi|bulgogi)/.test(text)
        ? 'korean_modern'
        : /(chinese|dim sum|noodle)/.test(text)
          ? 'chinese_contemporary'
          : /(mediterranean|greek|seafood|coastal)/.test(text)
            ? 'mediterranean_coastal'
            : /(taco|mexican|latin|taqueria)/.test(text)
              ? 'latin_street'
              : /(steakhouse|diner|american bbq|american)/.test(text)
                ? 'american_classic'
                : /(indian|curry|tandoor)/.test(text)
                  ? 'indian_spice_house'
                  : /(lebanese|shawarma|middle eastern|levant)/.test(text)
                    ? 'middle_eastern_modern'
                    : /(french|bistro|brasserie|patisserie)/.test(text)
                      ? 'french_atelier'
                      : /(italian|trattoria|osteria|pizza)/.test(text)
                        ? 'italian_warm_modern'
                        : 'american_classic';

  return { layoutKey, culturalStyleKey };
}
