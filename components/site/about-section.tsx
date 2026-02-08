import { type AboutContent } from '@/lib/section-content';

type AboutSectionProps = {
  content: AboutContent;
};

export function AboutSection({ content }: AboutSectionProps) {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-zinc-900">{content.title || 'About'}</h2>
      <p className="mt-3 text-sm text-zinc-600">{content.body || content.text}</p>
      {content.bullets.length > 0 && (
        <ul className="mt-4 grid gap-2 text-sm text-zinc-700 sm:grid-cols-2">
          {content.bullets.map((bulletText, index) => (
            <li key={`about-bullet-${index}`} className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
              <span>{bulletText}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
