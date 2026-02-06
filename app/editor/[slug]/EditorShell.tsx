'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { addSection, reorderSections, updateSection } from './actions';
import { parseAboutContent, parseContactContent, parseHeroContent, type SectionType } from '@/lib/section-content';

type EditorSection = {
  id: number;
  type: SectionType;
  order: number;
  contentJson: string;
};

type EditorShellProps = {
  siteId: number;
  slug: string;
  sections: EditorSection[];
};

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

function sectionTitle(section: EditorSection): string {
  if (section.type === 'HERO') {
    return parseHeroContent(section.contentJson).headline;
  }

  if (section.type === 'ABOUT') {
    return parseAboutContent(section.contentJson).text;
  }

  if (section.type === 'CONTACT') {
    return parseContactContent(section.contentJson).address ?? 'Contact details';
  }

  return section.type;
}

function normalizeSectionContent(section: EditorSection, rawJson: string): string {
  if (section.type === 'HERO') {
    return JSON.stringify(parseHeroContent(rawJson));
  }

  if (section.type === 'ABOUT') {
    return JSON.stringify(parseAboutContent(rawJson));
  }

  if (section.type === 'CONTACT') {
    return JSON.stringify(parseContactContent(rawJson));
  }

  return rawJson;
}

export default function EditorShell({ siteId, slug, sections }: EditorShellProps) {
  const router = useRouter();
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(sections[0]?.id ?? null);
  const [draftsBySection, setDraftsBySection] = useState<Record<number, string>>({});
  const [lastSavedBySection, setLastSavedBySection] = useState<Record<number, string>>(() =>
    Object.fromEntries(sections.map((section) => [section.id, normalizeSectionContent(section, section.contentJson)])),
  );
  const [previewKey, setPreviewKey] = useState(Date.now());
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [isPending, startTransition] = useTransition();

  const orderedSections = useMemo(() => [...sections].sort((a, b) => a.order - b.order), [sections]);
  const selectedSection = orderedSections.find((section) => section.id === selectedSectionId) ?? null;

  const currentDraft = selectedSection
    ? draftsBySection[selectedSection.id] ?? normalizeSectionContent(selectedSection, selectedSection.contentJson)
    : '';

  const hasUnsavedChanges = selectedSection
    ? currentDraft !==
      (lastSavedBySection[selectedSection.id] ?? normalizeSectionContent(selectedSection, selectedSection.contentJson))
    : false;

  const updateDraft = (sectionId: number, nextJson: string) => {
    setDraftsBySection((prev) => ({ ...prev, [sectionId]: nextJson }));
    setSaveState('idle');
  };

  const onSave = () => {
    if (!selectedSection) {
      return;
    }

    setSaveState('saving');

    startTransition(async () => {
      try {
        const normalized = normalizeSectionContent(selectedSection, currentDraft);
        await updateSection(siteId, selectedSection.id, normalized);
        setDraftsBySection((prev) => ({ ...prev, [selectedSection.id]: normalized }));
        setLastSavedBySection((prev) => ({ ...prev, [selectedSection.id]: normalized }));
        setPreviewKey(Date.now());
        setSaveState('saved');
        router.refresh();
      } catch {
        setSaveState('error');
      }
    });
  };

  const moveSelected = (direction: 'up' | 'down') => {
    if (!selectedSection) {
      return;
    }

    const index = orderedSections.findIndex((section) => section.id === selectedSection.id);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (index < 0 || targetIndex < 0 || targetIndex >= orderedSections.length) {
      return;
    }

    const reordered = [...orderedSections];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    startTransition(async () => {
      await reorderSections(
        siteId,
        reordered.map((section) => section.id),
      );
      setSaveState('idle');
      setPreviewKey(Date.now());
      router.refresh();
    });
  };

  const onAddSection = (type: 'HERO' | 'ABOUT' | 'CONTACT') => {
    startTransition(async () => {
      await addSection(siteId, type);
      setSaveState('idle');
      setPreviewKey(Date.now());
      router.refresh();
    });
  };

  return (
    <div className="grid h-screen grid-cols-[280px_1fr_340px] overflow-hidden bg-zinc-100">
      <aside className="border-r border-zinc-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-600">Sections</h2>
        </div>

        <div className="space-y-2">
          {orderedSections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setSelectedSectionId(section.id)}
              className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                selectedSectionId === section.id
                  ? 'border-zinc-900 bg-zinc-900 text-white'
                  : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400'
              }`}
            >
              <p className="text-xs uppercase tracking-wide opacity-70">{section.type}</p>
              <p className="truncate text-sm font-medium">{sectionTitle(section)}</p>
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Add section</p>
          <div className="grid grid-cols-3 gap-2">
            {(['HERO', 'ABOUT', 'CONTACT'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onAddSection(type)}
                disabled={isPending}
                className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {type}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3">
            <button
              type="button"
              onClick={() => moveSelected('up')}
              disabled={isPending}
              className="rounded-md border border-zinc-300 bg-white px-2 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Move up
            </button>
            <button
              type="button"
              onClick={() => moveSelected('down')}
              disabled={isPending}
              className="rounded-md border border-zinc-300 bg-white px-2 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Move down
            </button>
          </div>
        </div>
      </aside>

      <main className="border-r border-zinc-200 bg-zinc-50 p-4">
        <div className="h-full rounded-xl border border-zinc-200 bg-white shadow-sm">
          <iframe
            key={previewKey}
            src={`/s/${slug}?previewKey=${previewKey}`}
            title="Live preview"
            className="h-full w-full rounded-xl"
          />
        </div>
      </main>

      <aside className="bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-600">Inspector</h2>
          <button
            type="button"
            onClick={onSave}
            disabled={!selectedSection || saveState === 'saving' || isPending || !hasUnsavedChanges}
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saveState === 'saving' ? 'Saving…' : 'Save'}
          </button>
        </div>

        {hasUnsavedChanges && <p className="mb-3 text-xs font-medium text-amber-600">Unsaved changes</p>}
        {saveState === 'saved' && <p className="mb-3 text-xs font-medium text-emerald-600">Saved</p>}
        {saveState === 'error' && <p className="mb-3 text-xs font-medium text-red-600">Error while saving</p>}

        {!selectedSection && <p className="text-sm text-zinc-500">Select a section to edit.</p>}

        {selectedSection?.type === 'HERO' && (
          <HeroInspector json={currentDraft} onChange={(next) => updateDraft(selectedSection.id, next)} />
        )}

        {selectedSection?.type === 'ABOUT' && (
          <AboutInspector json={currentDraft} onChange={(next) => updateDraft(selectedSection.id, next)} />
        )}

        {selectedSection?.type === 'CONTACT' && (
          <ContactInspector json={currentDraft} onChange={(next) => updateDraft(selectedSection.id, next)} />
        )}

        {selectedSection && !['HERO', 'ABOUT', 'CONTACT'].includes(selectedSection.type) && (
          <p className="text-sm text-zinc-500">Coming soon.</p>
        )}
      </aside>
    </div>
  );
}

function HeroInspector({ json, onChange }: { json: string; onChange: (json: string) => void }) {
  const value = parseHeroContent(json);

  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
        Headline
        <input
          value={value.headline}
          onChange={(event) => onChange(JSON.stringify({ ...value, headline: event.target.value }))}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </label>

      <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
        Subheadline
        <textarea
          value={value.subheadline}
          onChange={(event) => onChange(JSON.stringify({ ...value, subheadline: event.target.value }))}
          rows={3}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </label>

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">CTA buttons</p>
        {value.ctas.map((cta, index) => (
          <div key={`${index}-${cta.label}`} className="rounded-md border border-zinc-200 p-2">
            <input
              value={cta.label}
              onChange={(event) => {
                const next = [...value.ctas];
                next[index] = { ...cta, label: event.target.value };
                onChange(JSON.stringify({ ...value, ctas: next }));
              }}
              placeholder="Label"
              className="mb-2 w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
            />
            <input
              value={cta.href}
              onChange={(event) => {
                const next = [...value.ctas];
                next[index] = { ...cta, href: event.target.value };
                onChange(JSON.stringify({ ...value, ctas: next }));
              }}
              placeholder="https://..."
              className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutInspector({ json, onChange }: { json: string; onChange: (json: string) => void }) {
  const value = parseAboutContent(json);

  return (
    <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
      Text
      <textarea
        value={value.text}
        onChange={(event) => onChange(JSON.stringify({ ...value, text: event.target.value }))}
        rows={8}
        className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
      />
    </label>
  );
}

function ContactInspector({ json, onChange }: { json: string; onChange: (json: string) => void }) {
  const value = parseContactContent(json);

  return (
    <div className="space-y-3">
      {(['address', 'phone', 'website', 'hours'] as const).map((field) => (
        <label key={field} className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
          {field}
          <input
            value={value[field] ?? ''}
            onChange={(event) => onChange(JSON.stringify({ ...value, [field]: event.target.value || null }))}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
      ))}
    </div>
  );
}
