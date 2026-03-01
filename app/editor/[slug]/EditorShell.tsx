'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { addSection, reorderSections, updateSection, updateLayout, updateCulturalStyle, updateBrandCustomization, importMenuFromMenuPhotos } from './actions';
import {
  parseAboutContent,
  parseContactContent,
  parseGalleryContent,
  parseHeroContent,
  parseMenuContent,
  parsePhotosContent,
  parseReviewsContent,
  type SectionType,
} from '@/lib/section-content';
import { LAYOUT_KEYS } from '@/lib/themes/schema';
import { parseBrandPack } from '@/lib/brandpack/parse';
import { CulturalThumbnail } from '@/components/cultural/CulturalThumbnail';
import { LayoutThumbnail } from '@/components/cultural/LayoutThumbnail';
import { CULTURAL_STYLES } from '@/lib/cultural-style/styles';
import type { BrandPack, FontKey } from '@/lib/brandpack/types';

type EditorSection = {
  id: number;
  type: SectionType;
  order: number;
  contentJson: string;
};

type EditorAsset = {
  id: number;
  kind: string;
  source: string;
  ref: string;
  width: number | null;
  height: number | null;
};

type EditorPhoto = {
  id: number;
  source: 'google' | 'upload' | 'ai';
  url: string;
  category: 'exterior' | 'interior' | 'food' | 'menu' | 'drink' | 'people' | 'other';
  confidence: number;
  tagsJson: string | null;
  sortOrder: number;
  isHero: boolean;
  isDeleted: boolean;
};

type EditorShellProps = {
  siteId: number;
  slug: string;
  siteStatus: 'DRAFT' | 'PUBLISHED';
  layoutKey: string | null;
  culturalStyleKey: string | null;
  brandPackJson: string | null;
  isLoggedIn: boolean;
  isSubscribed: boolean;
  customDomain: string | null;
  sections: EditorSection[];
  assets: EditorAsset[];
  photos: EditorPhoto[];
};

type SaveState = 'idle' | 'saving' | 'saved' | 'error';
type PublishState = 'idle' | 'publishing' | 'success' | 'error';

const FONT_OPTIONS: FontKey[] = [
  'inter',
  'playfair_display',
  'manrope',
  'nunito',
  'dm_sans',
  'lora',
  'poppins',
  'merriweather',
  'space_grotesk',
];
const RADIUS_OPTIONS: BrandPack['style']['radius'][] = ['soft', 'rounded', 'sharp'];
const SHADOW_OPTIONS: BrandPack['style']['shadow'][] = ['none', 'soft', 'elevated'];
const DENSITY_OPTIONS: BrandPack['style']['density'][] = ['airy', 'balanced', 'dense'];
const BUTTON_OPTIONS: BrandPack['style']['button'][] = ['pill', 'rounded', 'square'];
const IMAGE_OPTIONS: BrandPack['style']['image'][] = ['natural', 'vibrant', 'editorial'];

const LAYOUT_LABELS: Record<string, string> = {
  luxury: 'Luxury Layout',
  modern_casual: 'Modern Casual Layout',
  cozy_local: 'Cozy Local Layout',
  minimal_contemporary: 'Minimal Contemporary Layout',
  menu_first: 'Menu First Layout',
};

const CULTURAL_STYLE_DESCRIPTORS: Record<string, string> = {
  japanese_minimal: 'Hairline divider · outline CTA · minimal pattern',
  korean_modern: 'Pill CTAs · subtle grid · soft cards',
  chinese_contemporary: 'Stamp divider · tile pattern · rounded CTA',
  mediterranean_coastal: 'Wave pattern · patterned divider · outline pill',
  latin_street: 'Stamp pattern · bold pill CTA · energetic divider',
  american_classic: 'Linen pattern · hairline divider · balanced CTA',
  indian_spice_house: 'Patterned divider · tiled texture · rounded CTA',
  middle_eastern_modern: 'Geometric pattern · patterned divider · outline CTA',
  french_atelier: 'Linen texture · hairline divider · sharp CTA',
  italian_warm_modern: 'Linen texture · hairline divider · soft rounded CTA',
};

type PaletteOption = {
  key: string;
  label: string;
  primary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
};

const PALETTE_OPTIONS: PaletteOption[] = [
  { key: 'ivory-noir', label: 'Ivory Noir', primary: '#1F2937', accent: '#D4AF37', background: '#FFFDF7', surface: '#FFFFFF', text: '#111827', muted: '#6B7280', border: '#E5E7EB' },
  { key: 'mint-fresh', label: 'Mint Fresh', primary: '#0EA5E9', accent: '#22C55E', background: '#F5FBFF', surface: '#FFFFFF', text: '#0F172A', muted: '#475569', border: '#CBD5E1' },
  { key: 'warm-bakery', label: 'Warm Bakery', primary: '#B45309', accent: '#EC4899', background: '#FFFBF5', surface: '#FFFFFF', text: '#3F3F46', muted: '#71717A', border: '#FDE68A' },
  { key: 'tokyo-night', label: 'Tokyo Night', primary: '#7C2D12', accent: '#F97316', background: '#111827', surface: '#1F2937', text: '#F9FAFB', muted: '#D1D5DB', border: '#374151' },
];

const BRAND_PRESETS: Record<
  'luxury' | 'casual' | 'bakery' | 'asian' | 'bar',
  {
    primary: string;
    accent: string;
    background?: string;
    surface?: string;
    text?: string;
    muted?: string;
    border?: string;
    headingFontKey: FontKey;
    bodyFontKey: FontKey;
    radius: BrandPack['style']['radius'];
    shadow: BrandPack['style']['shadow'];
    density: BrandPack['style']['density'];
    button: BrandPack['style']['button'];
    image: BrandPack['style']['image'];
  }
> = {
  luxury: {
    primary: '#1F2937', accent: '#D4AF37', headingFontKey: 'playfair_display', bodyFontKey: 'inter', radius: 'sharp', shadow: 'elevated', density: 'airy', button: 'rounded', image: 'editorial',
  },
  casual: {
    primary: '#0EA5E9', accent: '#22C55E', headingFontKey: 'manrope', bodyFontKey: 'dm_sans', radius: 'rounded', shadow: 'soft', density: 'dense', button: 'square', image: 'vibrant',
  },
  bakery: {
    primary: '#B45309', accent: '#EC4899', headingFontKey: 'lora', bodyFontKey: 'nunito', radius: 'soft', shadow: 'soft', density: 'balanced', button: 'pill', image: 'natural',
  },
  asian: {
    primary: '#7C2D12', accent: '#F97316', headingFontKey: 'playfair_display', bodyFontKey: 'inter', radius: 'rounded', shadow: 'elevated', density: 'balanced', button: 'rounded', image: 'editorial',
  },
  bar: {
    primary: '#111827', accent: '#8B5CF6', headingFontKey: 'manrope', bodyFontKey: 'dm_sans', radius: 'sharp', shadow: 'elevated', density: 'dense', button: 'square', image: 'vibrant',
  },
};

