type SectionLayout = {
  heroVariant: 'centered' | 'split' | 'compact';
  menuStyle: 'standard' | 'dense';
  reviewStyle: 'quotes' | 'cards';
};

export function getTemplatePresentation(templateKey: string | null): SectionLayout {
  switch (templateKey) {
    case 'fine_dining_premium':
    case 'steakhouse_classic':
    case 'omakase_counter':
      return { heroVariant: 'split', menuStyle: 'standard', reviewStyle: 'quotes' };
    case 'fast_casual':
    case 'takeout_delivery_first':
      return { heroVariant: 'compact', menuStyle: 'dense', reviewStyle: 'cards' };
    case 'brunch_social':
    case 'bakery_patisserie':
    case 'cafe_cozy':
      return { heroVariant: 'centered', menuStyle: 'standard', reviewStyle: 'cards' };
    case 'family_korean':
    case 'bbq_group':
      return { heroVariant: 'split', menuStyle: 'standard', reviewStyle: 'cards' };
    default:
      return { heroVariant: 'centered', menuStyle: 'standard', reviewStyle: 'cards' };
  }
}
