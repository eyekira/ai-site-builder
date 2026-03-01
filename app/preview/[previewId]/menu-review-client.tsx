'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import type { SiteForRender } from '@/lib/site';
import type { MenuContent } from '@/lib/section-content';

type Props = {
  previewId: string;
  initialSite: SiteForRender;
  continueHref?: string;
};

type MenuItem = { name: string; description: string; price: string; category?: string };

type EvidenceMode = 'uploaded' | 'google_photos' | 'sample';

type MenuOcrEvidence = {
  mode: EvidenceMode;
  usedPhotoRefs: string[];
  candidatePhotoRefs?: string[];
  lastRunAt?: string;
};

type Candidate = {
  ref: string;
  url: string;
  thumbUrl?: string;
  source: 'Google photo';
  selected: boolean;
  status: 'pending' | 'success' | 'empty' | 'error' | 'classified' | 'unclassified' | 'failed';
  score: number;
  label?: string;
  reason: string;
  textDensity?: 'low' | 'med' | 'high';
  hasPrices?: boolean;
  categoryScores?: {
    menu: number;
    food: number;
    interior: number;
    exterior: number;
    ambience: number;
  };
  primaryCategory?: 'menu' | 'food' | 'interior' | 'exterior' | 'ambience';
  errorCode?: string;
  rawModelText?: string;
  extractedItemCount?: number;
};

type EvidenceTile = {
  ref: string;
  url: string;
  source: 'Uploaded' | 'Google photo';
  selected: boolean;
  status?: 'pending' | 'success' | 'empty' | 'error';
  extractedItemCount?: number;
  score?: number;
};

function parseMenuFromSite(site: SiteForRender): MenuContent | null {
  const section = site.sections.find((s) => s.type === 'MENU');
  if (!section) return null;
  try {
    return JSON.parse(section.contentJson ?? '{}') as MenuContent;
  } catch {
    return null;
  }
}

function autoMenuFromSite(site: SiteForRender): MenuContent {
  const title = site.businessTitle || site.title || 'Menu';
  return {
    title: 'Menu',
    items: [
      { name: `${title} Signature`, description: 'Chef-recommended house favorite', price: '$18', category: 'Mains' },
      { name: 'Seasonal Special', description: 'Fresh seasonal ingredients', price: '$16', category: 'Mains' },
      { name: 'Guest Favorite', description: 'Most ordered by regulars', price: '$14', category: 'Starters' },
    ],
  };
}

