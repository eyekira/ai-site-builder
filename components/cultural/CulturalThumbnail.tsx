import type { CSSProperties } from 'react';

type Props = {
  styleKey: string;
  isSelected?: boolean;
};

type Variant = {
  navCta: 'none' | 'outline' | 'solid' | 'pill-solid';
  divider: 'hairline' | 'pattern' | 'stamp' | 'hairline-dot';
  radius: 'sharp' | 'soft' | 'pill';
  shadow: 'none' | 'soft';
  imageFrame: 'none' | 'soft' | 'sharp';
  pattern?: 'none' | 'grid' | 'tiles' | 'wave' | 'diagonal' | 'linen' | 'dots';
  airy?: boolean;
  uppercaseTone?: boolean;
  serifTone?: boolean;
  chips?: boolean;
  promoCards?: boolean;
  specialsTrio?: boolean;
  cinematicHero?: boolean;
  dualButtons?: boolean;
  stampSeal?: boolean;
  zoomMark?: boolean;
};

const VARIANTS: Record<string, Variant> = {
  japanese_minimal: { navCta: 'outline', divider: 'hairline', radius: 'soft', shadow: 'none', imageFrame: 'none', pattern: 'grid', serifTone: true },
  korean_modern: { navCta: 'pill-solid', divider: 'hairline', radius: 'soft', shadow: 'soft', imageFrame: 'soft', pattern: 'grid' },
  chinese_contemporary: { navCta: 'solid', divider: 'stamp', radius: 'soft', shadow: 'soft', imageFrame: 'soft', pattern: 'tiles', stampSeal: true },
  mediterranean_coastal: { navCta: 'outline', divider: 'pattern', radius: 'pill', shadow: 'none', imageFrame: 'none', pattern: 'wave', airy: true },
  latin_street: { navCta: 'pill-solid', divider: 'stamp', radius: 'pill', shadow: 'soft', imageFrame: 'sharp', pattern: 'diagonal', uppercaseTone: true, promoCards: true },
  american_classic: { navCta: 'solid', divider: 'hairline', radius: 'soft', shadow: 'soft', imageFrame: 'sharp', pattern: 'linen', dualButtons: true },
  indian_spice_house: { navCta: 'solid', divider: 'pattern', radius: 'soft', shadow: 'soft', imageFrame: 'soft', pattern: 'dots', chips: true, zoomMark: true },
  middle_eastern_modern: { navCta: 'outline', divider: 'pattern', radius: 'soft', shadow: 'none', imageFrame: 'none', pattern: 'tiles', cinematicHero: true },
  french_atelier: { navCta: 'outline', divider: 'hairline-dot', radius: 'sharp', shadow: 'none', imageFrame: 'soft', pattern: 'linen', serifTone: true },
  italian_warm_modern: { navCta: 'solid', divider: 'hairline', radius: 'soft', shadow: 'soft', imageFrame: 'soft', pattern: 'linen', specialsTrio: true },
};

function patternStyle(pattern: Variant['pattern']): CSSProperties {
  switch (pattern) {
    case 'grid':
      return { backgroundImage: 'repeating-linear-gradient(0deg, rgba(148,163,184,.08) 0 1px, transparent 1px 8px), repeating-linear-gradient(90deg, rgba(148,163,184,.08) 0 1px, transparent 1px 8px)' };
    case 'tiles':
      return { backgroundImage: 'repeating-linear-gradient(45deg, rgba(148,163,184,.08) 0 1px, transparent 1px 10px)' };
    case 'wave':
      return { backgroundImage: 'radial-gradient(120% 12px at 50% -5px, rgba(148,163,184,.08) 6%, transparent 7%)', backgroundSize: '40px 14px' };
    case 'diagonal':
      return { backgroundImage: 'repeating-linear-gradient(135deg, rgba(148,163,184,.08) 0 2px, transparent 2px 10px)' };
    case 'linen':
      return { backgroundImage: 'repeating-linear-gradient(0deg, rgba(148,163,184,.06) 0 1px, transparent 1px 6px)' };
    case 'dots':
      return { backgroundImage: 'radial-gradient(rgba(148,163,184,.08) 1px, transparent 1px)', backgroundSize: '8px 8px' };
    default:
      return {};
  }
}

function radiusClass(radius: Variant['radius']): string {
  if (radius === 'pill') return 'rounded-full';
  if (radius === 'sharp') return 'rounded-[4px]';
  return 'rounded-md';
}

