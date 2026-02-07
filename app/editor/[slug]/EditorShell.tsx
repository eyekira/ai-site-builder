'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { addSection, reorderSections, updateSection, updateTheme } from './actions';
import {
  parseAboutContent,
  parseContactContent,
  parseGalleryContent,
  parseHeroContent,
  parseMenuContent,
  parseReviewsContent,
  type SectionType,
} from '@/lib/section-content';
import { THEME_OPTIONS, type ThemeName } from '@/lib/theme';

type EditorSection = {
  id: number;
  type: SectionType;
  order: number;
  contentJson: string;
};

type EditorShellProps = {
  siteId: number;
  slug: string;
  siteStatus: 'DRAFT' | 'PUBLISHED';
  themeName: ThemeName;
  isLoggedIn: boolean;
  isSubscribed: boolean;
  customDomain: string | null;
  sections: EditorSection[];
};

type SaveState = 'idle' | 'saving' | 'saved' | 'error';
type PublishState = 'idle' | 'publishing' | 'success' | 'error';

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

  if (section.type === 'MENU') {
    return parseMenuContent(section.contentJson).title;
  }

  if (section.type === 'GALLERY') {
    return parseGalleryContent(section.contentJson).title;
  }

  if (section.type === 'REVIEWS') {
    return parseReviewsContent(section.contentJson).title;
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

  if (section.type === 'MENU') {
    return JSON.stringify(parseMenuContent(rawJson));
  }

  if (section.type === 'GALLERY') {
    return JSON.stringify(parseGalleryContent(rawJson));
  }

  if (section.type === 'REVIEWS') {
    return JSON.stringify(parseReviewsContent(rawJson));
  }

  return rawJson;
}

