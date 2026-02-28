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

export function contrast(a: string, b: string) {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

export function ensureBrandPackContrast(pack: BrandPack): BrandPack {
  const ratio = contrast(pack.palette.text, pack.palette.background);
  if (ratio >= 4.5) return pack;

  return {
    ...pack,
    palette: {
      ...pack.palette,
      text: '#111827',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      border: '#CBD5E1',
    },
  };
}
