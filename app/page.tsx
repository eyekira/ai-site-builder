import { Sparkles } from 'lucide-react';

import { PlaceSearch } from '@/app/components/place-search';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 text-center">
      <Badge variant="secondary" className="gap-1 rounded-full px-3 py-1 text-xs">
        <Sparkles className="h-3.5 w-3.5" />
        SaaS MVP UI Foundation
      </Badge>
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Restaurant Finder</h1>
        <p className="text-muted-foreground">Search for a restaurant and use it to build a site right away.</p>
      </div>
      <PlaceSearch />
    </section>
  );
}