export function MenuReviewClient({ previewId, initialSite, continueHref }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<'auto' | 'upload' | 'skip'>('auto');
  const [mergeMode, setMergeMode] = useState<'replace' | 'merge'>('replace');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [menu, setMenu] = useState<MenuContent | null>(parseMenuFromSite(initialSite) ?? autoMenuFromSite(initialSite));
  const [evidenceMode, setEvidenceMode] = useState<EvidenceMode>('sample');
  const [evidenceTiles, setEvidenceTiles] = useState<EvidenceTile[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [menuOnly, setMenuOnly] = useState(false);
  const [scannedCount, setScannedCount] = useState(0);
  const [returnedCount, setReturnedCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalAvailableRefs, setTotalAvailableRefs] = useState(0);
  const [groupedCandidates, setGroupedCandidates] = useState<Record<string, Array<{ ref: string; score: number; label?: string }>>>({});
  const [activeCategoryTab, setActiveCategoryTab] = useState<'menu' | 'interior' | 'exterior' | 'food' | 'all'>('menu');
  const [imageFailures, setImageFailures] = useState<Record<string, boolean>>({});
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    void rescanCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedCandidates = useMemo(() => candidates.filter((c) => c.selected), [candidates]);
  const hasGoodSelected = selectedCandidates.some((c) => c.score >= 0.5 || ['menu_board', 'printed_menu', 'menu_screenshot'].includes(c.label ?? ''));

  const displayedCandidates = useMemo(() => {
    const withCategory = candidates.map((c) => ({
      ...c,
      _category: (c.primaryCategory ?? 'menu') as 'menu' | 'food' | 'interior' | 'exterior' | 'ambience',
    }));

    const filtered =
      activeCategoryTab === 'all'
        ? withCategory
        : withCategory.filter((c) => {
            if (activeCategoryTab === 'menu') return c._category === 'menu' || ['menu_board', 'printed_menu', 'menu_screenshot'].includes(c.label ?? '');
            return c._category === activeCategoryTab;
          });

    return filtered.sort((a, b) => {
      const priority = (cat: string) => (cat === 'menu' ? 0 : cat === 'interior' ? 1 : cat === 'exterior' ? 2 : cat === 'food' ? 3 : 4);
      const p = priority(a._category) - priority(b._category);
      if (p !== 0) return p;
      return b.score - a.score;
    });
  }, [activeCategoryTab, candidates]);

  const updateItem = (index: number, patch: Partial<MenuItem>) => {
    if (!menu) return;
    const items = [...menu.items] as MenuItem[];
    items[index] = { ...items[index], ...patch };
    setMenu({ ...menu, items });
  };

  const removeItem = (index: number) => {
    if (!menu) return;
    const items = menu.items.filter((_, i) => i !== index);
    setMenu({ ...menu, items });
  };

  const addItem = () => {
    const current = menu ?? { title: 'Menu', items: [] };
    setMenu({ ...current, items: [...current.items, { name: '', description: '', price: '' }] });
    setMode('upload');
  };

  const rescanCandidates = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/preview/menu-photo-candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ previewId, action: 'rescan', menuOnly }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to scan candidates');
      const received = data.candidates?.length ?? 0;

      // Auto-fallback: if menu-only filter hides everything, immediately rescan with all photos.
      if (menuOnly && received === 0) {
        setMenuOnly(false);
        const retry = await fetch('/api/preview/menu-photo-candidates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ previewId, action: 'rescan', menuOnly: false }),
        });
        const retryData = await retry.json();
        if (!retry.ok) throw new Error(retryData.error || 'Failed to scan candidates');
        setCandidates(retryData.candidates ?? []);
        setScannedCount(retryData.scannedCount ?? retryData.menuPhotoScan?.scannedCount ?? 0);
        setReturnedCount(retryData.returnedCount ?? (retryData.candidates?.length ?? 0));
        setHasMore(Boolean(retryData.hasMore));
        setTotalAvailableRefs(Number(retryData.totalAvailableRefs ?? 0));
        setGroupedCandidates((retryData.groupedCandidates ?? {}) as Record<string, Array<{ ref: string; score: number; label?: string }>>);

        if (process.env.NODE_ENV !== 'production') {
          console.log('[menu-candidates][client][rescan][fallback-all]', {
            received: retryData.candidates?.length ?? 0,
            unique: new Set((retryData.candidates ?? []).map((c: Candidate) => c.ref)).size,
            scannedCount: retryData.scannedCount,
          });
        }
        return;
      }

      setCandidates(data.candidates ?? []);
      setScannedCount(data.scannedCount ?? data.menuPhotoScan?.scannedCount ?? 0);
      setReturnedCount(data.returnedCount ?? (data.candidates?.length ?? 0));
      setHasMore(Boolean(data.hasMore));
      setTotalAvailableRefs(Number(data.totalAvailableRefs ?? 0));
      setGroupedCandidates((data.groupedCandidates ?? {}) as Record<string, Array<{ ref: string; score: number; label?: string }>>);
      if (process.env.NODE_ENV !== 'production') {
        console.log('[menu-candidates][client][rescan]', {
          received,
          unique: new Set((data.candidates ?? []).map((c: Candidate) => c.ref)).size,
          scannedCount: data.scannedCount,
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to scan candidates');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreCandidates = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/preview/menu-photo-candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ previewId, action: 'load_more', menuOnly }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load more');

      setCandidates(data.candidates ?? []);
      if (process.env.NODE_ENV !== 'production') {
        console.log('[menu-candidates][client][load-more]', {
          incoming: data.candidates?.length ?? 0,
          unique: new Set((data.candidates ?? []).map((c: Candidate) => c.ref)).size,
          scannedCount: data.scannedCount,
        });
      }
      setScannedCount(data.scannedCount ?? data.menuPhotoScan?.scannedCount ?? 0);
      setReturnedCount(data.returnedCount ?? (data.candidates?.length ?? 0));
      setHasMore(Boolean(data.hasMore));
      setTotalAvailableRefs(Number(data.totalAvailableRefs ?? 0));
      setGroupedCandidates((data.groupedCandidates ?? {}) as Record<string, Array<{ ref: string; score: number; label?: string }>>);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load more');
    } finally {
      setLoading(false);
    }
  };

  const runUploadOcr = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      Array.from(files).forEach((f) => form.append('files', f));
      const res = await fetch('/api/preview/menu-ocr', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'OCR failed');

      setMenu(data.menu);
      setMode('upload');
      setEvidenceMode('uploaded');
      const used = (data.usedPhotoRefs ?? []) as string[];
      const per = (data.perImageResults ?? []) as Array<{ ref: string; status: 'success' | 'empty' | 'error'; extractedItemCount: number }>;
      const mappedTiles = Array.from(files).slice(0, 4).map((file, i) => {
        const ref = used[i] ?? `upload:${i}:${file.name}`;
        const p = per.find((x) => x.ref === ref);
        return {
          ref,
          url: URL.createObjectURL(file),
          source: 'Uploaded' as const,
          selected: true,
          status: p?.status ?? 'success',
          extractedItemCount: p?.extractedItemCount ?? data.menu.items.length,
        };
      });
      setEvidenceTiles(mappedTiles);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'OCR failed. You can enter menu manually or skip for now.');
      setMode('upload');
      if (!menu) setMenu({ title: 'Menu', items: [] });
    } finally {
      setLoading(false);
    }
  };

  const classifySelectedOne = async () => {
    if (selectedCandidates.length !== 1) {
      setError('Select exactly 1 photo for debug classification.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const target = selectedCandidates[0];
      const res = await fetch('/api/preview/menu-photo-candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ previewId, action: 'classify_one', ref: target.ref, menuOnly: false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to classify one');
      setCandidates(data.candidates ?? []);
      setScannedCount(data.scannedCount ?? data.menuPhotoScan?.scannedCount ?? 0);
      setReturnedCount(data.returnedCount ?? (data.candidates?.length ?? 0));
      setHasMore(Boolean(data.hasMore));
      setTotalAvailableRefs(Number(data.totalAvailableRefs ?? 0));
      setGroupedCandidates((data.groupedCandidates ?? {}) as Record<string, Array<{ ref: string; score: number; label?: string }>>);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to classify one');
    } finally {
      setLoading(false);
    }
  };

  const runGoogleCandidateOcr = async () => {
    if (selectedCandidates.length === 0) {
      setError('Select at least one candidate photo.');
      return;
    }

    if (!hasGoodSelected) {
      setWarning("These don't look like menu photos.");
      return;
    }

    setWarning(null);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/preview/menu-ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrls: selectedCandidates.map((x) => x.url), refs: selectedCandidates.map((x) => x.ref) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'OCR failed');

      setMenu(data.menu);
      setMode('upload');
      setEvidenceMode('google_photos');
      const per = (data.perImageResults ?? []) as Array<{ ref: string; status: 'success' | 'empty' | 'error'; extractedItemCount: number }>;
      const tiles = selectedCandidates.map((item) => {
        const p = per.find((x) => x.ref === item.ref);
        return { ...item, status: p?.status ?? 'success', extractedItemCount: p?.extractedItemCount ?? data.menu.items.length };
      });
      setEvidenceTiles(tiles);
      setCandidates((prev) =>
        prev.map((item) => {
          const p = per.find((x) => x.ref === item.ref);
          return p ? { ...item, status: p.status, extractedItemCount: p.extractedItemCount } : item;
        }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'OCR failed');
    } finally {
      setLoading(false);
    }
  };

  const continueToPreview = async () => {
    setLoading(true);
    setError(null);
    try {
      const evidence: MenuOcrEvidence = {
        mode: mode === 'auto' ? 'sample' : evidenceMode,
        usedPhotoRefs: mode === 'auto' ? [] : evidenceTiles.filter((x) => x.selected).map((x) => x.ref),
        candidatePhotoRefs: candidates.map((x) => x.ref),
        lastRunAt: new Date().toISOString(),
      };

      const res = await fetch('/api/preview/menu-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ previewId, mode, mergeMode, menu, evidence }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to continue');
      router.push(continueHref ?? `/preview/${encodeURIComponent(previewId)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to continue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Menu Review Step</p>
          <h1 className="mt-2 text-2xl font-semibold">Choose how to set up your menu before preview</h1>
          <p className="mt-2 text-sm text-zinc-600">You can generate sample menu, upload menu images, or skip for now.</p>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <button type="button" onClick={() => { setMode('auto'); setEvidenceMode('sample'); setEvidenceTiles([]); setMenu(autoMenuFromSite(initialSite)); }} className={`rounded-lg border px-3 py-3 text-left ${mode === 'auto' ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 bg-white text-zinc-800'}`}>
              <p className="text-sm font-semibold">Generate sample menu (no photos)</p>
              <p className="mt-1 text-xs opacity-80">AI-generated from place info.</p>
            </button>
            <label className={`rounded-lg border px-3 py-3 text-left ${mode === 'upload' ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 bg-white text-zinc-800'}`}>
              <p className="text-sm font-semibold">Upload menu images</p>
              <p className="mt-1 text-xs opacity-80">OCR extracts structured menu.</p>
              <input type="file" accept="image/*" multiple className="mt-2 block text-xs" onChange={(e) => runUploadOcr(e.target.files)} />
            </label>
            <button type="button" onClick={() => setMode('skip')} className={`rounded-lg border px-3 py-3 text-left ${mode === 'skip' ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 bg-white text-zinc-800'}`}>
              <p className="text-sm font-semibold">Skip for now</p>
              <p className="mt-1 text-xs opacity-80">Use placeholder, edit later in editor.</p>
            </button>
          </div>

          <div className="mt-4 rounded-lg border border-zinc-200 p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Google photo candidates</p>
              <div className="flex items-center gap-2 text-xs">
                <label className="inline-flex items-center gap-1">
                  <input type="checkbox" checked={menuOnly} onChange={(e) => setMenuOnly(e.target.checked)} /> Menu only
                </label>
                <button type="button" onClick={loadMoreCandidates} disabled={!hasMore} className="rounded border border-zinc-300 px-2 py-1 disabled:opacity-50">Load more photos</button>
                <button type="button" onClick={rescanCandidates} className="rounded border border-zinc-300 px-2 py-1">Rescan for menus</button>
              </div>
            </div>
            <p className="mb-2 text-[11px] text-zinc-500">scanned {scannedCount} photos (source max {totalAvailableRefs}) · showing {displayedCandidates.length} (api returned {returnedCount})</p>
            {!hasMore && <p className="mb-2 text-[11px] text-zinc-500">No more Google photos available for this place.</p>}
            <div className="mb-2 flex flex-wrap gap-1 text-[11px]">
              {([
                ['menu', 'Menu'],
                ['interior', 'Interior'],
                ['exterior', 'Exterior'],
                ['food', 'Food'],
                ['all', 'All'],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveCategoryTab(key)}
                  className={`rounded border px-2 py-1 ${activeCategoryTab === key ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-300 bg-white text-zinc-700'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            {Object.keys(groupedCandidates).length > 0 && (
              <div className="mb-2 grid gap-1 text-[10px] text-zinc-600 md:grid-cols-2">
                {(['menu', 'food', 'interior', 'exterior', 'ambience'] as const).map((k) => (
                  <div key={k} className="truncate rounded border border-zinc-200 bg-zinc-50 px-2 py-1">
                    <span className="font-semibold">{k}</span>: {(groupedCandidates[k] ?? []).slice(0, 3).map((x) => `${x.label ?? 'other'} ${x.score.toFixed(2)}`).join(', ') || 'none'}
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {displayedCandidates.map((candidate) => (
                <label key={candidate.ref} className="rounded border border-zinc-200 p-1 text-xs">
                  {imageFailures[candidate.ref] ? (
                    <div className="flex h-20 w-full items-center justify-center rounded border border-zinc-200 bg-zinc-50 text-[10px] text-zinc-500">image failed to load</div>
                  ) : (
                    <img
                      src={candidate.thumbUrl ?? candidate.url}
                      alt={candidate.ref}
                      className="h-20 w-full rounded object-cover"
                      onError={() => setImageFailures((prev) => ({ ...prev, [candidate.ref]: true }))}
                    />
                  )}
                  <div className="mt-1 flex items-center justify-between gap-1">
                    <span className="truncate text-[10px]" title={`${candidate.label ?? 'other'} • ${candidate.score.toFixed(2)} | ${candidate.reason || 'no-notes'} | density:${candidate.textDensity ?? 'low'} | prices:${candidate.hasPrices ? 'yes' : 'no'}`}>
                      {(candidate.label ?? 'other')} • {candidate.score.toFixed(2)}
                    </span>
                    <input
                      type="checkbox"
                      checked={candidate.selected}
                      onChange={(e) =>
                        setCandidates((prev) => prev.map((x) => (x.ref === candidate.ref ? { ...x, selected: e.target.checked } : x)))
                      }
                    />
                  </div>
                  <p className="truncate text-[10px] text-zinc-500">{candidate.reason || candidate.status}</p>
                  {candidate.status === 'unclassified' && <p className="text-[10px] text-amber-600">unclassified{candidate.errorCode ? ` (${candidate.errorCode})` : ''}</p>}
                  {candidate.status === 'failed' && (
                    <p className="text-[10px] text-red-600">
                      {candidate.errorCode === 'HTTP_429' ? 'rate limited (HTTP_429)' : `failed${candidate.errorCode ? ` (${candidate.errorCode})` : ''}`}
                    </p>
                  )}
                </label>
              ))}
            </div>
            {candidates.length === 0 && (
              <div className="mt-2 rounded border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
                No strong menu-photo candidates found in current filter.
                {menuOnly && (
                  <button
                    type="button"
                    className="ml-2 underline"
                    onClick={() => {
                      setMenuOnly(false);
                      void rescanCandidates();
                    }}
                  >
                    Show all photos
                  </button>
                )}
              </div>
            )}
            {totalAvailableRefs > 0 && scannedCount >= totalAvailableRefs && candidates.filter((c) => ['menu_board', 'printed_menu', 'menu_screenshot'].includes(c.label ?? '')).length === 0 && (
              <div className="mt-2 rounded border border-zinc-200 bg-zinc-50 p-2 text-xs text-zinc-700">
                No menu images detected in Google photos for this place. Please upload menu photos.
                <div className="mt-1 text-[10px] text-zinc-500">Website-menu extraction fallback can be used next when available.</div>
              </div>
            )}
            <div className="mt-2 flex gap-2">
              <button type="button" onClick={classifySelectedOne} disabled={selectedCandidates.length !== 1 || loading} className="rounded border border-zinc-300 px-2 py-1 text-xs disabled:opacity-50">Classify selected (1)</button>
              <button type="button" onClick={runGoogleCandidateOcr} disabled={!hasGoodSelected} className="rounded border border-zinc-300 px-2 py-1 text-xs disabled:opacity-50">Run OCR on selected</button>
            </div>
          </div>

          {mode !== 'skip' && (
            <div className="mt-4 rounded-lg border border-zinc-200 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Review menu items</p>
                <div className="flex items-center gap-2 text-xs">
                  <label>Import mode</label>
                  <select value={mergeMode} onChange={(e) => setMergeMode(e.target.value as 'replace' | 'merge')} className="rounded border border-zinc-300 px-2 py-1">
                    <option value="replace">Replace existing</option>
                    <option value="merge">Merge with existing</option>
                  </select>
                </div>
              </div>
              <button type="button" onClick={addItem} className="mb-2 rounded border border-zinc-300 px-2 py-1 text-xs">+ Add item manually</button>
              <div className="space-y-2">
                {(menu?.items ?? []).map((item, index) => (
                  <div key={`${item.name}-${index}`} className="grid gap-2 md:grid-cols-[1fr_1fr_120px_110px_60px]">
                    <input value={item.name} onChange={(e) => updateItem(index, { name: e.target.value })} className="rounded border border-zinc-300 px-2 py-1 text-sm" placeholder="Name" />
                    <input value={item.description || ''} onChange={(e) => updateItem(index, { description: e.target.value })} className="rounded border border-zinc-300 px-2 py-1 text-sm" placeholder="Description" />
                    <input value={item.price || ''} onChange={(e) => updateItem(index, { price: e.target.value })} className="rounded border border-zinc-300 px-2 py-1 text-sm" placeholder="$12" />
                    <input value={item.category || ''} onChange={(e) => updateItem(index, { category: e.target.value })} className="rounded border border-zinc-300 px-2 py-1 text-sm" placeholder="Category" />
                    <button type="button" onClick={() => removeItem(index)} className="rounded border border-red-200 px-2 py-1 text-xs text-red-600">Delete</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {warning && <p className="mt-3 text-sm text-amber-600">{warning}</p>}
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <div className="mt-5 flex items-center gap-3">
            <button type="button" onClick={continueToPreview} disabled={loading} className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {loading ? 'Processing…' : 'Continue to Preview'}
            </button>
            <Link href={`/login?next=/preview/${encodeURIComponent(previewId)}`} className="text-sm text-zinc-600 underline">
              Log in to save permanently
            </Link>
          </div>
        </div>

        <aside className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold">Menu photos used</h2>
          {evidenceMode === 'sample' && (
            <p className="mt-2 text-xs text-zinc-600">No photos used. This menu is AI-generated from place info.</p>
          )}
          {evidenceMode !== 'sample' && evidenceTiles.length === 0 && (
            <p className="mt-2 text-xs text-zinc-600">Run OCR to populate evidence tiles.</p>
          )}
          {evidenceTiles.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {evidenceTiles.map((tile) => (
                <div key={tile.ref} className="rounded border border-zinc-200 p-1 text-[10px]">
                  <img src={tile.url} alt={tile.ref} className="h-20 w-full rounded object-cover" />
                  <div className="mt-1 flex items-center justify-between gap-1">
                    <span className="truncate">{tile.source}</span>
                    <button type="button" className="underline" onClick={() => setLightboxUrl(tile.url)}>Open</button>
                  </div>
                  <p className="truncate text-zinc-500">{tile.ref}</p>
                  <p className="text-zinc-500">{tile.status ?? 'pending'} · {tile.extractedItemCount ?? 0} items</p>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>

      {lightboxUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6" onClick={() => setLightboxUrl(null)}>
          <img src={lightboxUrl} alt="OCR evidence" className="max-h-[80vh] max-w-[90vw] rounded-lg" />
        </div>
      )}
    </div>
  );
}
