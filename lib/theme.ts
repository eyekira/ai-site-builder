export type ThemeName = 'bistro_core' | 'cafe_warm' | 'express_fresh';

export type ThemeConfig = {
  name: ThemeName;
  label: string;
  heroClass: string;
  cardClass: string;
  buttonClass: string;
  sectionBackgroundClass: string;
  mutedTextClass: string;
  accentTextClass: string;
  previewClass: string;
};

export const THEME_OPTIONS: ThemeConfig[] = [
  {
    name: 'bistro_core',
    label: 'Bistro Core',
    heroClass: 'bg-zinc-900 text-white',
    cardClass: 'bg-white border border-zinc-200',
    buttonClass: 'bg-white text-zinc-900',
    sectionBackgroundClass: 'bg-zinc-100',
    mutedTextClass: 'text-zinc-600',
    accentTextClass: 'text-zinc-900',
    previewClass: 'bg-zinc-900',
  },
  {
    name: 'cafe_warm',
    label: 'Cafe Warm',
    heroClass: 'bg-gradient-to-r from-amber-700 via-orange-500 to-rose-400 text-white',
    cardClass: 'bg-white/95 border border-amber-100',
    buttonClass: 'bg-white text-amber-800',
    sectionBackgroundClass: 'bg-amber-50',
    mutedTextClass: 'text-amber-800',
    accentTextClass: 'text-orange-700',
    previewClass: 'bg-gradient-to-r from-amber-700 to-rose-400',
  },
  {
    name: 'express_fresh',
    label: 'Express Fresh',
    heroClass: 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white',
    cardClass: 'bg-white border border-emerald-100',
    buttonClass: 'bg-white text-emerald-700',
    sectionBackgroundClass: 'bg-emerald-50',
    mutedTextClass: 'text-emerald-800',
    accentTextClass: 'text-emerald-700',
    previewClass: 'bg-gradient-to-r from-emerald-600 to-cyan-500',
  },
];

const DEFAULT_THEME = THEME_OPTIONS[0];

const LEGACY_THEME_ALIAS: Record<string, ThemeName> = {
  classic: 'bistro_core',
  sunset: 'cafe_warm',
  ocean: 'express_fresh',
};

export function isThemeName(value: string): value is ThemeName {
  return THEME_OPTIONS.some((theme) => theme.name === value);
}

export function getThemeByName(name: ThemeName): ThemeConfig {
  return THEME_OPTIONS.find((theme) => theme.name === name) ?? DEFAULT_THEME;
}

export function parseThemeJson(themeJson: string | null | undefined): ThemeConfig {
  if (!themeJson) {
    return DEFAULT_THEME;
  }

  try {
    const parsed = JSON.parse(themeJson) as { name?: string } | null;
    const name = parsed?.name;

    if (name && isThemeName(name)) {
      return getThemeByName(name);
    }

    if (name && LEGACY_THEME_ALIAS[name]) {
      return getThemeByName(LEGACY_THEME_ALIAS[name]);
    }
  } catch {
    return DEFAULT_THEME;
  }

  return DEFAULT_THEME;
}

export function serializeTheme(name: ThemeName): string {
  return JSON.stringify({ name });
}

export function extractTemplateMetadata(themeJson: string | null | undefined): {
  templateKey: string | null;
  templateConfidence: number | null;
} {
  if (!themeJson) {
    return { templateKey: null, templateConfidence: null };
  }

  try {
    const parsed = JSON.parse(themeJson) as { templateKey?: string; templateConfidence?: number } | null;
    return {
      templateKey: typeof parsed?.templateKey === 'string' ? parsed.templateKey : null,
      templateConfidence: typeof parsed?.templateConfidence === 'number' ? parsed.templateConfidence : null,
    };
  } catch {
    return { templateKey: null, templateConfidence: null };
  }
}
