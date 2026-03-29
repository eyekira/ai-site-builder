import { type AboutContent } from '@/lib/section-content';

type AboutSectionProps = {
  content: AboutContent;
  cardClassName?: string;
  mutedTextClassName?: string;
  bulletClassName?: string;
};

export function AboutSection({ content, cardClassName, mutedTextClassName, bulletClassName }: AboutSectionProps) {
  return (
    <section className={`rounded-3xl p-6 shadow-sm ${cardClassName ?? 'border border-zinc-200 bg-white'}`}>
      <h2 className="text-2xl font-semibold text-zinc-900">{content.title || 'About'}</h2>
      <p className={`mt-3 text-sm ${mutedTextClassName ?? 'text-zinc-600'}`}>{content.body || content.text}</p>
      {content.bullets.length > 0 && (
        <ul className="mt-4 grid gap-2 text-sm text-zinc-700 sm:grid-cols-2">
          {content.bullets.map((bulletText, index) => (
            <li key={`about-bullet-${index}`} className="flex items-start gap-2">
              <span className={`mt-1 h-2 w-2 rounded-full ${bulletClassName ?? 'bg-amber-500'}`} />
              <span>{bulletText}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