export default function EditorShell({
  siteId,
  slug,
  siteStatus,
  themeName,
  isLoggedIn,
  isSubscribed,
  customDomain,
  sections,
}: EditorShellProps) {
  const router = useRouter();
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(sections[0]?.id ?? null);
  const [draftsBySection, setDraftsBySection] = useState<Record<number, string>>({});
  const [lastSavedBySection, setLastSavedBySection] = useState<Record<number, string>>(() =>
    Object.fromEntries(sections.map((section) => [section.id, normalizeSectionContent(section, section.contentJson)])),
  );
  const [previewKey, setPreviewKey] = useState(0);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [publishState, setPublishState] = useState<PublishState>('idle');
  const [publishMessage, setPublishMessage] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<'DRAFT' | 'PUBLISHED'>(siteStatus);
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(themeName);
  const [themeState, setThemeState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [themeMessage, setThemeMessage] = useState<string | null>(null);
  const [domainInput, setDomainInput] = useState(customDomain ?? '');
  const [domainState, setDomainState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [domainMessage, setDomainMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const orderedSections = useMemo(
    () => [...sections].sort((a, b) => (a.order === b.order ? a.id - b.id : a.order - b.order)),
    [sections],
  );
  const selectedSection = orderedSections.find((section) => section.id === selectedSectionId) ?? null;
  const hasAboutSection = orderedSections.some((section) => section.type === 'ABOUT');
  const hasContactSection = orderedSections.some((section) => section.type === 'CONTACT');

  useEffect(() => {
    if (!selectedSectionId && orderedSections[0]) {
      setSelectedSectionId(orderedSections[0].id);
      return;
    }

    if (selectedSectionId && !orderedSections.some((section) => section.id === selectedSectionId)) {
      setSelectedSectionId(orderedSections[0]?.id ?? null);
    }
  }, [orderedSections, selectedSectionId]);

  useEffect(() => {
    if (saveState !== 'saved') {
      return;
    }

    const timer = window.setTimeout(() => {
      setSaveState('idle');
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [saveState]);

  useEffect(() => {
    setPreviewKey(Date.now());
  }, []);

  useEffect(() => {
    if (themeState !== 'saved') {
      return;
    }

    const timer = window.setTimeout(() => {
      setThemeState('idle');
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [themeState]);

  const currentDraft = selectedSection
    ? draftsBySection[selectedSection.id] ?? normalizeSectionContent(selectedSection, selectedSection.contentJson)
    : '';

  const hasUnsavedChanges = selectedSection
    ? currentDraft !==
      (lastSavedBySection[selectedSection.id] ?? normalizeSectionContent(selectedSection, selectedSection.contentJson))
    : false;

  const hasAnyUnsavedChanges = orderedSections.some((section) => {
    const draft = draftsBySection[section.id] ?? normalizeSectionContent(section, section.contentJson);
    const saved = lastSavedBySection[section.id] ?? normalizeSectionContent(section, section.contentJson);

    return draft !== saved;
  });

  const updateDraft = (sectionId: number, nextJson: string) => {
    setDraftsBySection((prev) => ({ ...prev, [sectionId]: nextJson }));
    setSaveState('idle');
    setSaveError(null);
  };

  const onSave = () => {
    if (!selectedSection) {
      return;
    }

    setSaveState('saving');
    setSaveError(null);

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
        setSaveError('Could not save changes. Please try again.');
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
      setSaveError(null);
      setPreviewKey(Date.now());
      router.refresh();
    });
  };

  const onAddSection = (type: SectionType) => {
    startTransition(async () => {
      await addSection(siteId, type);
      setSaveState('idle');
      setSaveError(null);
      setPreviewKey(Date.now());
      router.refresh();
    });
  };

  const onPublish = () => {
    if (!isSubscribed || currentStatus === 'PUBLISHED') {
      return;
    }

    setPublishState('publishing');
    setPublishMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch('/api/sites/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ siteId }),
        });

        const payload = (await response.json().catch(() => null)) as { error?: string; slug?: string } | null;

        if (!response.ok) {
          const message =
            payload?.error ??
            (response.status === 401
              ? 'Please log in to publish.'
              : response.status === 402
                ? 'Subscription required to publish.'
                : 'Unable to publish right now.');
          throw new Error(message);
        }

        setCurrentStatus('PUBLISHED');
        setPublishState('success');
        setPublishMessage(`Published! Your site is live at /s/${payload?.slug ?? slug}.`);
        router.refresh();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not publish.';
        setPublishState('error');
        setPublishMessage(message);
      }
    });
  };

  const onSaveDomain = () => {
    if (!isSubscribed) {
      return;
    }

    setDomainState('saving');
    setDomainMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch('/api/sites/custom-domain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ siteId, domain: domainInput }),
        });

        const payload = (await response.json().catch(() => null)) as { error?: string; customDomain?: string } | null;

        if (!response.ok) {
          const message =
            payload?.error ??
            (response.status === 401
              ? 'Please log in to save a domain.'
              : response.status === 402
                ? 'Subscription required to use a custom domain.'
                : 'Unable to save domain.');
          throw new Error(message);
        }

        setDomainInput(payload?.customDomain ?? '');
        setDomainState('saved');
        setDomainMessage(payload?.customDomain ? 'Custom domain saved.' : 'Custom domain cleared.');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not save domain.';
        setDomainState('error');
        setDomainMessage(message);
      }
    });
  };

  const onThemeChange = (nextTheme: ThemeName) => {
    if (nextTheme === currentTheme) {
      return;
    }

    setCurrentTheme(nextTheme);
    setThemeState('saving');
    setThemeMessage(null);

    startTransition(async () => {
      try {
        await updateTheme(siteId, nextTheme);
        setThemeState('saved');
        setPreviewKey(Date.now());
        router.refresh();
      } catch {
        setThemeState('error');
        setThemeMessage('Unable to update theme. Please try again.');
      }
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
            {(['HERO', 'ABOUT', 'CONTACT', 'MENU', 'GALLERY', 'REVIEWS'] as const).map((type) => (
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
            src={`/editor/${slug}/preview?embed=1&v=${previewKey}`}
            title="Live preview"
            className="h-full w-full rounded-xl"
          />
        </div>
      </main>

      <aside className="bg-white p-4">
        <div className="mb-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-700">
          <p className="font-semibold uppercase tracking-wide text-zinc-500">Theme</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map((theme) => (
              <button
                key={theme.name}
                type="button"
                onClick={() => onThemeChange(theme.name)}
                className={`rounded-md border px-2 py-2 text-xs font-medium transition ${
                  currentTheme === theme.name
                    ? 'border-zinc-900 bg-white text-zinc-900'
                    : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400'
                }`}
              >
                <div className={`mb-2 h-6 w-full rounded ${theme.previewClass}`} />
                {theme.label}
              </button>
            ))}
          </div>
          {themeState === 'saving' && <p className="mt-2 text-xs text-zinc-500">Saving theme…</p>}
          {themeState === 'saved' && <p className="mt-2 text-xs text-emerald-600">Theme saved.</p>}
          {themeState === 'error' && <p className="mt-2 text-xs text-red-600">{themeMessage}</p>}
        </div>
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <p className="font-semibold uppercase tracking-wide text-amber-700">Publishing</p>
          {currentStatus === 'PUBLISHED' ? (
            <p className="mt-1">This site is already live.</p>
          ) : isSubscribed ? (
            <p className="mt-1">You are ready to publish.</p>
          ) : isLoggedIn ? (
            <p className="mt-1">Subscribe to publish your site.</p>
          ) : (
            <p className="mt-1">Log in and subscribe to publish your site.</p>
          )}
          <button
            type="button"
            onClick={onPublish}
            disabled={!isSubscribed || publishState === 'publishing' || currentStatus === 'PUBLISHED'}
            className={`mt-3 w-full rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
              isSubscribed && currentStatus !== 'PUBLISHED'
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-amber-200 text-amber-900 opacity-70'
            }`}
          >
            {currentStatus === 'PUBLISHED'
              ? 'Published'
              : publishState === 'publishing'
                ? 'Publishing…'
                : isSubscribed
                  ? 'Publish'
                  : 'Publish (locked)'}
          </button>
          {publishMessage && (
            <p
              className={`mt-2 text-xs ${
                publishState === 'error' ? 'text-red-600' : publishState === 'success' ? 'text-emerald-700' : ''
              }`}
            >
              {publishMessage}
            </p>
          )}
        </div>

        <div className="mb-4 rounded-lg border border-zinc-200 bg-white p-3 text-xs text-zinc-700">
          <p className="font-semibold uppercase tracking-wide text-zinc-500">Custom domain</p>
          {isSubscribed ? (
            <p className="mt-1 text-xs text-zinc-600">Connect a domain to show this published site on your own URL.</p>
          ) : (
            <p className="mt-1 text-xs text-amber-700">Subscribe to connect a custom domain.</p>
          )}
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={domainInput}
              onChange={(event) => setDomainInput(event.target.value)}
              placeholder="yourdomain.com"
              disabled={!isSubscribed || domainState === 'saving'}
              className="flex-1 rounded-md border border-zinc-200 px-2 py-1.5 text-xs text-zinc-700 focus:border-zinc-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-zinc-100"
            />
            <button
              type="button"
              onClick={onSaveDomain}
              disabled={!isSubscribed || domainState === 'saving'}
              className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              {domainState === 'saving' ? 'Saving…' : 'Save'}
            </button>
          </div>
          {domainMessage && (
            <p
              className={`mt-2 text-xs ${
                domainState === 'error' ? 'text-red-600' : domainState === 'saved' ? 'text-emerald-600' : ''
              }`}
            >
              {domainMessage}
            </p>
          )}
        </div>

        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-zinc-600">
            Inspector
            {hasAnyUnsavedChanges && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">Unsaved</span>}
          </h2>
          <button
            type="button"
            onClick={onSave}
            disabled={!selectedSection || saveState === 'saving' || isPending || !hasUnsavedChanges}
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saveState === 'saving' ? 'Saving…' : 'Save'}
          </button>
        </div>

        {saveState === 'saved' && <p className="mb-3 text-xs font-medium text-emerald-600">Saved</p>}
        {saveState === 'error' && <p className="mb-3 text-xs font-medium text-red-600">{saveError ?? 'Error while saving'}</p>}
        {hasUnsavedChanges && <p className="mb-3 text-xs font-medium text-amber-600">Unsaved changes</p>}

        {!selectedSection && (
          <div className="space-y-3 text-sm text-zinc-600">
            <p>Select a section to edit.</p>
            {!hasAboutSection && (
              <div className="rounded-md border border-dashed border-zinc-300 p-3">
                <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">ABOUT missing</p>
                <button
                  type="button"
                  onClick={() => onAddSection('ABOUT')}
                  className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700"
                >
                  Add ABOUT section
                </button>
              </div>
            )}
            {!hasContactSection && (
              <div className="rounded-md border border-dashed border-zinc-300 p-3">
                <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">CONTACT missing</p>
                <button
                  type="button"
                  onClick={() => onAddSection('CONTACT')}
                  className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700"
                >
                  Add CONTACT section
                </button>
              </div>
            )}
          </div>
        )}

        {selectedSection?.type === 'HERO' && (
          <HeroInspector json={currentDraft} onChange={(next) => updateDraft(selectedSection.id, next)} />
        )}

        {selectedSection?.type === 'ABOUT' && (
          <AboutInspector json={currentDraft} onChange={(next) => updateDraft(selectedSection.id, next)} />
        )}

        {selectedSection?.type === 'CONTACT' && (
          <ContactInspector json={currentDraft} onChange={(next) => updateDraft(selectedSection.id, next)} />
        )}

        {selectedSection?.type === 'MENU' && (
          <MenuInspector json={currentDraft} onChange={(next) => updateDraft(selectedSection.id, next)} />
        )}

        {selectedSection?.type === 'GALLERY' && (
          <GalleryInspector json={currentDraft} onChange={(next) => updateDraft(selectedSection.id, next)} />
        )}

        {selectedSection?.type === 'REVIEWS' && (
          <ReviewsInspector json={currentDraft} onChange={(next) => updateDraft(selectedSection.id, next)} />
        )}

        {selectedSection && (!hasAboutSection || !hasContactSection) && (
          <div className="mt-4 space-y-2">
            {!hasAboutSection && (
              <div className="rounded-md border border-dashed border-zinc-300 p-3">
                <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">ABOUT missing</p>
                <button
                  type="button"
                  onClick={() => onAddSection('ABOUT')}
                  className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700"
                >
                  Add ABOUT section
                </button>
              </div>
            )}
            {!hasContactSection && (
              <div className="rounded-md border border-dashed border-zinc-300 p-3">
                <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">CONTACT missing</p>
                <button
                  type="button"
                  onClick={() => onAddSection('CONTACT')}
                  className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700"
                >
                  Add CONTACT section
                </button>
              </div>
            )}
          </div>
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
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">CTA buttons</p>
          <button
            type="button"
            onClick={() => onChange(JSON.stringify({ ...value, ctas: [...value.ctas, { label: 'Learn more', href: '#' }] }))}
            className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700"
          >
            + Add CTA
          </button>
        </div>
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
            {(!cta.href || cta.href === '#') && <p className="mt-1 text-xs text-amber-600">Add a real link</p>}
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (value.ctas.length <= 1) {
                    return;
                  }

                  const next = value.ctas.filter((_, ctaIndex) => ctaIndex !== index);
                  onChange(JSON.stringify({ ...value, ctas: next }));
                }}
                disabled={value.ctas.length <= 1}
                className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Remove
              </button>
            </div>
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

function MenuInspector({ json, onChange }: { json: string; onChange: (json: string) => void }) {
  const value = parseMenuContent(json);

  return (
    <div className="space-y-4">
      <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
        Title
        <input
          value={value.title}
          onChange={(event) => onChange(JSON.stringify({ ...value, title: event.target.value }))}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </label>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Menu items</p>
          <button
            type="button"
            onClick={() =>
              onChange(
                JSON.stringify({
                  ...value,
                  items: [...value.items, { name: 'New item', description: '', price: '' }],
                }),
              )
            }
            className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700"
          >
            + Add item
          </button>
        </div>
        {value.items.map((item, index) => (
          <div key={`${item.name}-${index}`} className="space-y-2 rounded-md border border-zinc-200 p-3">
            <input
              value={item.name}
              onChange={(event) => {
                const next = [...value.items];
                next[index] = { ...item, name: event.target.value };
                onChange(JSON.stringify({ ...value, items: next }));
              }}
              placeholder="Item name"
              className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
            />
            <textarea
              value={item.description}
              onChange={(event) => {
                const next = [...value.items];
                next[index] = { ...item, description: event.target.value };
                onChange(JSON.stringify({ ...value, items: next }));
              }}
              placeholder="Short description"
              rows={3}
              className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
            />
            <input
              value={item.price}
              onChange={(event) => {
                const next = [...value.items];
                next[index] = { ...item, price: event.target.value };
                onChange(JSON.stringify({ ...value, items: next }));
              }}
              placeholder="$"
              className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (value.items.length <= 1) {
                    return;
                  }

                  onChange(JSON.stringify({ ...value, items: value.items.filter((_, itemIndex) => itemIndex !== index) }));
                }}
                disabled={value.items.length <= 1}
                className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GalleryInspector({ json, onChange }: { json: string; onChange: (json: string) => void }) {
  const value = parseGalleryContent(json);

  return (
    <div className="space-y-4">
      <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
        Title
        <input
          value={value.title}
          onChange={(event) => onChange(JSON.stringify({ ...value, title: event.target.value }))}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </label>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Gallery images</p>
          <button
            type="button"
            onClick={() =>
              onChange(
                JSON.stringify({
                  ...value,
                  items: [...value.items, { url: 'https://placehold.co/600x400/png', caption: '' }],
                }),
              )
            }
            className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700"
          >
            + Add image
          </button>
        </div>
        {value.items.map((item, index) => (
          <div key={`${item.url}-${index}`} className="space-y-2 rounded-md border border-zinc-200 p-3">
            <input
              value={item.url}
              onChange={(event) => {
                const next = [...value.items];
                next[index] = { ...item, url: event.target.value };
                onChange(JSON.stringify({ ...value, items: next }));
              }}
              placeholder="https://..."
              className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
            />
            <input
              value={item.caption}
              onChange={(event) => {
                const next = [...value.items];
                next[index] = { ...item, caption: event.target.value };
                onChange(JSON.stringify({ ...value, items: next }));
              }}
              placeholder="Caption"
              className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (value.items.length <= 1) {
                    return;
                  }

                  onChange(JSON.stringify({ ...value, items: value.items.filter((_, itemIndex) => itemIndex !== index) }));
                }}
                disabled={value.items.length <= 1}
                className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewsInspector({ json, onChange }: { json: string; onChange: (json: string) => void }) {
  const value = parseReviewsContent(json);

  return (
    <div className="space-y-4">
      <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
        Title
        <input
          value={value.title}
          onChange={(event) => onChange(JSON.stringify({ ...value, title: event.target.value }))}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </label>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Reviews</p>
          <button
            type="button"
            onClick={() =>
              onChange(
                JSON.stringify({
                  ...value,
                  items: [...value.items, { author: 'Customer', quote: '', rating: 5 }],
                }),
              )
            }
            className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700"
          >
            + Add review
          </button>
        </div>
        {value.items.map((item, index) => (
          <div key={`${item.author}-${index}`} className="space-y-2 rounded-md border border-zinc-200 p-3">
            <input
              value={item.author}
              onChange={(event) => {
                const next = [...value.items];
                next[index] = { ...item, author: event.target.value };
                onChange(JSON.stringify({ ...value, items: next }));
              }}
              placeholder="Author"
              className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
            />
            <textarea
              value={item.quote}
              onChange={(event) => {
                const next = [...value.items];
                next[index] = { ...item, quote: event.target.value };
                onChange(JSON.stringify({ ...value, items: next }));
              }}
              placeholder="Quote"
              rows={3}
              className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
            />
            <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
              Rating
              <select
                value={item.rating}
                onChange={(event) => {
                  const next = [...value.items];
                  next[index] = { ...item, rating: Number(event.target.value) };
                  onChange(JSON.stringify({ ...value, items: next }));
                }}
                className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
              >
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating} stars
                  </option>
                ))}
              </select>
            </label>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (value.items.length <= 1) {
                    return;
                  }

                  onChange(JSON.stringify({ ...value, items: value.items.filter((_, itemIndex) => itemIndex !== index) }));
                }}
                disabled={value.items.length <= 1}
                className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
