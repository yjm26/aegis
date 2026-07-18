import { connectWallet, getConnectedWallet, disconnectWallet } from './aptos-client';
import { uploadFile } from './upload';
import { generateShareLink } from './share';
import type { FileMetadata } from './types';
import '../src/style.css';

const GATE = '/pages/gate.html';

let wallet: { address: string; publicKey: string } | null = null;

async function init() {
  wallet = await getConnectedWallet();
  if (!wallet?.address) {
    try {
      wallet = await connectWallet();
    } catch {
      window.location.href = GATE;
      return;
    }
  }
  if (!wallet?.address) {
    window.location.href = GATE;
    return;
  }

  sessionStorage.setItem('blobbed_wallet', wallet.address);
  const chip = document.getElementById('wallet-address');
  if (chip) {
    chip.textContent =
      wallet.address.slice(0, 6) + '…' + wallet.address.slice(-4);
    chip.setAttribute('title', wallet.address);
  }

  wireUpload();
  await loadFiles();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

function setStatus(msg: string, kind: 'info' | 'err' | 'ok' = 'info') {
  const el = document.getElementById('upload-status');
  if (!el) return;
  if (!msg) {
    el.classList.add('hidden');
    el.textContent = '';
    return;
  }
  el.classList.remove('hidden');
  el.dataset.kind = kind;
  el.textContent = msg;
}

async function loadFiles() {
  if (!wallet) return;
  const res = await fetch(`/api/files?owner=${encodeURIComponent(wallet.address)}`);
  const files: FileMetadata[] = res.ok ? await res.json() : [];
  const list = document.getElementById('file-list')!;
  const empty = document.getElementById('empty-state')!;
  const count = document.getElementById('file-count');
  const drop = document.getElementById('drop-zone');

  if (count) {
    count.textContent =
      files.length === 0
        ? 'Your encrypted library'
        : `${files.length} file${files.length === 1 ? '' : 's'}`;
  }

  if (files.length === 0) {
    list.classList.add('hidden');
    empty.classList.remove('hidden');
    drop?.classList.remove('app-drop-compact');
    return;
  }

  empty.classList.add('hidden');
  list.classList.remove('hidden');
  drop?.classList.add('app-drop-compact');

  list.innerHTML = files
    .map((f) => {
      const account = f.storageAccount || '';
      const name = f.blobName || f.shelbyHash || '';
      return `
    <article class="app-file-row">
      <div class="app-file-meta">
        <h3 class="app-file-name">${escapeHtml(f.originalName)}</h3>
        <p class="app-file-sub">${formatSize(f.sizeBytes)} · ${escapeHtml(
          (f.createdAt || '').slice(0, 10)
        )}</p>
      </div>
      <div class="app-file-actions">
        <button type="button" class="app-btn-text share-btn"
          data-account="${escapeHtml(account)}"
          data-name="${escapeHtml(name)}"
          data-key="${escapeHtml(f.encryptedKey || '')}">Share</button>
        <button type="button" class="app-btn-text app-btn-danger delete-btn"
          data-id="${escapeHtml(f.id)}">Delete</button>
      </div>
    </article>`;
    })
    .join('');
}

async function handleFiles(fileList: FileList | File[]) {
  if (!wallet) return;
  const files = Array.from(fileList);
  for (const file of files) {
    try {
      setStatus(`Encrypting & uploading ${file.name}…`, 'info');
      const result = await uploadFile(file, wallet);
      const link = generateShareLink(result.storageAccount, result.blobName, result.key);
      try {
        await navigator.clipboard.writeText(link);
        setStatus(`Uploaded. Share link copied.`, 'ok');
      } catch {
        setStatus(`Uploaded: ${result.blobName}`, 'ok');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatus('Upload failed: ' + msg, 'err');
    }
  }
  await loadFiles();
}

function wireUpload() {
  const input = document.getElementById('file-input') as HTMLInputElement | null;
  const openPicker = () => input?.click();

  document.getElementById('upload-btn')?.addEventListener('click', openPicker);
  document.getElementById('upload-btn-secondary')?.addEventListener('click', openPicker);

  const drop = document.getElementById('drop-zone');
  drop?.addEventListener('click', openPicker);
  drop?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openPicker();
    }
  });

  drop?.addEventListener('dragover', (e) => {
    e.preventDefault();
    drop.classList.add('is-drag');
  });
  drop?.addEventListener('dragleave', () => drop.classList.remove('is-drag'));
  drop?.addEventListener('drop', (e) => {
    e.preventDefault();
    drop.classList.remove('is-drag');
    const files = e.dataTransfer?.files;
    if (files?.length) void handleFiles(files);
  });

  input?.addEventListener('change', async () => {
    if (input.files?.length) {
      await handleFiles(input.files);
      input.value = '';
    }
  });

  document.getElementById('file-list')?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('share-btn')) {
      const account = target.dataset.account || '';
      const name = target.dataset.name || '';
      const key = target.dataset.key || '';
      if (!account || !name || !key) {
        setStatus('Missing share data for this file', 'err');
        return;
      }
      const link = generateShareLink(account, name, key);
      navigator.clipboard.writeText(link).catch(() => {});
      setStatus('Share link copied', 'ok');
    }
    if (target.classList.contains('delete-btn')) {
      const fileId = target.dataset.id;
      if (fileId && confirm('Remove this file from your library? (blob stays on Shelby until expiry)')) {
        fetch(`/api/files?id=${encodeURIComponent(fileId)}`, { method: 'DELETE' }).then(loadFiles);
      }
    }
  });
}

document.getElementById('disconnect')?.addEventListener('click', async () => {
  wallet = null;
  await disconnectWallet();
  window.location.href = GATE;
});

init().catch((err) => {
  console.error(err);
  window.location.href = GATE;
});