function sectionTitle(section: EditorSection): string {
  if (section.type === 'HERO') {
    return parseHeroContent(section.contentJson).headline;
  }

  if (section.type === 'ABOUT') {
    const content = parseAboutContent(section.contentJson);
    return content.title || content.body || content.text;
  }

  if (section.type === 'CONTACT') {
    const content = parseContactContent(section.contentJson);
    return content.title || content.body || content.address || 'Contact details';
  }

  if (section.type === 'PHOTOS') {
    return 'Photos';
  }

  if (section.type === 'MENU') {
    return parseMenuContent(section.contentJson).title;
  }

  if (section.type === 'GALLERY') {
    return parseGalleryContent(section.contentJson).title;
  }

  if (section.type === 'REVIEWS') {
    return parseReviewsContent(section.contentJson).title;
  }

  return section.type;
}

function normalizeSectionContent(section: EditorSection, rawJson: string): string {
  if (section.type === 'HERO') {
    return JSON.stringify(parseHeroContent(rawJson));
  }

  if (section.type === 'ABOUT') {
    return JSON.stringify(parseAboutContent(rawJson));
  }

  if (section.type === 'CONTACT') {
    return JSON.stringify(parseContactContent(rawJson));
  }

  if (section.type === 'PHOTOS') {
    return JSON.stringify(parsePhotosContent(rawJson));
  }

  if (section.type === 'MENU') {
    return JSON.stringify(parseMenuContent(rawJson));
  }

  if (section.type === 'GALLERY') {
    return JSON.stringify(parseGalleryContent(rawJson));
  }

  if (section.type === 'REVIEWS') {
    return JSON.stringify(parseReviewsContent(rawJson));
  }

  return rawJson;
}

