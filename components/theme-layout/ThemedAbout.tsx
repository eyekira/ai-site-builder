import type { AboutContent } from '@/lib/section-content';
import type { ThemeLayoutConfig } from '@/lib/themes/schema';

export function ThemedAbout({ content, layout, cardClass, mutedTextClass }: { content: AboutContent; layout: ThemeLayoutConfig; cardClass: string; mutedTextClass: string }) {
  if (layout.sections.about.layout === 'two_column') {
    return (
      <section className={`rounded-3xl p-6 shadow-sm ${cardClass}`}>
        <div className="grid gap-6 md:grid-cols-2">
          <h2 className="text-2xl font-semibold">{content.title || 'About'}</h2>
          <p className={`text-sm ${mutedTextClass}`}>{content.body || content.text}</p>
        </div>
      </section>
    );
  }

  return (
    <section className={`rounded-3xl p-6 shadow-sm ${cardClass}`}>
      <h2 className="text-2xl font-semibold">{content.title || 'About'}</h2>
      <p className={`mt-3 text-sm ${mutedTextClass}`}>{content.body || content.text}</p>
    </section>
  );
}
