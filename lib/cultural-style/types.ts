export type DividerStyle = 'none' | 'hairline' | 'pattern' | 'stamp';
export type SurfaceTreatment = 'flat' | 'paper' | 'glass' | 'card';
export type ImageFrame = 'none' | 'soft' | 'sharp' | 'polaroid';
export type OrnamentLevel = 'none' | 'subtle' | 'medium';

export type CulturalStyle = {
  key: string;
  label: string;

  defaultFontPairing?: { headingKey: string; bodyKey: string };
  headingCase?: 'default' | 'uppercase';
  headingTracking?: 'default' | 'tight' | 'wide';

  divider: { style: DividerStyle; thickness?: 1 | 2; opacity?: number };
  surface: { treatment: SurfaceTreatment; radiusBias: 'sharp' | 'soft' | 'pill'; shadowBias: 'none' | 'soft' };
  button: { shape: 'sharp' | 'rounded' | 'pill'; variantBias: 'solid' | 'outline' };
  image: { frame: ImageFrame; aspectBias: 'cinematic' | 'square' | 'mixed'; hover: 'none' | 'lift' | 'zoom' };

  pattern?: { kind: 'none' | 'grid' | 'linen' | 'wave' | 'tiles' | 'stamp'; opacity: number; scale: number };

  classNames: {
    root?: string;
    nav?: string;
    hero?: string;
    section?: string;
    card?: string;
    divider?: string;
    menu?: string;
    photo?: string;
    footer?: string;
  };
};
