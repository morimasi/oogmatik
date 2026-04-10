import { DEFAULT_BLUEPRINT, getBlueprintOrFallback, isValidBlueprint } from '../utils/blueprint';
import { retry } from '../utils/retry';

// Placeholder function to load blueprint data from a given source.
// This should be wired to your actual blueprint-source (API, file, etc.).
async function fetchBlueprintFromSource(source: unknown): Promise<unknown> {
  // If there is an actual API/client in your project, replace this with real call.
  // Keep as-is to avoid breaking builds in environments where the integration isn't wired yet.
  // @ts-ignore
  if (typeof source === 'string' && source.startsWith('http')) {
    // Example: const resp = await fetch(source); return await resp.json();
  }
  throw new Error('Blueprint source not configured in this environment.');
}

/**
 * Load a blueprint with safety: validate, fallback, and optional retry.
 * - If the blueprint cannot be loaded or is invalid, returns DEFAULT_BLUEPRINT or provided fallback.
 * - Uses a retry with backoff for transient fetch failures when a source is provided.
 */
export async function loadBlueprintSafely(
  source: unknown,
  options?: { useRetry?: boolean }
): Promise<any> {
  const useRetry = options?.useRetry ?? true;
  const load = async (): Promise<unknown> => {
    const bp = await fetchBlueprintFromSource(source);
    return bp;
  };

  let raw: unknown;
  if (useRetry) {
    try {
      raw = await retry(load, { retries: 2, delayMs: 200, backoffFactor: 2 });
    } catch {
      // Fall through to fallback below
      raw = null;
    }
  } else {
    try {
      raw = await load();
    } catch {
      raw = null;
    }
  }

  // Validate the blueprint and fallback if needed
  const rawIsValid = isValidBlueprint(raw);
  // Optional: lightweight debug traces (uncomment in dev)
  // if (rawIsValid) console.debug("OCRBlueprintLoader: valid blueprint obtained");
  // else console.debug("OCRBlueprintLoader: invalid or missing blueprint, using fallback");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validOrFallback = getBlueprintOrFallback(raw, DEFAULT_BLUEPRINT) as any;
  return validOrFallback;
}

export default loadBlueprintSafely;
