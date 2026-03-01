import type { CSSProperties } from 'react';
import type { CulturalStyle } from './types';

export function culturalStyleVars(style: CulturalStyle): CSSProperties {
  const headingCase = style.headingCase === 'uppercase' ? 'uppercase' : 'none';
  const headingTracking = style.headingTracking === 'tight' ? '-0.02em' : style.headingTracking === 'wide' ? '0.08em' : 'normal';
  const radiusMult = style.surface.radiusBias === 'pill' ? '999px' : style.surface.radiusBias === 'sharp' ? '0px' : '16px';
  const shadowLevel = style.surface.shadowBias === 'soft' ? '0 8px 24px' : '0 0 0';

  return {
    ['--cs-radius-mult' as string]: radiusMult,
    ['--cs-shadow-level' as string]: shadowLevel,
    ['--cs-divider-opacity' as string]: String(style.divider.opacity ?? 0.35),
    ['--cs-divider-thickness' as string]: `${style.divider.thickness ?? 1}px`,
    ['--cs-pattern-opacity' as string]: String(style.pattern?.opacity ?? 0),
    ['--cs-pattern-scale' as string]: String(style.pattern?.scale ?? 1),
    ['--cs-heading-case' as string]: headingCase,
    ['--cs-heading-tracking' as string]: headingTracking,
  };
}
