import type { AboutContent } from '@/lib/section-content';

export function AboutContentBlock({ content, mutedTextClass }: { content: AboutContent; mutedTextClass: string }) {
  return (
    <>
      <h2 className="text-2xl font-semibold">{content.title || 'About'}</h2>
      <p className={`mt-3 text-sm ${mutedTextClass}`}>{content.body || content.text}</p>
      {content.bullets.length > 0 && (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {content.bullets.map((bullet, i) => (
            <li key={`${bullet}-${i}`} className={`text-sm ${mutedTextClass}`}>
              • {bullet}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
