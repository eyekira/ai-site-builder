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

export type LayoutNavLink = {
  label: string;
  href: string;
};

export type LayoutAnchors = Partial<Record<'about' | 'menu' | 'photos' | 'reviews' | 'contact', string>>;

export type LayoutRenderProps = {
  title: string;
  mutedTextClass: string;
  cardClass: string;
  heroCtaHref: string;
  ctaLabel: string;
  sections: LayoutSectionMap;
  navLinks?: LayoutNavLink[];
  anchors?: LayoutAnchors;
  surfaceClass?: string;
  typographyScaleClass?: string;
};
