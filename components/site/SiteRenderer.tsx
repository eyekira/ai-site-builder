import { LAYOUT_COMPONENTS } from '@/components/layouts/layout-registry';
import { AboutContentBlock } from '@/components/sections/AboutContent';
import { ContactContentBlock } from '@/components/sections/ContactContent';
import { HeroContentBlock } from '@/components/sections/HeroContent';
import { MenuSection } from '@/components/sections/MenuSection';
import { PhotosContent } from '@/components/sections/PhotosContent';
import { PoliciesSection } from '@/components/sections/PoliciesSection';
import { ReviewsSection } from '@/components/sections/ReviewsSection';
import { formatHoursFromJson } from '@/lib/hours';
import type { SiteForRender } from '@/lib/site';
import {
  DEFAULT_ABOUT_CONTENT,
  DEFAULT_CONTACT_CONTENT,
  DEFAULT_HERO_CONTENT,
  DEFAULT_PHOTOS_CONTENT,
  parseAboutContent,
  parseContactContent,
  parseHeroContent,
  parseMenuContent,
  parsePhotosContent,
  parseReviewsContent,
} from '@/lib/section-content';
import { extractTemplateMetadata, parseThemeJson } from '@/lib/theme';
import { resolveThemeLayoutKey } from '@/lib/themes/registry';
import { parseBrandPack } from '@/lib/brandpack/parse';
import { FONT_CLASS_BY_KEY } from '@/lib/brandpack/fonts';


type SiteRendererProps = {
  site: SiteForRender;
  embedMode?: boolean;
  fullPage?: boolean;
  canEdit?: boolean;
  editorHref?: string;
};

function parseHoursJson(hoursJson: string | null): string | null {
  if (!hoursJson) return null;
  try {
    const record = JSON.parse(hoursJson) as Record<string, unknown>;
    return formatHoursFromJson(record);
  } catch {
    return null;
  }
}

function safeParseHeroContent(raw: string) {
  try {
    return parseHeroContent(raw);
  } catch {
    return DEFAULT_HERO_CONTENT;
  }
}

function safeParseAboutContent(raw: string) {
  try {
    return parseAboutContent(raw);
  } catch {
    return DEFAULT_ABOUT_CONTENT;
  }
}

function safeParseContactContent(raw: string) {
  try {
    return parseContactContent(raw);
  } catch {
    return DEFAULT_CONTACT_CONTENT;
  }
}

