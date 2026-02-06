'use server';

import { SectionType, SiteStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';

export type EditorState = {
  error: string | null;
  success: string | null;
};

export const initialEditorState: EditorState = {
  error: null,
  success: null,
};

export async function updateDraftSite(
  slug: string,
  _prevState: EditorState,
  formData: FormData,
): Promise<EditorState> {
  const title = String(formData.get('title') ?? '').trim();
  const aboutText = String(formData.get('aboutText') ?? '').trim();

  if (!title) {
    return { error: 'Title is required.', success: null };
  }

  const site = await prisma.site.findUnique({
    where: { slug },
    include: {
      sections: {
        where: { type: SectionType.ABOUT },
        take: 1,
      },
    },
  });

  if (!site) {
    return { error: 'Site not found.', success: null };
  }

  if (site.status !== SiteStatus.DRAFT) {
    return { error: 'Only draft sites can be edited.', success: null };
  }

  const aboutSection = site.sections[0];

  if (!aboutSection) {
    return { error: 'About section is missing.', success: null };
  }

  await prisma.$transaction([
    prisma.site.update({
      where: { id: site.id },
      data: { title },
    }),
    prisma.section.update({
      where: { id: aboutSection.id },
      data: {
        contentJson: JSON.stringify({ body: aboutText }),
      },
    }),
  ]);

  revalidatePath(`/editor/${slug}`);
  revalidatePath(`/s/${slug}`);

  return { error: null, success: 'Saved successfully.' };
}
