import { downloadFromShelby } from './shelby-client';
import { decryptFile, base64ToKey } from './crypto';

async function init() {
  const hash = window.location.hash.slice(1);
  if (!hash.includes(':')) {
    document.getElementById('download-btn')!.textContent = 'Invalid link';
    return;
  }

  const [blobHash, keyBase64] = hash.split(':');
  const key = base64ToKey(keyBase64);

  // TODO: fetch metadata from backend / Shelby
  document.getElementById('file-info')!.classList.remove('hidden');
  document.getElementById('file-name')!.textContent = 'Encrypted file';

  document.getElementById('download-btn')?.addEventListener('click', async () => {
    await downloadAndDecrypt(blobHash, key);
  });
}

async function downloadAndDecrypt(blobHash: string, key: Uint8Array): Promise<void> {
  const progress = document.getElementById('progress')!;
  const bar = document.getElementById('progress-bar')!;
  progress.classList.remove('hidden');

  // Download from Shelby
  const stream = await downloadFromShelby('0x1', blobHash);

  // Read stream to array
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  // Combine chunks
  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
  const encryptedData = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    encryptedData.set(chunk, offset);
    offset += chunk.length;
  }

  // Extract IV and ciphertext
  const iv = encryptedData.slice(0, 12);
  const ciphertext = encryptedData.slice(12);

  // Decrypt
  const decrypted = await decryptFile({ ciphertext, iv }, key);

  // Download to user
  const blob = new Blob([decrypted]);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'file';
  a.click();
  URL.revokeObjectURL(url);

  bar.style.width = '100%';
  document.getElementById('progress-text')!.textContent = 'Done!';
}

init().catch(console.error);
