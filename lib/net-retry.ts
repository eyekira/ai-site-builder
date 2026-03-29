export type RetryOptions = {
  retries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  factor?: number;
  jitterMs?: number;
  shouldRetry?: (error: unknown) => boolean;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(fn: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const retries = Number.isInteger(opts.retries) ? Number(opts.retries) : 2;
  const baseDelayMs = opts.baseDelayMs ?? 300;
  const maxDelayMs = opts.maxDelayMs ?? 2500;
  const factor = opts.factor ?? 2;
  const jitterMs = opts.jitterMs ?? 120;
  const shouldRetry =
    opts.shouldRetry ??
    ((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error ?? '');
      return /(timeout|network|fetch|429|5\d\d|temporar)/i.test(message);
    });

  let attempt = 0;
  let delay = baseDelayMs;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= retries || !shouldRetry(error)) {
        throw error;
      }
      const jitter = Math.floor(Math.random() * jitterMs);
      await sleep(Math.min(delay + jitter, maxDelayMs));
      delay = Math.min(Math.round(delay * factor), maxDelayMs);
      attempt += 1;
    }
  }
}
