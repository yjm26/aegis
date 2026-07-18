import type { FileMetadata } from './types';

export function generateShareLink(file: FileMetadata): string {
  const base = window.location.origin;
  const hash = `${file.shelbyHash}:${file.encryptedKey}`;
  return `${base}/pages/download.html#${hash}`;
}

export async function createShareRecord(fileId: string): Promise<string> {
  const res = await fetch('/api/shares', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileId }),
  });
  const data = await res.json();
  return data.shareToken;
}
