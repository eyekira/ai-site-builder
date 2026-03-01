import type { BrandPack } from '@/lib/brandpack/types';

function hexToRgb(hex: string) {
  const value = hex.replace('#', '');
  const normalized = value.length === 3 ? value.split('').map((ch) => ch + ch).join('') : value;
  const int = Number.parseInt(normalized, 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

function luminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r, g, b].map((v) => {
    const n = v / 255;
    return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrast(a: string, b: string) {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

function pickOn(bg: string): string {
  const white = '#FFFFFF';
  const black = '#111111';
  const cWhite = contrast(bg, white);
  const cBlack = contrast(bg, black);
  if (cWhite >= 4.5 || cBlack >= 4.5) return cWhite >= cBlack ? white : black;
  return cWhite > cBlack ? white : black;
}

export const DEFAULT_BRAND_PACK: BrandPack = {
  version: 1,
  palette: {
    primary: '#1F2937',
    onPrimary: '#FFFFFF',
    secondary: '#374151',
    accent: '#D97706',
    onAccent: '#111111',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#111827',
    muted: '#6B7280',
    border: '#E5E7EB',
  },
  typography: {
    headingFontKey: 'inter',
    bodyFontKey: 'inter',
  },
  style: {
    radius: 'rounded',
    shadow: 'soft',
    density: 'balanced',
    button: 'rounded',
    image: 'natural',
  },
  source: {
    mode: 'keyword_infer',
    signals: ['default'],
  },
};

function normalizeOnColors(pack: BrandPack): BrandPack {
  return {
    ...pack,
    palette: {
      ...pack.palette,
      onPrimary: pack.palette.onPrimary ?? pickOn(pack.palette.primary),
      onAccent: pack.palette.onAccent ?? pickOn(pack.palette.accent),
    },
  };
}

export function parseBrandPack(raw: string | null | undefined): BrandPack {
  if (!raw) return DEFAULT_BRAND_PACK;
  try {
    const parsed = JSON.parse(raw) as Partial<BrandPack>;
    if (parsed?.version !== 1 || !parsed.palette || !parsed.typography || !parsed.style || !parsed.source) {
      return DEFAULT_BRAND_PACK;
    }

    return normalizeOnColors(parsed as BrandPack);
  } catch {
    return DEFAULT_BRAND_PACK;
  }
}
