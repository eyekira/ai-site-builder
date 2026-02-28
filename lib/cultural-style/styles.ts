import type { CulturalStyle } from './types';

export const CULTURAL_STYLES: CulturalStyle[] = [
  { key: 'japanese', label: 'Japanese', defaultFontPairing: { heading: 'playfair_display', body: 'inter' }, sectionDividerStyle: 'line', radiusScale: 'sharp', buttonStyle: 'rounded', decorativeClass: 'cultural-japanese' },
  { key: 'korean', label: 'Korean', defaultFontPairing: { heading: 'space_grotesk', body: 'dm_sans' }, sectionDividerStyle: 'pattern', radiusScale: 'soft', buttonStyle: 'rounded', decorativeClass: 'cultural-korean' },
  { key: 'chinese', label: 'Chinese', defaultFontPairing: { heading: 'merriweather', body: 'inter' }, sectionDividerStyle: 'line', radiusScale: 'soft', buttonStyle: 'pill', decorativeClass: 'cultural-chinese' },
  { key: 'mediterranean', label: 'Mediterranean', defaultFontPairing: { heading: 'lora', body: 'nunito' }, sectionDividerStyle: 'pattern', radiusScale: 'soft', buttonStyle: 'pill', decorativeClass: 'cultural-mediterranean' },
  { key: 'latin', label: 'Latin', defaultFontPairing: { heading: 'poppins', body: 'dm_sans' }, sectionDividerStyle: 'none', radiusScale: 'soft', buttonStyle: 'pill', decorativeClass: 'cultural-latin' },
  { key: 'american_classic', label: 'American Classic', defaultFontPairing: { heading: 'merriweather', body: 'inter' }, sectionDividerStyle: 'line', radiusScale: 'sharp', buttonStyle: 'square', decorativeClass: 'cultural-american' },
  { key: 'indian', label: 'Indian', defaultFontPairing: { heading: 'playfair_display', body: 'nunito' }, sectionDividerStyle: 'pattern', radiusScale: 'soft', buttonStyle: 'rounded', decorativeClass: 'cultural-indian' },
  { key: 'middle_eastern', label: 'Middle Eastern', defaultFontPairing: { heading: 'lora', body: 'manrope' }, sectionDividerStyle: 'pattern', radiusScale: 'soft', buttonStyle: 'pill', decorativeClass: 'cultural-middle-eastern' },
  { key: 'french', label: 'French', defaultFontPairing: { heading: 'playfair_display', body: 'merriweather' }, sectionDividerStyle: 'line', radiusScale: 'sharp', buttonStyle: 'rounded', decorativeClass: 'cultural-french' },
  { key: 'italian', label: 'Italian', defaultFontPairing: { heading: 'lora', body: 'inter' }, sectionDividerStyle: 'line', radiusScale: 'soft', buttonStyle: 'rounded', decorativeClass: 'cultural-italian' },
];

export function getCulturalStyle(key: string | null | undefined): CulturalStyle {
  return CULTURAL_STYLES.find((s) => s.key === key) ?? CULTURAL_STYLES.find((s) => s.key === 'american_classic') ?? CULTURAL_STYLES[0];
}

export function inferLayoutAndCulturalStyle(input: { textSignals: string[] }): { layoutKey: string; culturalStyleKey: string } {
  const text = input.textSignals.join(' ').toLowerCase();

  if (/(sushi|omakase|kaiseki|japanese)/.test(text)) return { layoutKey: 'luxury', culturalStyleKey: 'japanese' };
  if (/(taco|mexican|taqueria)/.test(text)) return { layoutKey: 'modern_casual', culturalStyleKey: 'latin' };
  if (/(bakery|patisserie)/.test(text)) return { layoutKey: 'cozy_local', culturalStyleKey: 'french' };
  if (/(korean|bbq|bulgogi|kimchi)/.test(text)) return { layoutKey: 'modern_casual', culturalStyleKey: 'korean' };
  if (/(italian|trattoria|osteria|fine dining)/.test(text)) return { layoutKey: 'luxury', culturalStyleKey: 'italian' };

  return { layoutKey: 'minimal_contemporary', culturalStyleKey: 'american_classic' };
}
