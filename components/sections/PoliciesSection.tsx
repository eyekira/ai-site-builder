export function PoliciesSection() {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-800">Policies</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Reservation cancellation window may apply.</li>
        <li>Please notify us about allergies in advance.</li>
        <li>Late arrivals may reduce seating time on busy nights.</li>
      </ul>
    </section>
  );
}