function safeParsePhotosContent(raw: string) {
  try {
    return parsePhotosContent(raw);
  } catch {
    return DEFAULT_PHOTOS_CONTENT;
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.trim().replace('#', '');
  const value = normalized.length === 3 ? normalized.split('').map((c) => c + c).join('') : normalized;
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return null;
  const n = Number.parseInt(value, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function relativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const linear = [rgb.r, rgb.g, rgb.b].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrastRatio(a: string, b: string): number {
  const rgbA = hexToRgb(a);
  const rgbB = hexToRgb(b);
  if (!rgbA || !rgbB) return 1;
  const l1 = relativeLuminance(rgbA);
  const l2 = relativeLuminance(rgbB);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function pickOnColor(bg: string): string {
  const white = '#FFFFFF';
  const black = '#111111';
  const whiteRatio = contrastRatio(bg, white);
  const blackRatio = contrastRatio(bg, black);
  if (whiteRatio >= 4.5 || blackRatio >= 4.5) return whiteRatio >= blackRatio ? white : black;
  return whiteRatio > blackRatio ? white : black;
}

export function SiteRenderer({ site, embedMode = false, fullPage = false, canEdit = false, editorHref }: SiteRendererProps) {
  const businessTitle = site.businessTitle ?? site.title;
  const address = site.formattedAddress ?? site.place?.address ?? null;
  const phone = site.phone ?? site.place?.phone ?? null;
  const hoursText = parseHoursJson(site.hoursJson ?? site.place?.hoursJson ?? null);

  const theme = parseThemeJson(site.themeJson);
  const layoutKey = resolveThemeLayoutKey(site.themeJson);
  const Layout = LAYOUT_COMPONENTS[layoutKey] ?? LAYOUT_COMPONENTS.minimal_contemporary;
  const { templateKey } = extractTemplateMetadata(site.themeJson);
  const brandPack = parseBrandPack(site.brandPackJson);
  const hasEditorOverride = brandPack.source.signals.includes('editor_override');
  const defaultPairingByLayout: Record<string, { heading: keyof typeof FONT_CLASS_BY_KEY; body: keyof typeof FONT_CLASS_BY_KEY }> = {
    luxury: { heading: 'playfair_display', body: 'merriweather' },
    modern_casual: { heading: 'space_grotesk', body: 'dm_sans' },
    cozy_local: { heading: 'lora', body: 'nunito' },
    minimal_contemporary: { heading: 'poppins', body: 'inter' },
    menu_first: { heading: 'manrope', body: 'inter' },
  };
  const pairing = defaultPairingByLayout[layoutKey] ?? defaultPairingByLayout.minimal_contemporary;
  const headingFontKey = hasEditorOverride ? brandPack.typography.headingFontKey : pairing.heading;
  const bodyFontKey = hasEditorOverride ? brandPack.typography.bodyFontKey : pairing.body;
  const headingFontClass = FONT_CLASS_BY_KEY[headingFontKey];
  const bodyFontClass = FONT_CLASS_BY_KEY[bodyFontKey];

  const densityClass =
    brandPack.style.density === 'airy' ? 'gap-12' : brandPack.style.density === 'dense' ? 'gap-2.5' : 'gap-6';
  const typographyScaleClass =
    brandPack.style.density === 'airy'
      ? '[&_.text-2xl]:text-3xl [&_.text-sm]:text-base [&_.text-xs]:tracking-[0.12em]'
      : brandPack.style.density === 'dense'
        ? '[&_.text-2xl]:text-xl [&_.text-sm]:text-xs [&_.text-base]:text-sm'
        : '';
  const layoutFrameClass =
    layoutKey === 'luxury'
      ? 'max-w-[78rem]'
      : layoutKey === 'modern_casual'
        ? 'max-w-[92rem]'
        : layoutKey === 'cozy_local'
          ? 'max-w-[84rem]'
          : layoutKey === 'minimal_contemporary'
            ? 'max-w-[76rem]'
            : 'max-w-[88rem]';
  const radiusClass = brandPack.style.radius === 'soft' ? 'rounded-3xl' : brandPack.style.radius === 'sharp' ? 'rounded-none' : 'rounded-xl';
  const shadowClass =
    brandPack.style.shadow === 'none' ? 'shadow-none' : brandPack.style.shadow === 'elevated' ? 'shadow-xl' : 'shadow-sm';
  const surfaceClass = `${radiusClass} ${shadowClass}`;
  const onPrimary = brandPack.palette.onPrimary ?? pickOnColor(brandPack.palette.primary);
  const onAccent = brandPack.palette.onAccent ?? pickOnColor(brandPack.palette.accent);

  const heroSection = site.sections.find((section) => section.type === 'HERO');
  const aboutSection = site.sections.find((section) => section.type === 'ABOUT');
  const menuSection = site.sections.find((section) => section.type === 'MENU');
  const photosSection = site.sections.find((section) => section.type === 'PHOTOS');
  const reviewsSection = site.sections.find((section) => section.type === 'REVIEWS');
  const contactSection = site.sections.find((section) => section.type === 'CONTACT');

  const assetMap = new Map(site.assets.map((assetItem) => [assetItem.id, assetItem]));

  const photos =
    site.photos.length > 0
      ? site.photos.map((photo) => ({ id: photo.id, url: photo.url, category: photo.category, isHero: photo.isHero }))
      : (() => {
          if (!photosSection) return [];
          const parsed = safeParsePhotosContent(photosSection.contentJson ?? '{}');
          return parsed.assetIds
            .map((assetId) => assetMap.get(assetId))
            .filter((assetItem): assetItem is { id: number; ref: string } => Boolean(assetItem))
            .map((assetItem) => ({
              id: assetItem.id,
              url: `/api/places/photo?ref=${encodeURIComponent(assetItem.ref)}&maxwidth=1200`,
            }));
        })();

  const heroHref = (() => {
    if (!heroSection) return '#';
    try {
      const parsed = JSON.parse(heroSection.contentJson ?? '{}') as { ctas?: Array<{ href?: string; label?: string }> };
      return parsed.ctas?.[0]?.href ?? '#';
    } catch {
      return '#';
    }
  })();

  const ctaLabel = (() => {
    const byTemplate: Record<string, string> = {
      fine_dining_premium: 'Reserve Table',
      omakase_counter: 'Reserve Seats',
      steakhouse_classic: 'Book Dinner',
      family_korean: 'View Menu',
      bbq_group: 'Reserve Group',
      cafe_cozy: 'Order Ahead',
      bakery_patisserie: 'Preorder Pickup',
      brunch_social: 'Reserve Brunch',
      fast_casual: 'Start Order',
      takeout_delivery_first: 'Order Delivery',
    };

    if (templateKey && byTemplate[templateKey]) {
      return byTemplate[templateKey];
    }

    if (!heroSection) return 'Reserve';
    try {
      const parsed = JSON.parse(heroSection.contentJson ?? '{}') as { ctas?: Array<{ href?: string; label?: string }> };
      return parsed.ctas?.[0]?.label ?? 'Reserve';
    } catch {
      return 'Reserve';
    }
  })();

  const anchorBase = `site-${site.id}-${layoutKey}`;
  const anchors = {
    about: `${anchorBase}-about`,
    menu: `${anchorBase}-menu`,
    photos: `${anchorBase}-photos`,
    reviews: `${anchorBase}-reviews`,
    contact: `${anchorBase}-contact`,
  };

  const sections = {
    hero: heroSection ? (
      <HeroContentBlock
        businessTitle={businessTitle}
        content={safeParseHeroContent(heroSection.contentJson ?? '{}')}
        heroClassName="text-current"
      />
    ) : undefined,
    about: aboutSection ? <AboutContentBlock content={safeParseAboutContent(aboutSection.contentJson ?? '{}')} mutedTextClass={theme.mutedTextClass} /> : undefined,
    menu: menuSection ? <MenuSection content={parseMenuContent(menuSection.contentJson ?? '{}')} mutedTextClass={theme.mutedTextClass} /> : undefined,
    photos: photos.length > 0 ? <PhotosContent photos={photos} /> : undefined,
    reviews: reviewsSection ? <ReviewsSection content={parseReviewsContent(reviewsSection.contentJson ?? '{}')} mutedTextClass={theme.mutedTextClass} /> : undefined,
    contact: contactSection ? (
      <ContactContentBlock
        content={safeParseContactContent(contactSection.contentJson ?? '{}')}
        address={address}
        phone={phone}
        hoursText={hoursText}
        mutedTextClass={theme.mutedTextClass}
      />
    ) : undefined,
    policies: <PoliciesSection />,
  };

  const navLinks = [
    sections.menu ? { label: 'Menu', href: `#${anchors.menu}` } : null,
    sections.photos ? { label: 'Photos', href: `#${anchors.photos}` } : null,
    sections.reviews ? { label: 'Reviews', href: `#${anchors.reviews}` } : null,
    sections.contact ? { label: 'Visit', href: `#${anchors.contact}` } : null,
  ].filter((entry): entry is { label: string; href: string } => Boolean(entry));

  return (
    <>
      <style>{`
        [data-site-embed="true"], [data-site-fullpage="true"] {
          --link-color: var(--bp-primary);
          --link-hover: var(--bp-accent);
        }
        [data-site-embed="true"] a, [data-site-fullpage="true"] a {
          color: var(--link-color);
          transition: color .15s ease;
        }
        [data-site-embed="true"] a:hover, [data-site-fullpage="true"] a:hover {
          color: var(--link-hover);
        }
        [data-site-embed="true"] .brand-btn, [data-site-fullpage="true"] .brand-btn,
        [data-site-embed="true"] button, [data-site-fullpage="true"] button {
          background: var(--bp-primary);
          color: var(--bp-on-primary);
          border-color: var(--bp-border);
        }
        [data-site-embed="true"] .brand-accent, [data-site-fullpage="true"] .brand-accent {
          background: var(--bp-accent);
          color: var(--bp-on-accent);
        }
        [data-site-embed="true"] input, [data-site-fullpage="true"] input,
        [data-site-embed="true"] select, [data-site-fullpage="true"] select,
        [data-site-embed="true"] textarea, [data-site-fullpage="true"] textarea {
          border-color: var(--bp-border);
          background: var(--bp-surface);
          color: var(--bp-text);
        }
        [data-site-embed="true"] :focus-visible, [data-site-fullpage="true"] :focus-visible {
          outline: 2px solid var(--bp-accent);
          outline-offset: 2px;
        }
        body:has([data-site-embed="true"]) [data-app-chrome="true"],
        body:has([data-site-fullpage="true"]) [data-app-chrome="true"] { display: none; }
        body:has([data-site-embed="true"]) hr,
        body:has([data-site-fullpage="true"]) hr { display: none; }
        body:has([data-site-embed="true"]) [data-app-main="true"],
        body:has([data-site-fullpage="true"]) [data-app-main="true"] { max-width: 100%; padding: 0; }
      `}</style>

      <div
        data-site-embed={embedMode ? 'true' : undefined}
        data-site-fullpage={fullPage ? 'true' : undefined}
        className={`mx-auto flex w-full flex-col ${densityClass} ${layoutFrameClass} bg-[var(--bp-bg)] px-4 py-10 text-[var(--bp-text)] sm:px-6 lg:px-8 ${bodyFontClass}`}
        style={{
          ['--bp-primary' as string]: brandPack.palette.primary,
          ['--bp-accent' as string]: brandPack.palette.accent,
          ['--bp-bg' as string]: brandPack.palette.background,
          ['--bp-surface' as string]: brandPack.palette.surface,
          ['--bp-text' as string]: brandPack.palette.text,
          ['--bp-muted' as string]: brandPack.palette.muted,
          ['--bp-border' as string]: brandPack.palette.border,
          ['--bp-on-primary' as string]: onPrimary,
          ['--bp-on-accent' as string]: onAccent,
          ['--bp-radius-button' as string]: brandPack.style.button === 'pill' ? '999px' : brandPack.style.button === 'square' ? '4px' : '12px',
          ['--brand-primary' as string]: brandPack.palette.primary,
          ['--brand-secondary' as string]: brandPack.palette.secondary,
          ['--brand-accent' as string]: brandPack.palette.accent,
          ['--brand-bg' as string]: brandPack.palette.background,
          ['--brand-surface' as string]: brandPack.palette.surface,
          ['--brand-text' as string]: brandPack.palette.text,
          ['--brand-muted' as string]: brandPack.palette.muted,
          ['--brand-border' as string]: brandPack.palette.border,
          ['--bp-font-heading' as string]: headingFontClass,
          ['--bp-font-body' as string]: bodyFontClass,
        }}
      >
        {canEdit && editorHref && !embedMode && (
          <div className="mx-auto mb-2 w-full max-w-6xl text-right">
            <a href={editorHref} className="inline-flex rounded-md border border-[var(--bp-border)] bg-[var(--bp-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--bp-text)] hover:opacity-90">
              Edit site
            </a>
          </div>
        )}
        <div className={headingFontClass}>
          <Layout
            title={businessTitle}
            mutedTextClass={theme.mutedTextClass}
            cardClass={theme.cardClass}
            heroCtaHref={heroHref}
            ctaLabel={ctaLabel}
            sections={sections}
            navLinks={navLinks}
            anchors={anchors}
            surfaceClass={surfaceClass}
            typographyScaleClass={typographyScaleClass}
          />
        </div>
      </div>
    </>
  );
}
