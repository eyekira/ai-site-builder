export type CulturalStyle = {
  key: string;
  label: string;
  defaultFontPairing?: { headingKey: string; bodyKey: string };
  headingCase?: 'default' | 'uppercase';
  headingTracking?: 'default' | 'tight' | 'wide';
  divider: { style: 'none' | 'hairline' | 'pattern' | 'stamp'; thickness?: 1 | 2; opacity?: number };
  surface: { treatment: 'flat' | 'paper' | 'glass' | 'card'; radiusBias: 'sharp' | 'soft' | 'pill'; shadowBias: 'none' | 'soft' };
  button: { shape: 'sharp' | 'rounded' | 'pill'; variantBias: 'solid' | 'outline' };
  image: { frame: 'none' | 'soft' | 'sharp' | 'polaroid'; aspectBias: 'cinematic' | 'square' | 'mixed'; hover: 'none' | 'lift' | 'zoom' };
  pattern?: { kind: 'none' | 'grid' | 'linen' | 'wave' | 'tiles' | 'stamp'; opacity: number; scale: number };
  classNames: { root?: string; nav?: string; hero?: string; section?: string; card?: string; divider?: string; menu?: string; photo?: string; footer?: string };
};