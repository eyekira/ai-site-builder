import Link from 'next/link';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id ? Number(session.user.id) : null;
  const buttonBase =
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

  if (!userId) {
    redirect('/login?returnTo=/dashboard');
  }

  const sites = await prisma.site.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
    },
  });

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">View the sites for {session?.user?.name ?? 'your account'}.</p>
        </div>
        <Link
          href="/"
          className={cn(buttonBase, 'h-10 px-4 py-2 border bg-background hover:bg-accent hover:text-accent-foreground')}
        >
          Create new site
        </Link>
      </div>

      {sites.length === 0 ? (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>No saved sites yet</CardTitle>
            <CardDescription>Search for a place on the home page to create a new site.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/" className={cn(buttonBase, 'h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90')}>
              Search business
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sites.map((site) => (
            <Card key={site.id} className="rounded-2xl">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">{site.title}</CardTitle>
                  <CardDescription>/{site.slug}</CardDescription>
                </div>
                <Badge variant={site.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                  {site.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Link
                  href={`/editor/${site.slug}`}
                  className={cn(buttonBase, 'h-9 rounded-xl px-3 bg-primary text-primary-foreground hover:bg-primary/90')}
                >
                  {site.status === 'PUBLISHED' ? 'Edit & republish' : 'Open editor'}
                </Link>
                {site.status === 'PUBLISHED' ? (
                  <Link
                    href={`/s/${site.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(buttonBase, 'h-9 rounded-xl px-3 border bg-background hover:bg-accent hover:text-accent-foreground')}
                  >
                    View site
                  </Link>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
