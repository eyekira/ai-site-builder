import type { ComponentType } from 'react';

import { BakeryLayout } from './BakeryLayout';
import { BistroLayout } from './BistroLayout';
import { FastCasualLayout } from './FastCasualLayout';
import { MinimalLayout } from './MinimalLayout';
import { PremiumLayout } from './PremiumLayout';
import type { LayoutRenderProps } from './types';

export const LAYOUT_COMPONENTS: Record<string, ComponentType<LayoutRenderProps>> = {
  bistro_editorial: BistroLayout,
  minimal_cafe: MinimalLayout,
  premium_omakase: PremiumLayout,
  modern_fast_casual: FastCasualLayout,
  cozy_bakery: BakeryLayout,
};
