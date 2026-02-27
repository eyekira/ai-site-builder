type SectionLayout = {
  heroVariant: 'centered' | 'split' | 'compact';
  menuStyle: 'standard' | 'dense';
  reviewStyle: 'quotes' | 'cards';
  navStyle: 'minimal' | 'luxury' | 'casual';
  logoPlacement: 'left' | 'center';
};

export function getTemplatePresentation(templateKey: string | null): SectionLayout {
  switch (templateKey) {
    case 'fine_dining_premium':
    case 'steakhouse_classic':
    case 'omakase_counter':
      return { heroVariant: 'split', menuStyle: 'standard', reviewStyle: 'quotes', navStyle: 'luxury', logoPlacement: 'center' };
    case 'fast_casual':
    case 'takeout_delivery_first':
      return { heroVariant: 'compact', menuStyle: 'dense', reviewStyle: 'cards', navStyle: 'casual', logoPlacement: 'left' };
    case 'brunch_social':
    case 'bakery_patisserie':
    case 'cafe_cozy':
      return { heroVariant: 'centered', menuStyle: 'standard', reviewStyle: 'cards', navStyle: 'casual', logoPlacement: 'left' };
    case 'family_korean':
    case 'bbq_group':
      return { heroVariant: 'split', menuStyle: 'standard', reviewStyle: 'cards', navStyle: 'casual', logoPlacement: 'left' };
    default:
      return { heroVariant: 'centered', menuStyle: 'standard', reviewStyle: 'cards', navStyle: 'minimal', logoPlacement: 'left' };
  }
}
