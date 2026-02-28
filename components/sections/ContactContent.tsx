import type { ContactContent } from '@/lib/section-content';

export function ContactContentBlock({
  content,
  address,
  phone,
  hoursText,
  buttonClassName,
  mutedTextClass,
}: {
  content: ContactContent;
  address: string | null;
  phone: string | null;
  hoursText: string | null;
  buttonClassName: string;
  mutedTextClass: string;
}) {
  const actionHref = content.website || (phone ? `tel:${phone.replace(/[^0-9+]/g, '')}` : '#');

  return (
    <>
      <h2 className="text-2xl font-semibold">{content.title || 'Visit us'}</h2>
      {content.body && <p className={`mt-2 text-sm ${mutedTextClass}`}>{content.body}</p>}
      <div className={`mt-4 space-y-1.5 text-sm ${mutedTextClass}`}>
        {address && <p>{address}</p>}
        {phone && <p>{phone}</p>}
        {hoursText && <p>{hoursText}</p>}
      </div>
      <a href={actionHref} className={`mt-5 inline-flex rounded-full px-4 py-2 text-sm font-semibold ${buttonClassName}`}>
        {content.ctaLabel || 'Contact'}
      </a>
    </>
  );
}
