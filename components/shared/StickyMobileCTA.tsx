export function StickyMobileCTA({ label, href }: { label: string; href: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 p-3 backdrop-blur md:hidden">
      <a href={href} className="block rounded-xl bg-zinc-900 px-4 py-3 text-center text-sm font-semibold text-white">
        {label}
      </a>
    </div>
  );
}
