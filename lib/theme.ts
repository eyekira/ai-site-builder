export type ThemeName = 'classic' | 'sunset' | 'ocean';

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
    name: 'classic',
    label: 'Classic',
    heroClass: 'bg-zinc-900 text-white',
    cardClass: 'bg-white',
    buttonClass: 'bg-white text-zinc-900',
    sectionBackgroundClass: 'bg-zinc-100',
    mutedTextClass: 'text-zinc-500',
    accentTextClass: 'text-zinc-900',
    previewClass: 'bg-zinc-900',
  },
  {
    name: 'sunset',
    label: 'Sunset',
    heroClass: 'bg-gradient-to-r from-rose-500 via-orange-400 to-amber-300 text-white',
    cardClass: 'bg-white/95 border border-rose-100',
    buttonClass: 'bg-white text-rose-700',
    sectionBackgroundClass: 'bg-rose-50',
    mutedTextClass: 'text-rose-700',
    accentTextClass: 'text-rose-700',
    previewClass: 'bg-gradient-to-r from-rose-500 to-amber-400',
  },
  {
    name: 'ocean',
    label: 'Ocean',
    heroClass: 'bg-gradient-to-r from-sky-600 to-cyan-500 text-white',
    cardClass: 'bg-white border border-cyan-100',
    buttonClass: 'bg-white text-sky-700',
    sectionBackgroundClass: 'bg-sky-50',
    mutedTextClass: 'text-sky-700',
    accentTextClass: 'text-sky-700',
    previewClass: 'bg-gradient-to-r from-sky-500 to-cyan-400',
  },
];

const DEFAULT_THEME = THEME_OPTIONS[0];

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
    if (parsed?.name && isThemeName(parsed.name)) {
      return getThemeByName(parsed.name);
    }
  } catch {
    return DEFAULT_THEME;
  }

  return DEFAULT_THEME;
}

export function serializeTheme(name: ThemeName): string {
  return JSON.stringify({ name });
}
