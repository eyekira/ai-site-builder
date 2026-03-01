import { Button } from '@/components/ui/button';

export function StickyMobileCTA({ label, href }: { label: string; href: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--bp-border)] bg-[var(--bp-surface)]/95 p-3 backdrop-blur md:hidden">
      <Button asChild intent="primary" variant="solid" size="md" className="w-full">
        <a href={href}>{label}</a>
      </Button>
    </div>
  );
}
