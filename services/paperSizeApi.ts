export type PaperSize = 'A4' | 'Letter' | 'Legal';

// Load paper size for the currently authenticated user
export async function loadCurrentUserPaperSize(): Promise<PaperSize | null> {
  try {
    const res = await fetch('/user/paperSize', {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data?.paperSize as PaperSize) ?? null;
  } catch (e) {
    return null;
  }
}

// Persist paper size for the currently authenticated user
export async function saveCurrentUserPaperSize(size: PaperSize): Promise<void> {
  try {
    await fetch('/user/paperSize', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paperSize: size }),
    });
  } catch {
    // Ignore network errors in UI, we'll retry on next login or on user action
  }
}
