import type { ReactNode } from 'react';

export type LayoutSectionMap = {
  hero?: ReactNode;
  about?: ReactNode;
  menu?: ReactNode;
  photos?: ReactNode;
  reviews?: ReactNode;
  contact?: ReactNode;
  policies?: ReactNode;
};

export type LayoutRenderProps = {
  title: string;
  mutedTextClass: string;
  cardClass: string;
  heroCtaHref: string;
  ctaLabel: string;
  sections: LayoutSectionMap;
  surfaceClass?: string;
  typographyScaleClass?: string;
};
