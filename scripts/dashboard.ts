import { connectWallet } from './aptos-client';
import { uploadFile } from './upload';
import { generateShareLink } from './share';
import type { FileMetadata } from './types';

let wallet: any = null;

async function init() {
  wallet = await connectWallet();
  document.getElementById('wallet-address')!.textContent =
    wallet.address.slice(0, 6) + '...' + wallet.address.slice(-4);
  await loadFiles();
}

async function loadFiles() {
  const files: FileMetadata[] = [];
  const list = document.getElementById('file-list')!;
  const empty = document.getElementById('empty-state')!;

  if (files.length === 0) {
    list.classList.add('hidden');
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');
  list.innerHTML = files.map(f => `
    <div class="flex items-center justify-between p-4 bg-surface border border-border">
      <div class="flex items-center gap-4">
        <span class="text-text-secondary">📄</span>
        <div>
          <div class="text-text-primary text-sm">${f.originalName}</div>
          <div class="text-text-muted text-xs">${formatSize(f.sizeBytes)}</div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button class="text-text-muted hover:text-accent-cyan text-sm share-btn" data-id="${f.id}">Share</button>
        <button class="text-text-muted hover:text-accent-magenta text-sm delete-btn" data-id="${f.id}">Delete</button>
      </div>
    </div>
  `).join('');
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

// Upload flow
document.getElementById('upload-btn')?.addEventListener('click', () => {
  document.getElementById('file-input')?.click();
});

document.getElementById('file-input')?.addEventListener('change', async (e) => {
  const files = (e.target as HTMLInputElement).files;
  if (!files || !wallet) return;
  for (const file of files) {
    await uploadFile(file, wallet);
  }
  await loadFiles();
});

// Share & Delete handlers
document.getElementById('file-list')?.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  if (target.classList.contains('share-btn')) {
    const fileId = target.dataset.id;
    alert('Share link copied to clipboard!');
  }
  if (target.classList.contains('delete-btn')) {
    const fileId = target.dataset.id;
    if (confirm('Delete this file?')) {
      // TODO: delete
    }
  }
});

init().catch(console.error);
