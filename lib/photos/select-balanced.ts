import type { PhotoCategory } from '@/lib/photos/classify';

export type BalancedSelectablePhoto = {
  id: string | number;
  ref?: string | null;
  name?: string | null;
  photoRef?: string | null;
  widthPx?: number | null;
  heightPx?: number | null;
  category?: string | null;
  confidence?: number | null;
  sortOrder?: number | null;
  isHero?: boolean | null;
};

export type BalancedSelectionConfig = {
  galleryLimit: number;
  heroMinConfidence?: number;
};

export type BalancedSelectionDebug = {
  totalInput: number;
  uniqueInputRefs: number;
  pickedTotal: number;
  pickedUniqueRefs: number;
  first20PickedRefs: string[];
  duplicateHeroInGallery: boolean;
  selectedHeroRef: string | null;
  selectedHeroCategory: PhotoCategory;
  selectedHeroConfidence: number;
  galleryCategoryCounts: Record<PhotoCategory, number>;
  otherOrNullCount: number;
};

export type BalancedSelectionResult<T extends BalancedSelectablePhoto> = {
  hero: T | null;
  gallery: T[];
  debug: BalancedSelectionDebug;
};

const NORMALIZED_CATEGORIES: PhotoCategory[] = ['exterior', 'interior', 'food', 'drink', 'menu', 'people', 'other'];
const HERO_PRIORITY: PhotoCategory[] = ['exterior', 'interior', 'food', 'drink', 'people', 'menu', 'other'];
const CATEGORY_TARGETS: Record<PhotoCategory, number> = {
  exterior: 3,
  interior: 3,
  food: 3,
  drink: 1,
  menu: 1,
  people: 1,
  other: 0,
};

export function normalizeCategory(category?: string | null): PhotoCategory {
  if (!category) return 'other';
  const normalized = category.trim().toLowerCase();
  return NORMALIZED_CATEGORIES.includes(normalized as PhotoCategory) ? (normalized as PhotoCategory) : 'other';
}

export function normalizeRef(photo: BalancedSelectablePhoto): string | null {
  const raw = photo.ref ?? photo.name ?? photo.photoRef ?? null;
  if (typeof raw !== 'string') return null;
  const normalized = raw.trim();
  return normalized.length > 0 ? normalized : null;
}

function minSide(photo: BalancedSelectablePhoto): number {
  const width = typeof photo.widthPx === 'number' ? photo.widthPx : null;
  const height = typeof photo.heightPx === 'number' ? photo.heightPx : null;
  return width !== null && height !== null ? Math.min(width, height) : 0;
}

export function scorePhoto(photo: BalancedSelectablePhoto): number {
  const confidence = typeof photo.confidence === 'number' ? photo.confidence : 0;
  const hasCategory = Boolean(photo.category && normalizeCategory(photo.category) !== 'other');
  const width = typeof photo.widthPx === 'number' ? photo.widthPx : null;
  const height = typeof photo.heightPx === 'number' ? photo.heightPx : null;
  const lowQualityPenalty = width !== null && height !== null && (width < 480 || height < 480) ? 120 : 0;
  const missingCategoryPenalty = hasCategory ? 0 : 50;

  return confidence * 1000 + minSide(photo) * 0.1 - missingCategoryPenalty - lowQualityPenalty;
}

function stableKey(photo: BalancedSelectablePhoto): string {
  const normalizedRef = normalizeRef(photo) ?? 'missing-ref';
  return `${String(photo.id)}:${normalizedRef}`;
}

function comparePhotosStable(a: BalancedSelectablePhoto, b: BalancedSelectablePhoto): number {
  const scoreDiff = scorePhoto(b) - scorePhoto(a);
  if (scoreDiff !== 0) return scoreDiff;

  const aSort = typeof a.sortOrder === 'number' ? a.sortOrder : Number.POSITIVE_INFINITY;
  const bSort = typeof b.sortOrder === 'number' ? b.sortOrder : Number.POSITIVE_INFINITY;
  if (aSort !== bSort) return aSort - bSort;

  return stableKey(a).localeCompare(stableKey(b));
}

