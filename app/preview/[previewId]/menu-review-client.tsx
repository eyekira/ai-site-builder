'use client';

import { useState } from 'react';
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

function parseMenuFromSite(site: SiteForRender): MenuContent | null {
  const section = site.sections.find((s) => s.type === 'MENU');
  if (!section) return null;
  try {
    return JSON.parse(section.contentJson ?? '{}') as MenuContent;
  } catch {
    return null;
  }
}

export function MenuReviewClient({ previewId, initialSite, continueHref }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<'auto' | 'upload' | 'skip'>('auto');
  const [mergeMode, setMergeMode] = useState<'replace' | 'merge'>('replace');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menu, setMenu] = useState<MenuContent | null>(parseMenuFromSite(initialSite));

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
    } catch (e) {
      setError(e instanceof Error ? e.message : 'OCR failed. You can enter menu manually or skip for now.');
      setMode('upload');
      if (!menu) setMenu({ title: 'Menu', items: [] });
    } finally {
      setLoading(false);
    }
  };

  const continueToPreview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/preview/menu-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ previewId, mode, mergeMode, menu }),
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
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Menu Review Step</p>
        <h1 className="mt-2 text-2xl font-semibold">Choose how to set up your menu before preview</h1>
        <p className="mt-2 text-sm text-zinc-600">You can auto-generate, upload menu images, or skip for now.</p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <button type="button" onClick={() => setMode('auto')} className={`rounded-lg border px-3 py-3 text-left ${mode === 'auto' ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 bg-white text-zinc-800'}`}>
            <p className="text-sm font-semibold">Use auto-generated menu</p>
            <p className="mt-1 text-xs opacity-80">Generate menu from place data + AI.</p>
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
    </div>
  );
}
