import type { BrandPack } from '@/lib/brandpack/types';

export const DEFAULT_BRAND_PACK: BrandPack = {
  version: 1,
  palette: {
    primary: '#1F2937',
    secondary: '#374151',
    accent: '#D97706',
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

export function parseBrandPack(raw: string | null | undefined): BrandPack {
  if (!raw) return DEFAULT_BRAND_PACK;
  try {
    const parsed = JSON.parse(raw) as BrandPack;
    return parsed?.version === 1 ? parsed : DEFAULT_BRAND_PACK;
  } catch {
    return DEFAULT_BRAND_PACK;
  }
}
