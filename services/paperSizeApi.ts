export type PaperSize = 'A4' | 'Letter' | 'Legal';

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
  } catch {
    return null;
  }
}

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
    // swallow network errors; we'll retry on next login or action
  }
}
