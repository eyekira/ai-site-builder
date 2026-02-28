export interface CulturalStyle {
  key: string;
  label: string;
  defaultFontPairing?: { heading: string; body: string };
  sectionDividerStyle?: 'line' | 'pattern' | 'none';
  radiusScale?: 'soft' | 'sharp';
  buttonStyle?: 'pill' | 'rounded' | 'square';
  imageStyle?: 'edge' | 'framed' | 'shadow';
  decorativeClass?: string;
}