function compareForDedupe(a: BalancedSelectablePhoto, b: BalancedSelectablePhoto): number {
  const confidenceDiff = (b.confidence ?? 0) - (a.confidence ?? 0);
  if (confidenceDiff !== 0) return confidenceDiff;

  const minSideDiff = minSide(b) - minSide(a);
  if (minSideDiff !== 0) return minSideDiff;

  return stableKey(a).localeCompare(stableKey(b));
}

function dedupeByRef<T extends BalancedSelectablePhoto>(photos: T[]): T[] {
  const bucket = new Map<string, T>();

  for (const photo of photos) {
    const ref = normalizeRef(photo) ?? `missing:${stableKey(photo)}`;
    const existing = bucket.get(ref);
    if (!existing || compareForDedupe(photo, existing) < 0) {
      bucket.set(ref, photo);
    }
  }

  return Array.from(bucket.values());
}

function computeScaledTargets(galleryLimit: number): Record<PhotoCategory, number> {
  const limit = Math.max(0, Math.floor(galleryLimit));
  const totalTarget = Object.values(CATEGORY_TARGETS).reduce((acc, n) => acc + n, 0);
  const scaledBase = NORMALIZED_CATEGORIES.reduce<Record<PhotoCategory, number>>(
    (acc, category) => {
      const raw = totalTarget > 0 ? (CATEGORY_TARGETS[category] / totalTarget) * limit : 0;
      acc[category] = Math.floor(raw);
      return acc;
    },
    { exterior: 0, interior: 0, food: 0, drink: 0, menu: 0, people: 0, other: 0 },
  );

  let allocated = Object.values(scaledBase).reduce((acc, n) => acc + n, 0);
  const fractions = NORMALIZED_CATEGORIES.map((category) => {
    const raw = totalTarget > 0 ? (CATEGORY_TARGETS[category] / totalTarget) * limit : 0;
    return { category, fraction: raw - Math.floor(raw), target: CATEGORY_TARGETS[category] };
  }).sort((a, b) => {
    if (b.fraction !== a.fraction) return b.fraction - a.fraction;
    if (b.target !== a.target) return b.target - a.target;
    return HERO_PRIORITY.indexOf(a.category) - HERO_PRIORITY.indexOf(b.category);
  });

  for (const entry of fractions) {
    if (allocated >= limit) break;
    scaledBase[entry.category] += 1;
    allocated += 1;
  }

  return scaledBase;
}

