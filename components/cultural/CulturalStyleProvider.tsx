import type { ReactNode } from 'react';

import { culturalStyleVars } from '@/lib/cultural-style/apply';
import { getCulturalStyle } from '@/lib/cultural-style/styles';

export function CulturalStyleProvider({ styleKey, children }: { styleKey?: string | null; children: ReactNode }) {
  const style = getCulturalStyle(styleKey);

  return (
    <div className={`cs-root cs-${style.key} ${style.classNames.root ?? ''}`} style={culturalStyleVars(style)}>
      {children}
    </div>
  );
}
