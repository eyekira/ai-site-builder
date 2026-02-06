const isProduction = process.env.NODE_ENV === 'production';
const hasClientKey = Boolean(process.env.NEXT_PUBLIC_STATSIG_CLIENT_KEY);

export function isStatsigEnabled() {
  return isProduction && hasClientKey;
}

export function checkGate(_gate: string): boolean {
  return false;
}

export function getFeatureFlag<T>(_: string, fallback: T): T {
  return fallback;
}
