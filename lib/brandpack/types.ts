export type FontKey =
  | 'inter'
  | 'playfair_display'
  | 'manrope'
  | 'nunito'
  | 'dm_sans'
  | 'lora'
  | 'poppins'
  | 'merriweather'
  | 'space_grotesk'
  | 'source_sans_3'
  | 'cormorant'
  | 'montserrat'
  | 'roboto_slab'
  | 'dm_serif_display';

export type BrandPack = {
  version: 1;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
    border: string;
  };
  typography: {
    headingFontKey: FontKey;
    bodyFontKey: FontKey;
  };
  style: {
    radius: 'soft' | 'rounded' | 'sharp';
    shadow: 'none' | 'soft' | 'elevated';
    density: 'airy' | 'balanced' | 'dense';
    button: 'pill' | 'rounded' | 'square';
    image: 'natural' | 'vibrant' | 'editorial';
  };
  source: {
    mode: 'photo_extract' | 'keyword_infer';
    signals: string[];
  };
};
