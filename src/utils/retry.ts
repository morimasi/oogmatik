// Simple exponential backoff retry helper
export async function retry<T>(fn: () => Promise<T>, options?: { retries?: number; delayMs?: number; backoffFactor?: number; }): Promise<T> {
  const retries = options?.retries ?? 2;
  const delayMs = options?.delayMs ?? 200;
  const backoff = options?.backoffFactor ?? 2;

  let currentDelay = delayMs;
  let lastError: any;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt >= retries) throw err;
      await new Promise(res => setTimeout(res, currentDelay));
      currentDelay = Math.round(currentDelay * backoff);
    }
  }
  throw lastError;
}
