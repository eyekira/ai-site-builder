import { notFound } from 'next/navigation';

import { SiteOnePage } from '@/components/site/site-one-page';
import { prisma } from '@/lib/prisma';

export default async function PublicSitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const site = await prisma.site.findUnique({
    where: { slug },
    include: {
      sections: {
        orderBy: { order: 'asc' },
      },
      assets: {
        orderBy: { id: 'asc' },
      },
      place: true,
    },
  });

  if (!site || site.status !== 'PUBLISHED') {
    notFound();
  }

  return (
    <SiteOnePage
      businessTitle={site.businessTitle ?? site.title}
      address={site.formattedAddress ?? site.place?.address ?? null}
      phone={site.phone ?? site.place?.phone ?? null}
      hoursJson={site.hoursJson ?? site.place?.hoursJson ?? null}
      lat={site.lat ?? site.place?.lat ?? null}
      lng={site.lng ?? site.place?.lng ?? null}
      sections={site.sections}
      assets={site.assets.map((assetItem) => ({
        id: assetItem.id,
        ref: assetItem.ref,
      }))}
    />
  );
}
