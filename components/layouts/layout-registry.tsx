import type { ComponentType } from 'react';

import { BakeryLayout } from './BakeryLayout';
import { BistroLayout } from './BistroLayout';
import { FastCasualLayout } from './FastCasualLayout';
import { MinimalLayout } from './MinimalLayout';
import { PremiumLayout } from './PremiumLayout';
import type { LayoutRenderProps } from './types';

export const LAYOUT_COMPONENTS: Record<string, ComponentType<LayoutRenderProps>> = {
  luxury: PremiumLayout,
  modern_casual: FastCasualLayout,
  cozy_local: BakeryLayout,
  minimal_contemporary: MinimalLayout,
  menu_first: BistroLayout,
};
