import { generateKey, encryptFile, keyToBase64 } from './crypto';
import { uploadToShelby } from './shelby-client';
import type { WalletAccount } from './types';

export async function uploadFile(file: File, wallet: WalletAccount): Promise<void> {
  const arrayBuffer = await file.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  // Encrypt
  const key = generateKey();
  const encrypted = await encryptFile(data, key);

  // Combine IV + ciphertext for Shelby
  const blobData = new Uint8Array(encrypted.iv.length + encrypted.ciphertext.length);
  blobData.set(encrypted.iv);
  blobData.set(encrypted.ciphertext, encrypted.iv.length);

  // Upload to Shelby
  const blobName = `files/${Date.now()}_${file.name}`;
  const shelbyHash = await uploadToShelby(blobData, wallet, blobName);

  // Register metadata with backend
  await fetch('/api/files', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ownerAddress: wallet.address,
      blobName,
      shelbyHash,
      originalName: file.name,
      sizeBytes: file.size,
      mimeType: file.type,
      encryptedKey: keyToBase64(key),
    }),
  });
}