export function selectPhotosBalanced<T extends BalancedSelectablePhoto>(
  photos: T[],
  config?: Partial<BalancedSelectionConfig>,
): BalancedSelectionResult<T> {
  const galleryLimit = Math.max(0, Math.floor(config?.galleryLimit ?? 12));
  const heroMinConfidence = typeof config?.heroMinConfidence === 'number' ? config.heroMinConfidence : 0;
  const deduped = dedupeByRef(photos);
  const ordered = [...deduped].sort(comparePhotosStable);

  if (ordered.length === 0) {
    return {
      hero: null,
      gallery: [],
      debug: {
        totalInput: photos.length,
        uniqueInputRefs: deduped.length,
        pickedTotal: 0,
        pickedUniqueRefs: 0,
        first20PickedRefs: [],
        duplicateHeroInGallery: false,
        selectedHeroRef: null,
        selectedHeroCategory: 'other',
        selectedHeroConfidence: 0,
        galleryCategoryCounts: { exterior: 0, interior: 0, food: 0, drink: 0, menu: 0, people: 0, other: 0 },
        otherOrNullCount: 0,
      },
    };
  }

  const usedRefs = new Set<string>();

  const explicitHero = ordered.find((photo) => photo.isHero && (photo.confidence ?? 0) >= heroMinConfidence);
  const hero =
    explicitHero ??
    HERO_PRIORITY.map((category) =>
      ordered.find((photo) => normalizeCategory(photo.category) === category && (photo.confidence ?? 0) >= heroMinConfidence),
    ).find((photo): photo is T => Boolean(photo)) ??
    ordered[0];

  const heroRef = normalizeRef(hero);
  if (heroRef) {
    usedRefs.add(heroRef);
  }

  const remaining = ordered.filter((photo) => {
    const ref = normalizeRef(photo);
    return !ref || !usedRefs.has(ref);
  });

  const grouped = NORMALIZED_CATEGORIES.reduce<Record<PhotoCategory, T[]>>(
    (acc, category) => {
      acc[category] = [];
      return acc;
    },
    { exterior: [], interior: [], food: [], drink: [], menu: [], people: [], other: [] },
  );

  for (const photo of remaining) {
    grouped[normalizeCategory(photo.category)].push(photo);
  }

  const targets = computeScaledTargets(galleryLimit);
  const picked: T[] = [];

  const tryPick = (photo: T) => {
    const ref = normalizeRef(photo);
    if (ref && usedRefs.has(ref)) return false;
    if (ref) usedRefs.add(ref);
    picked.push(photo);
    return true;
  };

  for (const category of HERO_PRIORITY) {
    const group = grouped[category];
    const take = Math.min(targets[category], group.length);
    for (let index = 0; index < take && picked.length < galleryLimit; index += 1) {
      tryPick(group[index]);
    }
  }

  const allRemaining = HERO_PRIORITY.flatMap((category) => grouped[category]).sort(comparePhotosStable);
  while (picked.length < galleryLimit && allRemaining.length > 0) {
    const last = picked[picked.length - 1];
    const secondLast = picked[picked.length - 2];
    const blockedCategory =
      last && secondLast && normalizeCategory(last.category) === normalizeCategory(secondLast.category)
        ? normalizeCategory(last.category)
        : null;

    const nextIndex = blockedCategory
      ? allRemaining.findIndex((photo) => normalizeCategory(photo.category) !== blockedCategory && (!normalizeRef(photo) || !usedRefs.has(normalizeRef(photo)!)))
      : allRemaining.findIndex((photo) => !normalizeRef(photo) || !usedRefs.has(normalizeRef(photo)!));

    const indexToUse = nextIndex >= 0 ? nextIndex : 0;
    const [next] = allRemaining.splice(indexToUse, 1);
    if (!next) break;
    tryPick(next);
  }

  const gallery = picked.slice(0, galleryLimit);
  const galleryCategoryCounts = gallery.reduce<Record<PhotoCategory, number>>(
    (acc, photo) => {
      const category = normalizeCategory(photo.category);
      acc[category] += 1;
      return acc;
    },
    { exterior: 0, interior: 0, food: 0, drink: 0, menu: 0, people: 0, other: 0 },
  );

  const pickedAll = hero ? [hero, ...gallery] : gallery;
  const pickedRefs = pickedAll
    .map((photo) => normalizeRef(photo))
    .filter((ref): ref is string => Boolean(ref));

  const uniquePickedRefs = new Set(pickedRefs);
  const duplicateHeroInGallery = Boolean(heroRef && gallery.some((photo) => normalizeRef(photo) === heroRef));

  return {
    hero,
    gallery,
    debug: {
      totalInput: photos.length,
      uniqueInputRefs: deduped.length,
      pickedTotal: pickedAll.length,
      pickedUniqueRefs: uniquePickedRefs.size,
      first20PickedRefs: pickedRefs.slice(0, 20),
      duplicateHeroInGallery,
      selectedHeroRef: heroRef,
      selectedHeroCategory: normalizeCategory(hero.category),
      selectedHeroConfidence: typeof hero.confidence === 'number' ? hero.confidence : 0,
      galleryCategoryCounts,
      otherOrNullCount: galleryCategoryCounts.other,
    },
  };
}
