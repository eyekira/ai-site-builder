import { notFound, redirect } from 'next/navigation';

import { prisma } from '@/lib/prisma';

export default async function EditorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const site = await prisma.site.findUnique({
    where: { slug },
    select: { slug: true },
  });

  if (!site) {
    notFound();
  }

  redirect(`/s/${site.slug}`);
}
