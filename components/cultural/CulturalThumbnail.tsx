import type { CSSProperties } from 'react';

type Props = {
  styleKey: string;
  isSelected?: boolean;
};

type Variant = {
  divider: 'hairline' | 'pattern' | 'stamp';
  pattern: 'none' | 'grid' | 'linen' | 'wave' | 'tiles' | 'stamp';
  button: 'sharp' | 'rounded' | 'pill';
};

const VARIANTS: Record<string, Variant> = {
  japanese_minimal: { divider: 'hairline', pattern: 'none', button: 'rounded' },
  korean_modern: { divider: 'hairline', pattern: 'grid', button: 'pill' },
  chinese_contemporary: { divider: 'stamp', pattern: 'tiles', button: 'rounded' },
  mediterranean_coastal: { divider: 'pattern', pattern: 'wave', button: 'pill' },
  latin_street: { divider: 'stamp', pattern: 'stamp', button: 'pill' },
  american_classic: { divider: 'hairline', pattern: 'linen', button: 'rounded' },
  indian_spice_house: { divider: 'pattern', pattern: 'tiles', button: 'rounded' },
  middle_eastern_modern: { divider: 'pattern', pattern: 'tiles', button: 'rounded' },
  french_atelier: { divider: 'hairline', pattern: 'linen', button: 'sharp' },
  italian_warm_modern: { divider: 'hairline', pattern: 'linen', button: 'rounded' },
};

function patternStyle(pattern: Variant['pattern']): CSSProperties {
  switch (pattern) {
    case 'grid':
      return { backgroundImage: 'repeating-linear-gradient(0deg, rgba(148,163,184,.08) 0 1px, transparent 1px 10px), repeating-linear-gradient(90deg, rgba(148,163,184,.08) 0 1px, transparent 1px 10px)' };
    case 'linen':
      return { backgroundImage: 'repeating-linear-gradient(0deg, rgba(148,163,184,.06) 0 1px, transparent 1px 7px)' };
    case 'wave':
      return { backgroundImage: 'radial-gradient(120% 14px at 50% -5px, rgba(148,163,184,.08) 7%, transparent 8%)', backgroundSize: '42px 16px' };
    case 'tiles':
      return { backgroundImage: 'repeating-linear-gradient(45deg, rgba(148,163,184,.07) 0 1px, transparent 1px 12px)' };
    case 'stamp':
      return { backgroundImage: 'repeating-linear-gradient(135deg, rgba(148,163,184,.08) 0 2px, transparent 2px 12px)' };
    default:
      return {};
  }
}

export function CulturalThumbnail({ styleKey }: Props) {
  const v = VARIANTS[styleKey] ?? VARIANTS.american_classic;
  const buttonRadius = v.button === 'pill' ? 'rounded-full' : v.button === 'sharp' ? 'rounded-[2px]' : 'rounded-[4px]';

  return (
    <div className="relative h-[90px] w-[144px] overflow-hidden rounded-md border border-zinc-300 bg-zinc-100">
      {v.pattern !== 'none' && <div className="absolute inset-0 opacity-70" style={patternStyle(v.pattern)} />}

      <div className="relative z-10 p-1.5">
        <div className="h-[14px] rounded-[4px] border border-zinc-300 bg-zinc-50" />
        <div className="mt-1 h-[28px] rounded-[4px] border border-zinc-300 bg-zinc-50" />

        <div className="mt-1 h-[4px]">
          {v.divider === 'hairline' && <div className="h-px w-full bg-zinc-400/80" />}
          {v.divider === 'pattern' && <div className="h-px w-full bg-[repeating-linear-gradient(90deg,#94a3b8_0_2px,transparent_2px_5px)]" />}
          {v.divider === 'stamp' && <div className="mx-auto h-[3px] w-[14px] rounded bg-zinc-500" />}
        </div>

        <div className="mt-1 grid grid-cols-[3fr_2fr] gap-1">
          <div className="h-[14px] rounded-[4px] border border-zinc-300 bg-zinc-50" />
          <div className="h-[14px] rounded-[4px] border border-zinc-300 bg-zinc-200" />
        </div>

        <div className="mt-1 flex items-center justify-between">
          <div className="h-[6px] w-[22px] rounded-[3px] bg-zinc-300" />
          <div className={`h-[6px] w-[22px] border border-zinc-400 bg-zinc-500 ${buttonRadius}`} />
        </div>
      </div>
    </div>
  );
}
