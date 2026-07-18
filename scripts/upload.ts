import { generateKey, encryptFile, keyToBase64 } from './crypto';
import type { WalletAccount } from './types';

export interface UploadResult {
  storageAccount: string;
  blobName: string;
  /** alias of blobName */
  blobHash: string;
  key: string;
}

function uint8ToBase64(bytes: Uint8Array): string {
  const chunk = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/**
 * Encrypt client-side → relay encrypted bytes to backend → ShelbyNodeClient.upload
 */
export async function uploadFile(file: File, wallet: WalletAccount): Promise<UploadResult> {
  const arrayBuffer = await file.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  const key = generateKey();
  const encrypted = await encryptFile(data, key);

  // IV (12) + ciphertext
  const combined = new Uint8Array(encrypted.iv.length + encrypted.ciphertext.length);
  combined.set(encrypted.iv);
  combined.set(encrypted.ciphertext, encrypted.iv.length);
  const encryptedBase64 = uint8ToBase64(combined);

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      encryptedBase64,
      fileName: file.name,
      ownerAddress: wallet.address,
      fileSize: file.size,
    }),
  });

  const body = await res.json().catch(() => ({ error: 'Upload failed' }));
  if (!res.ok) {
    const extra = body.code === 'MISSING_APTOS_PRIVATE_KEY'
      ? ' (server needs APTOS_PRIVATE_KEY)'
      : '';
    throw new Error((body.error || 'Upload failed') + extra);
  }

  const storageAccount = body.storageAccount as string;
  const blobName = (body.blobName || body.blobHash) as string;
  const keyB64 = keyToBase64(key);

  // Metadata only (no ciphertext)
  await fetch('/api/files', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ownerAddress: wallet.address,
      storageAccount,
      blobName,
      blobHash: blobName,
      originalName: file.name,
      sizeBytes: file.size,
      mimeType: file.type || 'application/octet-stream',
      encryptedKey: keyB64,
    }),
  });

  return {
    storageAccount,
    blobName,
    blobHash: blobName,
    key: keyB64,
  };
}