export function CulturalThumbnail({ styleKey }: Props) {
  const v = VARIANTS[styleKey] ?? VARIANTS.american_classic;
  const gap = v.airy ? 'gap-2.5' : 'gap-1.5';
  const headlineHeight = v.uppercaseTone ? 'h-[3px]' : v.serifTone ? 'h-[2px]' : 'h-[3px]';
  const sectionRadius = radiusClass(v.radius);
  const imageRadius = v.imageFrame === 'sharp' ? 'rounded-[2px]' : v.imageFrame === 'soft' ? 'rounded-md' : 'rounded-[1px]';
  const panelShadow = v.shadow === 'soft' ? 'shadow-sm' : '';

  return (
    <div className="relative h-[90px] w-[144px] overflow-hidden rounded-md border border-zinc-300 bg-zinc-100">
      {v.pattern && v.pattern !== 'none' && <div className="absolute inset-0 opacity-70" style={patternStyle(v.pattern)} />}

      <div className="relative z-10 p-1.5">
        <div className={`flex h-[14px] items-center justify-between border border-zinc-300 bg-zinc-50 px-1 ${sectionRadius}`}>
          <div className="h-[8px] w-[18px] rounded-[2px] bg-zinc-400" />
          <div className="flex items-center gap-1">
            <div className="h-[4px] w-[10px] rounded-[1px] bg-zinc-300" />
            <div className="h-[4px] w-[10px] rounded-[1px] bg-zinc-300" />
            <div className="h-[4px] w-[10px] rounded-[1px] bg-zinc-300" />
          </div>
          {v.navCta !== 'none' ? (
            <div className={`h-[8px] w-[24px] border ${v.navCta.includes('solid') ? 'bg-zinc-500 border-zinc-500' : 'bg-transparent border-zinc-400'} ${v.navCta === 'pill-solid' ? 'rounded-full' : 'rounded-[3px]'}`} />
          ) : (
            <div className="w-[24px]" />
          )}
        </div>

        <div className={`mt-1 grid h-[28px] ${v.cinematicHero ? 'grid-cols-[2fr_3fr]' : 'grid-cols-[3fr_2fr]'} ${gap} border border-zinc-300 bg-zinc-50 p-1 ${sectionRadius} ${panelShadow}`}>
          <div className="space-y-1">
            <div className={`${headlineHeight} w-3/5 rounded bg-zinc-500`} />
            <div className={`${headlineHeight} w-2/5 rounded bg-zinc-400`} />
            <div className={`h-[6px] w-[22px] border ${v.navCta.includes('solid') ? 'bg-zinc-500 border-zinc-500' : 'bg-transparent border-zinc-400'} ${v.radius === 'pill' ? 'rounded-full' : v.radius === 'sharp' ? 'rounded-[2px]' : 'rounded-[4px]'}`} />
          </div>
          <div className={`border border-zinc-300 bg-zinc-200 ${imageRadius} relative ${v.imageFrame === 'none' ? 'border-transparent' : ''}`}>
            {v.zoomMark && <div className="absolute right-1 top-1 h-[3px] w-[3px] rounded-full bg-zinc-500" />}
          </div>
        </div>

        <div className="mt-1 h-[4px]">
          {v.divider === 'hairline' && <div className="h-px w-full bg-zinc-400/80" />}
          {v.divider === 'pattern' && <div className="h-px w-full bg-[repeating-linear-gradient(90deg,#94a3b8_0_2px,transparent_2px_4px)]" />}
          {v.divider === 'stamp' && <div className="mx-auto h-[3px] w-[12px] -rotate-6 rounded bg-zinc-500" />}
          {v.divider === 'hairline-dot' && <div className="relative h-px w-full bg-zinc-400/80"><div className="absolute left-1/2 top-[-1px] h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-zinc-500" /></div>}
        </div>

        {v.chips && (
          <div className="mt-1 flex gap-1">
            <div className="h-[5px] w-[16px] rounded-full bg-zinc-300" />
            <div className="h-[5px] w-[16px] rounded-full bg-zinc-300" />
            <div className="h-[5px] w-[16px] rounded-full bg-zinc-300" />
          </div>
        )}

        <div className={`mt-1 grid grid-cols-[3fr_2fr] ${gap}`}>
          <div className={`border border-zinc-300 bg-zinc-50 p-1 ${sectionRadius}`}>
            <div className="h-[3px] w-4/5 rounded bg-zinc-400" />
            <div className="mt-1 h-[3px] w-3/5 rounded bg-zinc-300" />
          </div>
          <div className={`border border-zinc-300 bg-zinc-200 ${imageRadius}`} />
        </div>

        {v.promoCards || v.specialsTrio ? (
          <div className="mt-1 grid grid-cols-3 gap-1">
            <div className="h-[8px] rounded-md border border-zinc-300 bg-zinc-200 shadow-sm" />
            <div className="h-[8px] rounded-md border border-zinc-300 bg-zinc-200 shadow-sm" />
            <div className="h-[8px] rounded-md border border-zinc-300 bg-zinc-200 shadow-sm" />
          </div>
        ) : (
          <div className="mt-1 space-y-1">
            <div className="h-[3px] w-full rounded bg-zinc-300" />
            <div className="h-[3px] w-11/12 rounded bg-zinc-300" />
          </div>
        )}

        {v.dualButtons && (
          <div className="mt-1 flex gap-1">
            <div className="h-[6px] w-[20px] rounded-[4px] bg-zinc-500" />
            <div className="h-[6px] w-[20px] rounded-[4px] border border-zinc-400" />
          </div>
        )}

        {v.stampSeal && <div className="absolute right-2 top-[46px] h-[4px] w-[4px] rounded-full bg-zinc-500/80" />}
        <div className="absolute right-2 bottom-1 text-[7px] text-zinc-500">Aa</div>
      </div>
    </div>
  );
}
