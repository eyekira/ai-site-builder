import { type ContactContent } from '@/lib/section-content';

type ContactSectionProps = {
  content: ContactContent;
  address: string | null;
  phone: string | null;
  hoursText: string | null;
  lat: number | null;
  lng: number | null;
};

export function ContactSection({ content, address, phone, hoursText, lat, lng }: ContactSectionProps) {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900">{content.title || 'Contact'}</h2>
          <p className="mt-3 text-sm text-zinc-600">{content.body}</p>
          <div className="mt-4 space-y-2 text-sm text-zinc-700">
            {address && <p>{address}</p>}
            {phone && <p>{phone}</p>}
            {hoursText && <p>{hoursText}</p>}
          </div>
          {content.ctaLabel && (
            <button
              type="button"
              className="mt-5 inline-flex items-center justify-center rounded-full border border-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-900"
            >
              {content.ctaLabel}
            </button>
          )}
        </div>
        {lat !== null && lng !== null && (
          <div className="overflow-hidden rounded-2xl border border-zinc-200">
            <iframe
              title="Map"
              src={`https://www.google.com/maps?q=${lat},${lng}&output=embed`}
              className="h-64 w-full"
              loading="lazy"
            />
          </div>
        )}
      </div>
    </section>
  );
}
