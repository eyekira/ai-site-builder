import type { PhotoCategory } from '@/lib/photo-classifier';
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

function ensureContrast(pack: BrandPack): BrandPack {
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

const KEYWORD_PACKS: Array<{ match: string[]; pack: Omit<BrandPack, 'source' | 'version'> }> = [
  {
    match: ['omakase', 'fine dining', 'steakhouse'],
    pack: {
      palette: {
        primary: '#1F2937', secondary: '#111827', accent: '#D4AF37', background: '#0B0F14', surface: '#111827', text: '#F9FAFB', muted: '#9CA3AF', border: '#374151',
      },
      typography: { headingFontKey: 'playfair_display', bodyFontKey: 'inter' },
      style: { radius: 'sharp', shadow: 'elevated', density: 'airy', button: 'rounded', image: 'editorial' },
    },
  },
  {
    match: ['bakery', 'brunch', 'cafe'],
    pack: {
      palette: {
        primary: '#B45309', secondary: '#F59E0B', accent: '#EC4899', background: '#FFFBF5', surface: '#FFFFFF', text: '#3F3F46', muted: '#71717A', border: '#FDE68A',
      },
      typography: { headingFontKey: 'lora', bodyFontKey: 'nunito' },
      style: { radius: 'soft', shadow: 'soft', density: 'balanced', button: 'pill', image: 'natural' },
    },
  },
  {
    match: ['fast', 'delivery', 'takeout', 'casual'],
    pack: {
      palette: {
        primary: '#0EA5E9', secondary: '#0284C7', accent: '#22C55E', background: '#F8FAFC', surface: '#FFFFFF', text: '#0F172A', muted: '#475569', border: '#CBD5E1',
      },
      typography: { headingFontKey: 'manrope', bodyFontKey: 'dm_sans' },
      style: { radius: 'rounded', shadow: 'soft', density: 'dense', button: 'square', image: 'vibrant' },
    },
  },
];

export function generateBrandPack(input: { textSignals: string[]; photoCategories?: PhotoCategory[] }): BrandPack {
  const haystack = input.textSignals.join(' ').toLowerCase();

  const byKeyword = KEYWORD_PACKS.find((entry) => entry.match.some((term) => haystack.includes(term)));

  const mode: BrandPack['source']['mode'] = input.photoCategories && input.photoCategories.length > 0 ? 'photo_extract' : 'keyword_infer';

  const fallback = KEYWORD_PACKS[2].pack;
  const selected = byKeyword?.pack ?? fallback;

  const signalSet = new Set<string>();
  (byKeyword?.match ?? ['fallback']).forEach((s) => signalSet.add(s));
  (input.photoCategories ?? []).slice(0, 5).forEach((s) => signalSet.add(`photo:${s}`));

  const pack: BrandPack = {
    version: 1,
    ...selected,
    source: {
      mode,
      signals: [...signalSet].slice(0, 8),
    },
  };

  return ensureContrast(pack);
}
