import type { ThemeLayoutConfig } from '@/lib/themes/schema';

type Props = {
  title: string;
  mutedTextClass: string;
  cardClass: string;
  previewClass: string;
  layout: ThemeLayoutConfig;
};

export function ThemedNav({ title, mutedTextClass, cardClass, previewClass, layout }: Props) {
  return (
    <header className={`rounded-2xl border px-4 py-3 ${cardClass}`}>
      <div className={`flex items-center gap-4 ${layout.navigation.logoPlacement === 'center' ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${previewClass}`}>
            {title.slice(0, 1).toUpperCase()}
          </div>
          <span className="text-sm font-semibold tracking-wide">{title}</span>
        </div>
        {layout.navigation.showSectionLinks && (
          <nav className={`hidden items-center gap-4 text-xs ${mutedTextClass} md:flex`}>
            {layout.sectionOrder
              .filter((entry) => !['hero', 'policies'].includes(entry))
              .slice(0, 4)
              .map((entry) => (
                <span key={entry}>{entry}</span>
              ))}
          </nav>
        )}
      </div>
    </header>
  );
}
