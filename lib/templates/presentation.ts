type SectionLayout = {
  heroVariant: 'centered' | 'split' | 'compact';
  menuStyle: 'standard' | 'dense';
  reviewStyle: 'quotes' | 'cards';
};

export function getTemplatePresentation(templateKey: string | null): SectionLayout {
  switch (templateKey) {
    case 'fine_dining_premium':
      return { heroVariant: 'split', menuStyle: 'standard', reviewStyle: 'quotes' };
    case 'fast_casual':
      return { heroVariant: 'compact', menuStyle: 'dense', reviewStyle: 'cards' };
    case 'brunch_bakery':
    case 'cozy_cafe':
      return { heroVariant: 'centered', menuStyle: 'standard', reviewStyle: 'cards' };
    case 'family_korean_asian':
      return { heroVariant: 'split', menuStyle: 'standard', reviewStyle: 'cards' };
    default:
      return { heroVariant: 'centered', menuStyle: 'standard', reviewStyle: 'cards' };
  }
}