export default function EditorShell({
  siteId,
  slug,
  siteStatus,
  layoutKey,
  culturalStyleKey,
  brandPackJson,
  isLoggedIn,
  isSubscribed,
  customDomain,
  sections,
  assets,
  photos,
}: EditorShellProps) {
  const router = useRouter();
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(sections[0]?.id ?? null);
  const [draftsBySection, setDraftsBySection] = useState<Record<number, string>>({});
  const [lastSavedBySection, setLastSavedBySection] = useState<Record<number, string>>(() =>
    Object.fromEntries(sections.map((section) => [section.id, normalizeSectionContent(section, section.contentJson)])),
  );
  const [previewKey, setPreviewKey] = useState(0);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [publishState, setPublishState] = useState<PublishState>('idle');
  const [publishMessage, setPublishMessage] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<'DRAFT' | 'PUBLISHED'>(siteStatus);
  const [hasSubscription, setHasSubscription] = useState(isSubscribed);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeState, setUpgradeState] = useState<'idle' | 'subscribing' | 'error'>('idle');
  const [upgradeMessage, setUpgradeMessage] = useState<string | null>(null);
  const [currentLayout, setCurrentLayout] = useState<string | null>(layoutKey ?? 'minimal_contemporary');
  const [currentCulturalStyle, setCurrentCulturalStyle] = useState<string>(culturalStyleKey ?? 'american_classic');
  const [layoutState, setLayoutState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [layoutMessage, setLayoutMessage] = useState<string | null>(null);

  const initialBrandPack = parseBrandPack(brandPackJson);
  const [primaryColor, setPrimaryColor] = useState(initialBrandPack.palette.primary);
  const [accentColor, setAccentColor] = useState(initialBrandPack.palette.accent);
  const [backgroundColor, setBackgroundColor] = useState(initialBrandPack.palette.background);
  const [surfaceColor, setSurfaceColor] = useState(initialBrandPack.palette.surface);
  const [textColor, setTextColor] = useState(initialBrandPack.palette.text);
  const [mutedColor, setMutedColor] = useState(initialBrandPack.palette.muted);
  const [borderColor, setBorderColor] = useState(initialBrandPack.palette.border);
  const [paletteKey, setPaletteKey] = useState<string>('custom');
  const [headingFontKey, setHeadingFontKey] = useState<FontKey>(initialBrandPack.typography.headingFontKey);
  const [bodyFontKey, setBodyFontKey] = useState<FontKey>(initialBrandPack.typography.bodyFontKey);
  const [radiusStyle, setRadiusStyle] = useState<BrandPack['style']['radius']>(initialBrandPack.style.radius);
  const [shadowStyle, setShadowStyle] = useState<BrandPack['style']['shadow']>(initialBrandPack.style.shadow);
  const [densityStyle, setDensityStyle] = useState<BrandPack['style']['density']>(initialBrandPack.style.density);
  const [buttonStyle, setButtonStyle] = useState<BrandPack['style']['button']>(initialBrandPack.style.button);
  const [imageStyle, setImageStyle] = useState<BrandPack['style']['image']>(initialBrandPack.style.image);
  const [brandState, setBrandState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [brandMessage, setBrandMessage] = useState<string | null>(null);

  const [domainInput, setDomainInput] = useState(customDomain ?? '');
  const [domainState, setDomainState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [domainMessage, setDomainMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [groupOpen, setGroupOpen] = useState<{ layout: boolean; cultural: boolean; brand: boolean }>({
    layout: true,
    cultural: false,
    brand: false,
  });

  const orderedSections = useMemo(
    () => [...sections].sort((a, b) => (a.order === b.order ? a.id - b.id : a.order - b.order)),
    [sections],
  );
  const selectedSection = orderedSections.find((section) => section.id === selectedSectionId) ?? null;
  const hasAboutSection = orderedSections.some((section) => section.type === 'ABOUT');
  const hasContactSection = orderedSections.some((section) => section.type === 'CONTACT');

  useEffect(() => {
    if (!selectedSectionId && orderedSections[0]) {
      setSelectedSectionId(orderedSections[0].id);
      return;
    }

    if (selectedSectionId && !orderedSections.some((section) => section.id === selectedSectionId)) {
      setSelectedSectionId(orderedSections[0]?.id ?? null);
    }
  }, [orderedSections, selectedSectionId]);

  useEffect(() => {
    if (saveState !== 'saved') {
      return;
    }

    const timer = window.setTimeout(() => {
      setSaveState('idle');
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [saveState]);

  useEffect(() => {
    setPreviewKey(Date.now());
  }, []);


  const currentDraft = selectedSection
    ? draftsBySection[selectedSection.id] ?? normalizeSectionContent(selectedSection, selectedSection.contentJson)
    : '';

  const hasUnsavedChanges = selectedSection
    ? currentDraft !==
      (lastSavedBySection[selectedSection.id] ?? normalizeSectionContent(selectedSection, selectedSection.contentJson))
    : false;

  const hasAnyUnsavedChanges = orderedSections.some((section) => {
    const draft = draftsBySection[section.id] ?? normalizeSectionContent(section, section.contentJson);
    const saved = lastSavedBySection[section.id] ?? normalizeSectionContent(section, section.contentJson);

    return draft !== saved;
  });

  const updateDraft = (sectionId: number, nextJson: string) => {
    setDraftsBySection((prev) => ({ ...prev, [sectionId]: nextJson }));
    setSaveState('idle');
    setSaveError(null);
  };

  const onSave = () => {
    if (!selectedSection) {
      return;
    }

    setSaveState('saving');
    setSaveError(null);

    startTransition(async () => {
      try {
        const normalized = normalizeSectionContent(selectedSection, currentDraft);
        await updateSection(siteId, selectedSection.id, normalized);
        setDraftsBySection((prev) => ({ ...prev, [selectedSection.id]: normalized }));
        setLastSavedBySection((prev) => ({ ...prev, [selectedSection.id]: normalized }));
        setPreviewKey(Date.now());
        setSaveState('saved');
        router.refresh();
      } catch {
        setSaveState('error');
        setSaveError('Could not save changes. Please try again.');
      }
    });
  };

  const moveSelected = (direction: 'up' | 'down') => {
    if (!selectedSection) {
      return;
    }

    const index = orderedSections.findIndex((section) => section.id === selectedSection.id);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (index < 0 || targetIndex < 0 || targetIndex >= orderedSections.length) {
      return;
    }

    const reordered = [...orderedSections];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    startTransition(async () => {
      await reorderSections(
        siteId,
        reordered.map((section) => section.id),
      );
      setSaveState('idle');
      setSaveError(null);
      setPreviewKey(Date.now());
      router.refresh();
    });
  };

  const onAddSection = (type: SectionType) => {
    startTransition(async () => {
      await addSection(siteId, type);
      setSaveState('idle');
      setSaveError(null);
      setPreviewKey(Date.now());
      router.refresh();
    });
  };

  const publishSite = async () => {
    setPublishState('publishing');
    setPublishMessage(null);

    try {
      const response = await fetch('/api/sites/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId }),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string; slug?: string } | null;

      if (!response.ok) {
        const errorCode = payload?.error;
        const message =
          errorCode === 'UNAUTHORIZED'
            ? 'Please log in to publish.'
            : errorCode === 'SUBSCRIPTION_REQUIRED'
              ? 'Subscription required to publish.'
              : errorCode === 'SITE_UNCLAIMED'
                ? 'This draft must be claimed before publishing.'
                : errorCode === 'FORBIDDEN'
                  ? 'You are not allowed to publish this site.'
                  : response.status === 401
                    ? 'Please log in to publish.'
                    : response.status === 402
                      ? 'Subscription required to publish.'
                      : response.status === 403
                        ? 'You are not allowed to publish this site.'
                        : 'Unable to publish right now.';
        const messageWithCode = errorCode ? `${message} (${errorCode})` : message;
        throw new Error(messageWithCode);
      }

      setCurrentStatus('PUBLISHED');
      setPublishState('success');
      setPublishMessage(`Published! Your site is live at /${payload?.slug ?? slug}.`);
      router.push(`/${payload?.slug ?? slug}`);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not publish.';
      setPublishState('error');
      setPublishMessage(message);
    }
  };

  const onPublish = () => {
    if (currentStatus === 'PUBLISHED') {
      return;
    }

    if (!isLoggedIn) {
      router.push(`/login?returnTo=${encodeURIComponent(`/editor/${slug}`)}`);
      return;
    }

    if (!hasSubscription) {
      setShowUpgradeModal(true);
      return;
    }

    startTransition(async () => {
      await publishSite();
    });
  };

  const onSubscribeAndPublish = () => {
    setUpgradeState('subscribing');
    setUpgradeMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch('/api/billing/subscribe', { method: 'POST' });
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;

        if (!response.ok) {
          const errorCode = payload?.error ?? 'SUBSCRIPTION_FAILED';
          throw new Error(`Subscription failed. (${errorCode})`);
        }

        setHasSubscription(true);
        setShowUpgradeModal(false);
        setUpgradeState('idle');
        await publishSite();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to subscribe.';
        setUpgradeState('error');
        setUpgradeMessage(message);
      }
    });
  };

  const closeUpgradeModal = () => {
    setShowUpgradeModal(false);
    setUpgradeState('idle');
    setUpgradeMessage(null);
  };

  const onSaveDomain = () => {
    if (!hasSubscription) {
      return;
    }

    setDomainState('saving');
    setDomainMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch('/api/sites/custom-domain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ siteId, domain: domainInput }),
        });

        const payload = (await response.json().catch(() => null)) as { error?: string; customDomain?: string } | null;

        if (!response.ok) {
          const message =
            payload?.error ??
            (response.status === 401
              ? 'Please log in to save a domain.'
              : response.status === 402
                ? 'Subscription required to use a custom domain.'
                : 'Unable to save domain.');
          throw new Error(message);
        }

        setDomainInput(payload?.customDomain ?? '');
        setDomainState('saved');
        setDomainMessage(payload?.customDomain ? 'Custom domain saved.' : 'Custom domain cleared.');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not save domain.';
        setDomainState('error');
        setDomainMessage(message);
      }
    });
  };

  const onLayoutChange = (nextLayout: string) => {
    if (nextLayout === currentLayout) {
      return;
    }

    setCurrentLayout(nextLayout);
    setLayoutState('saving');
    setLayoutMessage(null);

    startTransition(async () => {
      try {
        await updateLayout(siteId, nextLayout);
        setLayoutState('saved');
        setPreviewKey(Date.now());
        router.refresh();
      } catch {
        setLayoutState('error');
        setLayoutMessage('Unable to update layout. Please try again.');
      }
    });
  };

  const onCulturalStyleChange = (nextStyle: string) => {
    if (nextStyle === currentCulturalStyle) return;

    setCurrentCulturalStyle(nextStyle);
    setLayoutState('saving');
    setLayoutMessage(null);

    startTransition(async () => {
      try {
        await updateCulturalStyle(siteId, nextStyle);
        setLayoutState('saved');
        setPreviewKey(Date.now());
        router.refresh();
      } catch {
        setLayoutState('error');
        setLayoutMessage('Unable to update cultural style.');
      }
    });
  };

  const onSaveBrand = () => {
    setBrandState('saving');
    setBrandMessage(null);

    startTransition(async () => {
      try {
        await updateBrandCustomization(siteId, {
          primary: primaryColor,
          accent: accentColor,
          background: backgroundColor,
          surface: surfaceColor,
          text: textColor,
          muted: mutedColor,
          border: borderColor,
          headingFontKey,
          bodyFontKey,
          radius: radiusStyle,
          shadow: shadowStyle,
          density: densityStyle,
          button: buttonStyle,
          image: imageStyle,
        });
        setBrandState('saved');
        setPreviewKey(Date.now());
        router.refresh();
      } catch {
        setBrandState('error');
        setBrandMessage('Unable to save brand customization.');
      }
    });
  };

  const onAutoImportMenu = async (): Promise<string> => {
    const json = await importMenuFromMenuPhotos(siteId);
    return json;
  };

  const onApplyBrandPreset = (presetKey: keyof typeof BRAND_PRESETS) => {
    const preset = BRAND_PRESETS[presetKey];
    setPrimaryColor(preset.primary);
    setAccentColor(preset.accent);
    if (preset.background) setBackgroundColor(preset.background);
    if (preset.surface) setSurfaceColor(preset.surface);
    if (preset.text) setTextColor(preset.text);
    if (preset.muted) setMutedColor(preset.muted);
    if (preset.border) setBorderColor(preset.border);
    setHeadingFontKey(preset.headingFontKey);
    setBodyFontKey(preset.bodyFontKey);
    setRadiusStyle(preset.radius);
    setShadowStyle(preset.shadow);
    setDensityStyle(preset.density);
    setButtonStyle(preset.button);
    setImageStyle(preset.image);
  };

  const onSelectPalette = (nextKey: string) => {
    setPaletteKey(nextKey);
    const selected = PALETTE_OPTIONS.find((p) => p.key === nextKey);
    if (!selected) return;
    setPrimaryColor(selected.primary);
    setAccentColor(selected.accent);
    setBackgroundColor(selected.background);
    setSurfaceColor(selected.surface);
    setTextColor(selected.text);
    setMutedColor(selected.muted);
    setBorderColor(selected.border);
  };

  return (
    <div className="relative left-1/2 grid h-screen w-screen -translate-x-1/2 grid-cols-[280px_1fr_340px] bg-zinc-100">
      <aside className="border-r border-zinc-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-600">Sections</h2>
        </div>

        <div className="space-y-2">
          {orderedSections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setSelectedSectionId(section.id)}
              className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                selectedSectionId === section.id
                  ? 'border-zinc-900 bg-zinc-900 text-white'
                  : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400'
              }`}
            >
              <p className="text-xs uppercase tracking-wide opacity-70">{section.type}</p>
              <p className="truncate text-sm font-medium">{sectionTitle(section)}</p>
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Add section</p>
          <div className="grid grid-cols-3 gap-2">
            {(['HERO', 'ABOUT', 'CONTACT', 'PHOTOS', 'MENU', 'GALLERY', 'REVIEWS'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onAddSection(type)}
                disabled={isPending}
                className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {type}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3">
            <button
              type="button"
              onClick={() => moveSelected('up')}
              disabled={isPending}
              className="rounded-md border border-zinc-300 bg-white px-2 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Move up
            </button>
            <button
              type="button"
              onClick={() => moveSelected('down')}
              disabled={isPending}
              className="rounded-md border border-zinc-300 bg-white px-2 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Move down
            </button>
          </div>
        </div>
      </aside>

      <main className="border-r border-zinc-200 bg-zinc-50 p-4">
        <div className="mb-3 flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Preview viewport</p>
          <div className="flex items-center gap-2">
            {(['desktop', 'tablet', 'mobile'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPreviewViewport(mode)}
                className={`rounded-md px-2 py-1 text-xs font-medium ${
                  previewViewport === mode ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
        <div className="flex min-h-[75vh] flex-1 items-start justify-center overflow-auto rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
          <div
            className={`h-full transition-all ${
              previewViewport === 'desktop'
                ? 'w-full max-w-[1200px]'
                : previewViewport === 'tablet'
                  ? 'w-full max-w-[820px]'
                  : 'w-full max-w-[430px]'
            }`}
          >
            <iframe
              key={previewKey}
              src={`/editor/${slug}/preview?embed=1&v=${previewKey}`}
              title="Live preview"
              className="h-[85vh] w-full rounded-xl"
            />
          </div>
        </div>
      </main>

      <aside className="bg-white p-4">
        <div className="mb-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-700">
          <button type="button" onClick={() => setGroupOpen((s) => ({ ...s, layout: !s.layout }))} className="flex w-full items-center justify-between text-left font-semibold uppercase tracking-wide text-zinc-500">
            <span>Layout (Structure)</span>
            <span>{groupOpen.layout ? '−' : '+'}</span>
          </button>
          {groupOpen.layout && <div className="mt-3 grid grid-cols-2 gap-2">
            {LAYOUT_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => onLayoutChange(key)}
                className={`rounded-md border px-2 py-2 text-left text-[11px] font-medium transition ${
                  currentLayout === key
                    ? 'border-zinc-900 bg-white text-zinc-900'
                    : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400'
                }`}
              >
                <div className="mb-2 flex justify-center"><LayoutThumbnail layoutKey={key} /></div>
                {LAYOUT_LABELS[key] ?? key}
              </button>
            ))}
          </div>}

          <button type="button" onClick={() => setGroupOpen((s) => ({ ...s, cultural: !s.cultural }))} className="mt-3 flex w-full items-center justify-between text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            <span>Cultural Style (Overlay)</span>
            <span>{groupOpen.cultural ? '−' : '+'}</span>
          </button>
          {groupOpen.cultural && <div className="mt-2 grid grid-cols-2 gap-2">
            {CULTURAL_STYLES.map((style) => {
              const selected = currentCulturalStyle === style.key;
              return (
                <button
                  key={style.key}
                  type="button"
                  onClick={() => onCulturalStyleChange(style.key)}
                  className={`group rounded-md border p-2 text-left text-[11px] transition hover:-translate-y-0.5 hover:shadow-sm ${
                    selected
                      ? 'ring-2 ring-zinc-400 border-zinc-900 bg-zinc-50 text-zinc-900'
                      : 'border-zinc-200 bg-white text-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="shrink-0">
                      <CulturalThumbnail styleKey={style.key} isSelected={selected} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold leading-tight">{style.label}</p>
                      <p className="mt-0.5 line-clamp-2 text-[10px] text-zinc-500">{CULTURAL_STYLE_DESCRIPTORS[style.key] ?? 'Visual overlay style'}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>}

          {layoutState === 'saving' && <p className="mt-2 text-[11px] text-zinc-500">Saving layout…</p>}
          {layoutState === 'saved' && <p className="mt-2 text-[11px] text-emerald-600">Layout saved.</p>}
          {layoutState === 'error' && <p className="mt-2 text-[11px] text-red-600">{layoutMessage}</p>}

          <button type="button" onClick={() => setGroupOpen((s) => ({ ...s, brand: !s.brand }))} className="mt-4 flex w-full items-center justify-between border-t border-zinc-200 pt-3 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            <span>Brand (Colors + Typography)</span>
            <span>{groupOpen.brand ? '−' : '+'}</span>
          </button>
          {groupOpen.brand && <div className="mt-2">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Brand Customization</p>
            <div className="mb-2 grid grid-cols-3 gap-1">
              {(Object.keys(BRAND_PRESETS) as Array<keyof typeof BRAND_PRESETS>).map((presetKey) => (
                <button
                  key={presetKey}
                  type="button"
                  onClick={() => onApplyBrandPreset(presetKey)}
                  className="rounded border border-zinc-200 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-700 hover:border-zinc-400"
                >
                  {presetKey}
                </button>
              ))}
            </div>
            <label className="text-[11px] text-zinc-600">
              Palette
              <select value={paletteKey} onChange={(e) => onSelectPalette(e.target.value)} className="mt-1 w-full rounded border border-zinc-200 bg-white px-2 py-1.5 text-xs">
                <option value="custom">Custom</option>
                {PALETTE_OPTIONS.map((palette) => (
                  <option key={palette.key} value={palette.key}>{palette.label}</option>
                ))}
              </select>
            </label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[primaryColor, accentColor, backgroundColor].map((color, idx) => (
                <div key={`${color}-${idx}`} className="rounded border border-zinc-200 p-1 text-[10px]">
                  <div className="h-5 rounded" style={{ backgroundColor: color }} />
                  <p className="mt-1 text-center text-zinc-500">{idx === 0 ? 'Primary' : idx === 1 ? 'Accent' : 'Background'}</p>
                </div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2">
              <label className="text-[11px] text-zinc-600">
                Heading font
                <select value={headingFontKey} onChange={(e) => setHeadingFontKey(e.target.value as FontKey)} className="mt-1 w-full rounded border border-zinc-200 bg-white px-2 py-1.5 text-xs">
                  {FONT_OPTIONS.map((font) => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </label>
              <label className="text-[11px] text-zinc-600">
                Body font
                <select value={bodyFontKey} onChange={(e) => setBodyFontKey(e.target.value as FontKey)} className="mt-1 w-full rounded border border-zinc-200 bg-white px-2 py-1.5 text-xs">
                  {FONT_OPTIONS.map((font) => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-[11px] text-zinc-600">
                  Radius
                  <select value={radiusStyle} onChange={(e) => setRadiusStyle(e.target.value as BrandPack['style']['radius'])} className="mt-1 w-full rounded border border-zinc-200 bg-white px-2 py-1.5 text-xs">
                    {RADIUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label className="text-[11px] text-zinc-600">
                  Shadow
                  <select value={shadowStyle} onChange={(e) => setShadowStyle(e.target.value as BrandPack['style']['shadow'])} className="mt-1 w-full rounded border border-zinc-200 bg-white px-2 py-1.5 text-xs">
                    {SHADOW_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label className="text-[11px] text-zinc-600">
                  Density
                  <select value={densityStyle} onChange={(e) => setDensityStyle(e.target.value as BrandPack['style']['density'])} className="mt-1 w-full rounded border border-zinc-200 bg-white px-2 py-1.5 text-xs">
                    {DENSITY_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label className="text-[11px] text-zinc-600">
                  Button
                  <select value={buttonStyle} onChange={(e) => setButtonStyle(e.target.value as BrandPack['style']['button'])} className="mt-1 w-full rounded border border-zinc-200 bg-white px-2 py-1.5 text-xs">
                    {BUTTON_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="text-[11px] text-zinc-600">
                Image tone
                <select value={imageStyle} onChange={(e) => setImageStyle(e.target.value as BrandPack['style']['image'])} className="mt-1 w-full rounded border border-zinc-200 bg-white px-2 py-1.5 text-xs">
                  {IMAGE_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>
            <button type="button" onClick={onSaveBrand} className="mt-3 w-full rounded-md bg-zinc-900 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white">
              Save brand
            </button>
            {brandState === 'saving' && <p className="mt-2 text-xs text-zinc-500">Saving brand…</p>}
            {brandState === 'saved' && <p className="mt-2 text-xs text-emerald-600">Brand saved.</p>}
            {brandState === 'error' && <p className="mt-2 text-xs text-red-600">{brandMessage}</p>}
          </div>}
        </div>
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <p className="font-semibold uppercase tracking-wide text-amber-700">Publishing</p>
          {currentStatus === 'PUBLISHED' ? (
            <p className="mt-1">This site is already live.</p>
          ) : hasSubscription ? (
            <p className="mt-1">You are ready to publish.</p>
          ) : isLoggedIn ? (
            <p className="mt-1">Subscribe to publish your site.</p>
          ) : (
            <p className="mt-1">Log in and subscribe to publish your site.</p>
          )}
          <button
            type="button"
            onClick={onPublish}
            disabled={publishState === 'publishing' || currentStatus === 'PUBLISHED'}
            className={`mt-3 w-full rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
              hasSubscription && currentStatus !== 'PUBLISHED'
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-amber-200 text-amber-900 opacity-70'
            }`}
          >
            {currentStatus === 'PUBLISHED'
              ? 'Published'
              : publishState === 'publishing'
                ? 'Publishing…'
                : !isLoggedIn
                  ? 'Login to publish'
                  : hasSubscription
                    ? 'Publish'
                    : 'Subscribe to publish'}
          </button>
          {publishMessage && (
            <p
              className={`mt-2 text-xs ${
                publishState === 'error' ? 'text-red-600' : publishState === 'success' ? 'text-emerald-700' : ''
              }`}
            >
              {publishMessage}
            </p>
          )}
        </div>

        <div className="mb-4 rounded-lg border border-zinc-200 bg-white p-3 text-xs text-zinc-700">
          <p className="font-semibold uppercase tracking-wide text-zinc-500">Custom domain</p>
          {hasSubscription ? (
            <p className="mt-1 text-xs text-zinc-600">Connect a domain to show this published site on your own URL.</p>
          ) : (
            <p className="mt-1 text-xs text-amber-700">Subscribe to connect a custom domain.</p>
          )}
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={domainInput}
              onChange={(event) => setDomainInput(event.target.value)}
              placeholder="yourdomain.com"
              disabled={!hasSubscription || domainState === 'saving'}
              className="flex-1 rounded-md border border-zinc-200 px-2 py-1.5 text-xs text-zinc-700 focus:border-zinc-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-zinc-100"
            />
            <button
              type="button"
              onClick={onSaveDomain}
              disabled={!hasSubscription || domainState === 'saving'}
              className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              {domainState === 'saving' ? 'Saving…' : 'Save'}
            </button>
          </div>
          {domainMessage && (
            <p
              className={`mt-2 text-xs ${
                domainState === 'error' ? 'text-red-600' : domainState === 'saved' ? 'text-emerald-600' : ''
              }`}
            >
              {domainMessage}
            </p>
          )}
        </div>

        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-zinc-600">
            Inspector
            {hasAnyUnsavedChanges && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">Unsaved</span>}
          </h2>
          <button
            type="button"
            onClick={onSave}
            disabled={!selectedSection || saveState === 'saving' || isPending || !hasUnsavedChanges}
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saveState === 'saving' ? 'Saving…' : 'Save'}
          </button>
        </div>

        {saveState === 'saved' && <p className="mb-3 text-xs font-medium text-emerald-600">Saved</p>}
        {saveState === 'error' && <p className="mb-3 text-xs font-medium text-red-600">{saveError ?? 'Error while saving'}</p>}
        {hasUnsavedChanges && <p className="mb-3 text-xs font-medium text-amber-600">Unsaved changes</p>}

        {!selectedSection && (
          <div className="space-y-3 text-sm text-zinc-600">
            <p>Select a section to edit.</p>
            {!hasAboutSection && (
              <div className="rounded-md border border-dashed border-zinc-300 p-3">
                <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">ABOUT missing</p>
                <button
                  type="button"
                  onClick={() => onAddSection('ABOUT')}
                  className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700"
                >
                  Add ABOUT section
                </button>
              </div>
            )}
            {!hasContactSection && (
              <div className="rounded-md border border-dashed border-zinc-300 p-3">
                <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">CONTACT missing</p>
                <button
                  type="button"
                  onClick={() => onAddSection('CONTACT')}
                  className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700"
                >
                  Add CONTACT section
                </button>
              </div>
            )}
          </div>
        )}

        {selectedSection?.type === 'HERO' && (
          <HeroInspector json={currentDraft} onChange={(next) => updateDraft(selectedSection.id, next)} />
        )}

        {selectedSection?.type === 'ABOUT' && (
          <AboutInspector json={currentDraft} onChange={(next) => updateDraft(selectedSection.id, next)} />
        )}

        {selectedSection?.type === 'CONTACT' && (
          <ContactInspector json={currentDraft} onChange={(next) => updateDraft(selectedSection.id, next)} />
        )}

        {selectedSection?.type === 'PHOTOS' && (
          <PhotosInspector
            siteId={siteId}
            json={currentDraft}
            assets={assets}
            photos={photos}
            onChange={(next) => updateDraft(selectedSection.id, next)}
            onRefresh={() => router.refresh()}
          />
        )}

        {selectedSection?.type === 'MENU' && (
          <MenuInspector
            json={currentDraft}
            onChange={(next) => updateDraft(selectedSection.id, next)}
            onAutoImport={onAutoImportMenu}
          />
        )}

        {selectedSection?.type === 'GALLERY' && (
          <GalleryInspector json={currentDraft} onChange={(next) => updateDraft(selectedSection.id, next)} />
        )}

        {selectedSection?.type === 'REVIEWS' && (
          <ReviewsInspector json={currentDraft} onChange={(next) => updateDraft(selectedSection.id, next)} />
        )}

        {selectedSection && (!hasAboutSection || !hasContactSection) && (
          <div className="mt-4 space-y-2">
            {!hasAboutSection && (
              <div className="rounded-md border border-dashed border-zinc-300 p-3">
                <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">ABOUT missing</p>
                <button
                  type="button"
                  onClick={() => onAddSection('ABOUT')}
                  className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700"
                >
                  Add ABOUT section
                </button>
              </div>
            )}
            {!hasContactSection && (
              <div className="rounded-md border border-dashed border-zinc-300 p-3">
                <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">CONTACT missing</p>
                <button
                  type="button"
                  onClick={() => onAddSection('CONTACT')}
                  className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700"
                >
                  Add CONTACT section
                </button>
              </div>
            )}
          </div>
        )}
      </aside>
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900">Subscribe to publish</h3>
                <p className="mt-1 text-sm text-zinc-600">
                  Publishing is available on the Builder MVP plan. Subscribe to publish this site now.
                </p>
              </div>
              <button
                type="button"
                onClick={closeUpgradeModal}
                className="rounded-full border border-zinc-200 px-2 py-1 text-xs font-semibold text-zinc-500 hover:text-zinc-800"
              >
                Close
              </button>
            </div>
            {upgradeMessage && (
              <p className="mt-3 text-sm text-red-600">{upgradeMessage}</p>
            )}
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeUpgradeModal}
                className="rounded-md border border-zinc-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-600 hover:border-zinc-300"
              >
                Not now
              </button>
              <button
                type="button"
                onClick={onSubscribeAndPublish}
                disabled={upgradeState === 'subscribing'}
                className="rounded-md bg-amber-500 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-amber-200"
              >
                {upgradeState === 'subscribing' ? 'Subscribing…' : 'Subscribe & Publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HeroInspector({ json, onChange }: { json: string; onChange: (json: string) => void }) {
  const value = parseHeroContent(json);

  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
        Headline
        <input
          value={value.headline}
          onChange={(event) => onChange(JSON.stringify({ ...value, headline: event.target.value }))}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </label>

      <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
        Subheadline
        <textarea
          value={value.subheadline}
          onChange={(event) => onChange(JSON.stringify({ ...value, subheadline: event.target.value }))}
          rows={3}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </label>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">CTA buttons</p>
          <button
            type="button"
            onClick={() => onChange(JSON.stringify({ ...value, ctas: [...value.ctas, { label: 'Learn more', href: '#' }] }))}
            className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700"
          >
            + Add CTA
          </button>
        </div>
        {value.ctas.map((cta, index) => (
          <div key={`${index}-${cta.label}`} className="rounded-md border border-zinc-200 p-2">
            <input
              value={cta.label}
              onChange={(event) => {
                const next = [...value.ctas];
                next[index] = { ...cta, label: event.target.value };
                onChange(JSON.stringify({ ...value, ctas: next }));
              }}
              placeholder="Label"
              className="mb-2 w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
            />
            <input
              value={cta.href}
              onChange={(event) => {
                const next = [...value.ctas];
                next[index] = { ...cta, href: event.target.value };
                onChange(JSON.stringify({ ...value, ctas: next }));
              }}
              placeholder="https://..."
              className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
            />
            {(!cta.href || cta.href === '#') && <p className="mt-1 text-xs text-amber-600">Add a real link</p>}
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (value.ctas.length <= 1) {
                    return;
                  }

                  const next = value.ctas.filter((_, ctaIndex) => ctaIndex !== index);
                  onChange(JSON.stringify({ ...value, ctas: next }));
                }}
                disabled={value.ctas.length <= 1}
                className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutInspector({ json, onChange }: { json: string; onChange: (json: string) => void }) {
  const value = parseAboutContent(json);

  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
        Title
        <input
          value={value.title}
          onChange={(event) => onChange(JSON.stringify({ ...value, title: event.target.value }))}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
        Body
        <textarea
          value={value.body}
          onChange={(event) =>
            onChange(JSON.stringify({ ...value, body: event.target.value, text: event.target.value }))
          }
          rows={6}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </label>
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Bullets</p>
        {value.bullets.map((bulletText, index) => (
          <div key={`bullet-${index}`} className="flex items-center gap-2">
            <input
              value={bulletText}
              onChange={(event) => {
                const nextBullets = [...value.bullets];
                nextBullets[index] = event.target.value;
                onChange(JSON.stringify({ ...value, bullets: nextBullets }));
              }}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => {
                if (value.bullets.length <= 1) {
                  return;
                }
                const nextBullets = value.bullets.filter((_, bulletIndex) => bulletIndex !== index);
                onChange(JSON.stringify({ ...value, bullets: nextBullets }));
              }}
              disabled={value.bullets.length <= 1}
              className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange(JSON.stringify({ ...value, bullets: [...value.bullets, 'New bullet'] }))}
          className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700"
        >
          + Add bullet
        </button>
      </div>
      <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
        Legacy text
        <textarea
          value={value.text}
          onChange={(event) => onChange(JSON.stringify({ ...value, text: event.target.value }))}
          rows={3}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </label>
    </div>
  );
}

function ContactInspector({ json, onChange }: { json: string; onChange: (json: string) => void }) {
  const value = parseContactContent(json);

  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
        Title
        <input
          value={value.title}
          onChange={(event) => onChange(JSON.stringify({ ...value, title: event.target.value }))}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
        Body
        <textarea
          value={value.body}
          onChange={(event) => onChange(JSON.stringify({ ...value, body: event.target.value }))}
          rows={4}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
        CTA label
        <input
          value={value.ctaLabel}
          onChange={(event) => onChange(JSON.stringify({ ...value, ctaLabel: event.target.value }))}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </label>
      <div className="pt-2">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Contact details</p>
        {(['address', 'phone', 'website', 'hours'] as const).map((field) => (
          <label key={field} className="mt-2 block text-xs font-medium uppercase tracking-wide text-zinc-500">
            {field}
            <input
              value={value[field] ?? ''}
              onChange={(event) => onChange(JSON.stringify({ ...value, [field]: event.target.value || null }))}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
        ))}
      </div>
    </div>
  );
}

function PhotosInspector({
  siteId,
  json,
  assets,
  photos,
  onChange,
  onRefresh,
}: {
  siteId: number;
  json: string;
  assets: EditorAsset[];
  photos: EditorPhoto[];
  onChange: (json: string) => void;
  onRefresh: () => void;
}) {
  const value = parsePhotosContent(json);
  const selectedIds = value.assetIds;
  const [activeCategory, setActiveCategory] = useState<EditorPhoto['category']>('exterior');
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const categories: EditorPhoto['category'][] = ['exterior', 'interior', 'food', 'menu', 'drink', 'people', 'other'];

  const photosByCategory = categories.reduce((acc, category) => {
    acc[category] = photos.filter((photo) => photo.category === category && !photo.isDeleted);
    return acc;
  }, {} as Record<EditorPhoto['category'], EditorPhoto[]>);

  const activePhotos = photosByCategory[activeCategory] ?? [];

  const toggleAsset = (assetId: number) => {
    const isSelected = selectedIds.includes(assetId);
    const nextIds = isSelected ? selectedIds.filter((id) => id !== assetId) : [...selectedIds, assetId];
    onChange(JSON.stringify({ ...value, assetIds: nextIds }));
  };

  const movePhoto = async (photoId: number, direction: 'up' | 'down') => {
    const visible = activePhotos.filter((p) => !p.isDeleted);
    const index = visible.findIndex((p) => p.id === photoId);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (index < 0 || targetIndex < 0 || targetIndex >= visible.length) {
      return;
    }

    const reordered = [...visible];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    await fetch('/api/sites/photos/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteId, category: activeCategory, photoIds: reordered.map((entry) => entry.id) }),
    });

    onRefresh();
  };

  const setHero = async (photoId: number, next: boolean) => {
    await fetch(`/api/sites/photos/${photoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isHero: next }),
    });
    onRefresh();
  };

  const moveCategory = async (photoId: number, category: EditorPhoto['category']) => {
    await fetch(`/api/sites/photos/${photoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category }),
    });
    onRefresh();
  };

  const softDelete = async (photoId: number) => {
    await fetch(`/api/sites/photos/${photoId}`, { method: 'DELETE' });
    onRefresh();
  };

  const restore = async (photoId: number) => {
    await fetch(`/api/sites/photos/${photoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restore: true }),
    });
    onRefresh();
  };

  const onUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploadState('uploading');
    setUploadMessage(null);

    try {
      const initResponse = await fetch('/api/sites/photos/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId, fileName: file.name, contentType: file.type || 'application/octet-stream' }),
      });
      const initPayload = (await initResponse.json()) as
        | { mode: 'local' }
        | { mode: 's3'; uploadUrl: string; publicUrl: string };

      if (!initResponse.ok) {
        throw new Error('Upload initialization failed.');
      }

      if (initPayload.mode === 'local') {
        const form = new FormData();
        form.set('siteId', String(siteId));
        form.set('file', file);
        const localRes = await fetch('/api/sites/photos/upload-local', {
          method: 'POST',
          body: form,
        });
        if (!localRes.ok) {
          throw new Error('Local upload failed.');
        }
      } else {
        const putRes = await fetch(initPayload.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
          body: file,
        });
        if (!putRes.ok) {
          throw new Error('Signed upload failed.');
        }

        const completeRes = await fetch('/api/sites/photos/upload-complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ siteId, url: initPayload.publicUrl, fileName: file.name }),
        });

        if (!completeRes.ok) {
          throw new Error('Upload finalization failed.');
        }
      }

      setUploadState('idle');
      onRefresh();
      event.target.value = '';
    } catch (error) {
      setUploadState('error');
      setUploadMessage(error instanceof Error ? error.message : 'Upload failed.');
    }
  };

  const selectedAssets = selectedIds
    .map((assetId) => assets.find((asset) => asset.id === assetId))
    .filter((assetItem): assetItem is EditorAsset => Boolean(assetItem));

  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
        Upload photo
        <input type="file" accept="image/*" onChange={onUpload} className="mt-1 block w-full text-xs" />
      </label>
      {uploadState === 'uploading' && <p className="text-xs text-zinc-500">Uploading…</p>}
      {uploadState === 'error' && <p className="text-xs text-red-600">{uploadMessage}</p>}

      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Category tabs</p>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={`rounded-md border px-2 py-1 text-[10px] ${
              activeCategory === category ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-300 bg-white'
            }`}
          >
            {category} ({photosByCategory[category]?.length ?? 0})
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {activePhotos.map((photo) => (
          <div key={photo.id} className={`rounded-md border p-2 ${photo.isDeleted ? 'opacity-50' : ''}`}>
            <img src={photo.url} alt="Managed photo" className="h-24 w-full rounded object-cover" />
            <p className="mt-1 text-[10px] text-zinc-600">{photo.source} · confidence {photo.confidence.toFixed(2)}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              <button type="button" onClick={() => movePhoto(photo.id, 'up')} className="rounded border px-2 py-1 text-[10px]">Up</button>
              <button type="button" onClick={() => movePhoto(photo.id, 'down')} className="rounded border px-2 py-1 text-[10px]">Down</button>
              <button type="button" onClick={() => setHero(photo.id, !photo.isHero)} className="rounded border px-2 py-1 text-[10px]">
                {photo.isHero ? 'Unset hero' : 'Set hero'}
              </button>
              <select
                value={photo.category}
                onChange={(event) => {
                  const nextCategory = event.target.value as EditorPhoto['category'];
                  void moveCategory(photo.id, nextCategory);
                }}
                className="rounded border px-1 py-1 text-[10px]"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {photo.isDeleted ? (
                <button type="button" onClick={() => restore(photo.id)} className="rounded border px-2 py-1 text-[10px]">Restore</button>
              ) : (
                <button type="button" onClick={() => softDelete(photo.id)} className="rounded border px-2 py-1 text-[10px]">Delete</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="pt-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Selected photos (legacy section mapping)</p>
      {selectedAssets.map((assetItem) => (
        <div key={assetItem.id} className="flex items-center justify-between gap-2 rounded-md border border-zinc-200 p-2">
          <div className="flex items-center gap-2">
            <img src={`/api/places/photo?ref=${encodeURIComponent(assetItem.ref)}&maxwidth=200`} alt="Selected photo" className="h-12 w-16 rounded object-cover" />
            <p className="text-xs font-medium text-zinc-700">Photo {assetItem.id}</p>
          </div>
          <button type="button" onClick={() => toggleAsset(assetItem.id)} className="rounded-md border border-zinc-300 px-2 py-1 text-[10px] font-medium text-zinc-700">Remove</button>
        </div>
      ))}
      <div className="grid grid-cols-2 gap-2">
        {assets.map((assetItem) => {
          const isSelected = selectedIds.includes(assetItem.id);
          return (
            <button key={assetItem.id} type="button" onClick={() => toggleAsset(assetItem.id)} className={`rounded-md border p-2 text-left text-[10px] ${isSelected ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 bg-white text-zinc-700'}`}>
              <img src={`/api/places/photo?ref=${encodeURIComponent(assetItem.ref)}&maxwidth=200`} alt="Available photo" className="mb-2 h-20 w-full rounded object-cover" />
              <span>Photo {assetItem.id}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MenuInspector({
  json,
  onChange,
  onAutoImport,
}: {
  json: string;
  onChange: (json: string) => void;
  onAutoImport: () => Promise<string>;
}) {
  const value = parseMenuContent(json);
  const [importState, setImportState] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [importMessage, setImportMessage] = useState<string | null>(null);

  const handleImport = async () => {
    setImportState('loading');
    setImportMessage(null);
    try {
      const importedJson = await onAutoImport();
      onChange(importedJson);
      setImportState('success');
      setImportMessage('Menu imported from menu photos.');
    } catch (error) {
      setImportState('error');
      setImportMessage(error instanceof Error ? error.message : 'Menu import failed.');
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
        Title
        <input
          value={value.title}
          onChange={(event) => onChange(JSON.stringify({ ...value, title: event.target.value }))}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </label>

      <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
        <p className="text-[11px] text-zinc-600">Auto menu import</p>
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={handleImport}
            disabled={importState === 'loading'}
            className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 disabled:opacity-50"
          >
            {importState === 'loading' ? 'Importing…' : 'Import from menu photos'}
          </button>
          <span className="text-[11px] text-zinc-500">Upload/tag photos as category &quot;menu&quot; in Photos section first.</span>
        </div>
        {importMessage && (
          <p className={`mt-2 text-xs ${importState === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>{importMessage}</p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Menu items</p>
          <button
            type="button"
            onClick={() =>
              onChange(
                JSON.stringify({
                  ...value,
                  items: [...value.items, { name: 'New item', description: '', price: '' }],
                }),
              )
            }
            className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700"
          >
            + Add item
          </button>
        </div>
        {value.items.map((item, index) => (
          <div key={`${item.name}-${index}`} className="space-y-2 rounded-md border border-zinc-200 p-3">
            <input
              value={item.name}
              onChange={(event) => {
                const next = [...value.items];
                next[index] = { ...item, name: event.target.value };
                onChange(JSON.stringify({ ...value, items: next }));
              }}
              placeholder="Item name"
              className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
            />
            <textarea
              value={item.description}
              onChange={(event) => {
                const next = [...value.items];
                next[index] = { ...item, description: event.target.value };
                onChange(JSON.stringify({ ...value, items: next }));
              }}
              placeholder="Short description"
              rows={3}
              className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
            />
            <input
              value={item.price}
              onChange={(event) => {
                const next = [...value.items];
                next[index] = { ...item, price: event.target.value };
                onChange(JSON.stringify({ ...value, items: next }));
              }}
              placeholder="$"
              className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (value.items.length <= 1) {
                    return;
                  }

                  onChange(JSON.stringify({ ...value, items: value.items.filter((_, itemIndex) => itemIndex !== index) }));
                }}
                disabled={value.items.length <= 1}
                className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GalleryInspector({ json, onChange }: { json: string; onChange: (json: string) => void }) {
  const value = parseGalleryContent(json);

  return (
    <div className="space-y-4">
      <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
        Title
        <input
          value={value.title}
          onChange={(event) => onChange(JSON.stringify({ ...value, title: event.target.value }))}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </label>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Gallery images</p>
          <button
            type="button"
            onClick={() =>
              onChange(
                JSON.stringify({
                  ...value,
                  items: [...value.items, { url: 'https://placehold.co/600x400/png', caption: '' }],
                }),
              )
            }
            className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700"
          >
            + Add image
          </button>
        </div>
        {value.items.map((item, index) => (
          <div key={`${item.url}-${index}`} className="space-y-2 rounded-md border border-zinc-200 p-3">
            <input
              value={item.url}
              onChange={(event) => {
                const next = [...value.items];
                next[index] = { ...item, url: event.target.value };
                onChange(JSON.stringify({ ...value, items: next }));
              }}
              placeholder="https://..."
              className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
            />
            <input
              value={item.caption}
              onChange={(event) => {
                const next = [...value.items];
                next[index] = { ...item, caption: event.target.value };
                onChange(JSON.stringify({ ...value, items: next }));
              }}
              placeholder="Caption"
              className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (value.items.length <= 1) {
                    return;
                  }

                  onChange(JSON.stringify({ ...value, items: value.items.filter((_, itemIndex) => itemIndex !== index) }));
                }}
                disabled={value.items.length <= 1}
                className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewsInspector({ json, onChange }: { json: string; onChange: (json: string) => void }) {
  const value = parseReviewsContent(json);

  return (
    <div className="space-y-4">
      <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
        Title
        <input
          value={value.title}
          onChange={(event) => onChange(JSON.stringify({ ...value, title: event.target.value }))}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </label>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Reviews</p>
          <button
            type="button"
            onClick={() =>
              onChange(
                JSON.stringify({
                  ...value,
                  items: [...value.items, { author: 'Customer', quote: '', rating: 5 }],
                }),
              )
            }
            className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700"
          >
            + Add review
          </button>
        </div>
        {value.items.map((item, index) => (
          <div key={`${item.author}-${index}`} className="space-y-2 rounded-md border border-zinc-200 p-3">
            <input
              value={item.author}
              onChange={(event) => {
                const next = [...value.items];
                next[index] = { ...item, author: event.target.value };
                onChange(JSON.stringify({ ...value, items: next }));
              }}
              placeholder="Author"
              className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
            />
            <textarea
              value={item.quote}
              onChange={(event) => {
                const next = [...value.items];
                next[index] = { ...item, quote: event.target.value };
                onChange(JSON.stringify({ ...value, items: next }));
              }}
              placeholder="Quote"
              rows={3}
              className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
            />
            <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
              Rating
              <select
                value={item.rating}
                onChange={(event) => {
                  const next = [...value.items];
                  next[index] = { ...item, rating: Number(event.target.value) };
                  onChange(JSON.stringify({ ...value, items: next }));
                }}
                className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
              >
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating} stars
                  </option>
                ))}
              </select>
            </label>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (value.items.length <= 1) {
                    return;
                  }

                  onChange(JSON.stringify({ ...value, items: value.items.filter((_, itemIndex) => itemIndex !== index) }));
                }}
                disabled={value.items.length <= 1}
                className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
