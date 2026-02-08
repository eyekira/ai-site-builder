import { prisma } from '@/lib/prisma';

export type SiteForRender = {
  id: number;
  slug: string;
  title: string;
  businessTitle: string | null;
  status: string;
  formattedAddress: string | null;
  phone: string | null;
  hoursJson: string | null;
  lat: number | null;
  lng: number | null;
  sections: Array<{
    id: number;
    type: string;
    contentJson: string;
  }>;
  assets: Array<{
    id: number;
    ref: string;
  }>;
  place: {
    address: string | null;
    phone: string | null;
    hoursJson: string | null;
    lat: number | null;
    lng: number | null;
  } | null;
};

export async function getSiteForRender(slug: string): Promise<SiteForRender | null> {
  return prisma.site.findUnique({
    where: { slug },
    include: {
      sections: {
        orderBy: { order: 'asc' },
      },
      assets: {
        orderBy: { id: 'asc' },
        select: {
          id: true,
          ref: true,
        },
      },
      place: {
        select: {
          address: true,
          phone: true,
          hoursJson: true,
          lat: true,
          lng: true,
        },
      },
    },
  });
}
