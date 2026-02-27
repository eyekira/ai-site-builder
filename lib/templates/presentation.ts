export type SectionLayout = {
  heroVariant: 'centered' | 'split' | 'compact';
  menuStyle: 'standard' | 'dense';
  reviewStyle: 'quotes' | 'cards';
  navStyle: 'minimal' | 'luxury' | 'casual';
  logoPlacement: 'left' | 'center';
  navItems: string[];
  containerWidth: string;
  headingClass: string;
  sectionClass: string;
  menuItemClass: string;
};

const DEFAULT_LAYOUT: SectionLayout = {
  heroVariant: 'centered',
  menuStyle: 'standard',
  reviewStyle: 'cards',
  navStyle: 'minimal',
  logoPlacement: 'left',
  navItems: ['Menu', 'Photos', 'Visit'],
  containerWidth: 'max-w-5xl',
  headingClass: 'text-2xl font-semibold',
  sectionClass: 'rounded-3xl p-6 shadow-sm',
  menuItemClass: 'flex items-start justify-between gap-6',
};

export function getTemplatePresentation(templateKey: string | null): SectionLayout {
  switch (templateKey) {
    case 'fine_dining_premium':
      return {
        ...DEFAULT_LAYOUT,
        heroVariant: 'split',
        reviewStyle: 'quotes',
        navStyle: 'luxury',
        logoPlacement: 'center',
        navItems: ['Experience', 'Tasting', 'Reserve'],
        containerWidth: 'max-w-6xl',
        headingClass: 'text-3xl font-semibold tracking-tight',
        sectionClass: 'rounded-sm p-8 shadow-lg',
        menuItemClass: 'grid grid-cols-[1fr_auto] gap-6 border-b border-white/10 pb-4',
      };

    case 'omakase_counter':
      return {
        ...DEFAULT_LAYOUT,
        heroVariant: 'split',
        reviewStyle: 'quotes',
        navStyle: 'luxury',
        logoPlacement: 'center',
        navItems: ['Counter', 'Courses', 'Policies', 'Reserve'],
        containerWidth: 'max-w-4xl',
        headingClass: 'text-3xl font-semibold tracking-tight',
        sectionClass: 'rounded-2xl p-7 shadow-lg',
        menuItemClass: 'grid grid-cols-[1fr_auto] gap-5 border-b border-white/10 pb-3',
      };

    case 'steakhouse_classic':
      return {
        ...DEFAULT_LAYOUT,
        heroVariant: 'split',
        reviewStyle: 'quotes',
        navStyle: 'luxury',
        logoPlacement: 'center',
        navItems: ['Cuts', 'Wine', 'Private Dining', 'Reserve'],
        containerWidth: 'max-w-6xl',
        headingClass: 'text-3xl font-semibold',
        sectionClass: 'rounded-xl p-7 shadow-lg',
        menuItemClass: 'grid grid-cols-[1fr_auto] gap-6 border-b border-white/10 pb-4',
      };

    case 'fast_casual':
    case 'takeout_delivery_first':
      return {
        ...DEFAULT_LAYOUT,
        heroVariant: 'compact',
        menuStyle: 'dense',
        navStyle: 'casual',
        navItems: ['Order', 'Deals', 'Locations'],
        containerWidth: 'max-w-5xl',
        headingClass: 'text-xl font-bold uppercase tracking-wide',
        sectionClass: 'rounded-2xl p-5 shadow-sm',
        menuItemClass: 'flex items-start justify-between gap-3 rounded-xl border border-zinc-200/60 p-3',
      };

    case 'brunch_social':
    case 'bakery_patisserie':
      return {
        ...DEFAULT_LAYOUT,
        heroVariant: 'centered',
        navStyle: 'casual',
        navItems: ['Specials', 'Menu', 'Gallery', 'Visit'],
        containerWidth: 'max-w-5xl',
        headingClass: 'text-2xl font-semibold',
        sectionClass: 'rounded-3xl p-6 shadow-sm',
        menuItemClass: 'flex items-start justify-between gap-5',
      };

    case 'cafe_cozy':
      return {
        ...DEFAULT_LAYOUT,
        heroVariant: 'centered',
        navStyle: 'casual',
        navItems: ['Seasonal', 'Menu', 'Amenities', 'Visit'],
        containerWidth: 'max-w-5xl',
        headingClass: 'text-2xl font-semibold',
        sectionClass: 'rounded-3xl p-6 shadow-sm',
        menuItemClass: 'flex items-start justify-between gap-5',
      };

    case 'family_korean':
    case 'bbq_group':
      return {
        ...DEFAULT_LAYOUT,
        heroVariant: 'split',
        navStyle: 'casual',
        navItems: ['Best Sellers', 'Set Menu', 'Group', 'Visit'],
        containerWidth: 'max-w-6xl',
        headingClass: 'text-2xl font-bold',
        sectionClass: 'rounded-2xl p-6 shadow-md',
        menuItemClass: 'flex items-start justify-between gap-4 rounded-xl border border-zinc-200/70 p-4',
      };

    default:
      return DEFAULT_LAYOUT;
  }
}
