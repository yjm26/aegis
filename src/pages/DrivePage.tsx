import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  disconnectWallet,
  getConnectedWallet,
  hasAppSession,
} from '../../scripts/aptos-client';
import { uploadFile } from '../../scripts/upload';
import {
  createFolder,
  listFiles,
  listFolders,
  listAllFiles,
  removeFile,
  deleteFolder,
  getFolder,
  countFilesInFolder,
  hydrateLibrary,
  getLibraryBackend,
  setLibraryAuthWallet,
  ensureLibrarySession,
  clearLibrarySession,
} from '../../scripts/library-store';
import {
  generateFileShareLink,
  generateFolderShareLink,
  fileToShareItemAsync,
} from '../../scripts/share';
import {
  previewObjectUrl,
  isImageMime,
  isVideoMime,
} from '../../scripts/preview';
import type { FileMetadata, FolderMetadata, WalletAccount } from '../../scripts/types';
import {
  ensureVaultUnlocked,
  migratePlainKeys,
  countKeyEncodings,
  isVaultUnlocked,
  clearVaultSession,
  openThumb,
} from '../../scripts/vault';

import { DriveLayout } from '../components';
import { DriveHeader, DriveToolbar, DriveContent } from '../components/feature/drive';
import BrandLoader from '../components/shared/BrandLoader';
import MediaLightbox, { type MediaLightboxState } from '../components/feature/media/MediaLightbox';
import ShareSheet, { type ShareSheetState } from '../components/feature/share/ShareSheet';
import UploadQueuePanel, { type QueueJob } from '../components/feature/upload/UploadQueuePanel';
import FilterMenu, { type FileKindFilter, type SortKey } from '../components/shared/FilterMenu';

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

type DialogState =
  | { type: 'rename-file'; fileId: string; currentName: string }
  | null
  | { type: 'folder' }
  | { type: 'delete'; fileId: string; name: string }
  | { type: 'delete-folder'; folderId: string; name: string; fileCount: number };

export default function DrivePage() {
  const nav = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const [wallet, setWallet] = useState<WalletAccount | null>(null);
  const [ready, setReady] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const [folderId, setFolderId] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [status, setStatus] = useState<{ msg: string; kind: 'info' | 'err' | 'ok' } | null>(null);
  const [drag, setDrag] = useState(false);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [folderName, setFolderName] = useState('Album');
  const [dialogBusy, setDialogBusy] = useState(false);
  const thumbs = useRef(new Map<string, string>());
  const [, setThumbTick] = useState(0);
  const [lightbox, setLightbox] = useState<MediaLightboxState | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [vaultOk, setVaultOk] = useState(false);
  const [keyStats, setKeyStats] = useState({ plain: 0, wrapped: 0, plainThumbs: 0, wrappedThumbs: 0 });
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => {
    try {
      return localStorage.getItem('blobbed_view') === 'grid' ? 'grid' : 'list';
    } catch {
      return 'list';
    }
  });
  const [sortBy, setSortBy] = useState<SortKey>(() => {
    try {
      const s = localStorage.getItem('blobbed_sort');
      if (s === 'newest' || s === 'name' || s === 'size') return s;
      return 'newest';
    } catch {
      return 'newest';
    }
  });
  const [filterKind, setFilterKind] = useState<FileKindFilter>('all');
  const [filterQuery, setFilterQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [folders, setFolders] = useState<FolderMetadata[]>([]);
  const [currentFolder, setCurrentFolder] = useState<FolderMetadata | null>(null);
  const [queue, setQueue] = useState<QueueJob[]>([]);
  const [queueCollapsed, setQueueCollapsed] = useState(false);

  const owner = wallet?.address || '';

  const openNewFolder = useCallback(() => {
    setDialog({ type: 'folder' });
  }, []);

  const refresh = useCallback(() => setTick(t => t + 1), []);

  const syncWalletAndLibrary = useCallback(async (isRetry = false) => {
    if (isRetry) setIsRetrying(true);
    setLoadingError(null);

    const timeout = (ms: number) =>
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), ms)
      );

    try {
      if (!hasAppSession()) {
        nav('/gate', { replace: true });
        return;
      }

      const w = await Promise.race([
        getConnectedWallet(),
        timeout(8000),
      ]);

      if (!w?.address) {
        await disconnectWallet().catch(() => {});
        nav('/gate', { replace: true });
        return;
      }
      if (!w.publicKey) {
        setLoadingError(
          'Wallet public key missing. Disconnect, reconnect Petra, then try again.'
        );
        return;
      }

      setWallet(w);
      setLibraryAuthWallet(w);
      setStatus({ msg: 'Syncing library…', kind: 'info' });

      try {
        setStatus({ msg: 'Unlock vault. Check wallet…', kind: 'info' });
        await Promise.race([
          ensureVaultUnlocked(w),
          timeout(20000),
        ]);
        setVaultOk(true);

        setStatus({ msg: 'Library session. Check wallet…', kind: 'info' });
        await Promise.race([
          ensureLibrarySession(w),
          timeout(15000),
        ]);

        // hydrate AFTER session — sync requires sessionToken
        setStatus({ msg: 'Loading library…', kind: 'info' });
        await Promise.race([
          hydrateLibrary(w.address),
          timeout(15000),
        ]);

        const mig = await migratePlainKeys(w);
        if (mig.migrated > 0 || mig.thumbs > 0) {
          setStatus({ msg: `Secured ${mig.migrated} key(s)`, kind: 'ok' });
        }
      } catch (err: unknown) {
        setVaultOk(false);
        const msg = err instanceof Error ? err.message : '';
        if (msg === 'Timeout') {
          setLoadingError('Unlock/session timed out. Check Petra popup, then Retry.');
        } else if (/SESSION_CONFIG|Session service unavailable/i.test(msg)) {
          setLoadingError(
            'Server session not configured. Set LIBRARY_SESSION_SECRET on Render, then Retry.'
          );
        } else if (/public key|publicKey/i.test(msg)) {
          setLoadingError(
            'Wallet public key missing. Disconnect, reconnect Petra, then Retry.'
          );
        } else if (/session|sign|auth|rejected|signature/i.test(msg)) {
          setLoadingError(
            msg.length > 8 && msg.length < 140
              ? msg
              : 'Vault or library session failed. Approve Petra popup, then Retry.'
          );
        } else {
          setLoadingError(
            msg && msg.length < 140
              ? msg
              : 'Failed to unlock vault or library session. Check Petra popup and try again.'
          );
        }
        return;
      }

      setStatus({ msg: 'Library synced', kind: 'ok' });
      setTimeout(() => setStatus(null), 1500);
      setReady(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'Timeout') {
        setLoadingError('Sync timeout. Check wallet connection and try again.');
      } else {
        setLoadingError('Failed to sync library. Please try again.');
      }
    } finally {
      setIsRetrying(false);
    }
  }, [nav]);

  useEffect(() => {
    syncWalletAndLibrary();
  }, [syncWalletAndLibrary]);

  useEffect(() => {
    if (!wallet) return;

    const loadData = async () => {
      const allFolders = listFolders(owner);
      setFolders(allFolders);

      if (folderId) {
        const f = getFolder(owner, folderId);
        setCurrentFolder(f || null);
        setFiles(listFiles(owner, folderId));
      } else {
        setCurrentFolder(null);
        setFiles(listFiles(owner, null));
      }
    };

    loadData();
  }, [wallet, folderId, tick, owner]);

  const handleFiles = useCallback(async (fileList: FileList) => {
    if (!wallet) return;
    for (const file of Array.from(fileList)) {
      try {
        await uploadFile(file, wallet, folderId);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Upload failed';
        setStatus({ msg: msg.slice(0, 100), kind: 'err' });
      }
    }
    refresh();
  }, [wallet, folderId, refresh]);

  const onDisconnect = async () => {
    clearVaultSession();
    clearLibrarySession();
    setWallet(null);
    setReady(false);
    try {
      await disconnectWallet();
    } catch {
      /* ignore */
    }
    nav('/gate', { replace: true });
  };

  const setView = (mode: 'list' | 'grid') => {
    setViewMode(mode);
    try { localStorage.setItem('blobbed_view', mode); } catch {}
  };

  const setSort = (s: SortKey) => {
    setSortBy(s);
    try { localStorage.setItem('blobbed_sort', s); } catch {}
  };

  const handleCreateFolder = async () => {
    if (!wallet || !folderName.trim()) return;
    setDialogBusy(true);
    try {
      await createFolder(owner, folderName.trim());
      setDialog(null);
      setFolderName('Album');
      refresh();
    } catch (e: unknown) {
      setStatus({
        msg: e instanceof Error ? e.message.slice(0, 80) : 'Folder create failed',
        kind: 'err',
      });
    } finally {
      setDialogBusy(false);
    }
  };

  const askDeleteFile = (fileId: string, name: string) => {
    setDialog({ type: 'delete', fileId, name });
  };

  const retrySync = () => {
    syncWalletAndLibrary(true);
  };

  if (!ready || !wallet) {
    if (loadingError) {
      return (
        <div className="brand-loader brand-loader--error" role="alert">
          <div className="brand-loader-ambient" aria-hidden="true" />
          <div className="brand-loader-inner">
            <p className="brand-loader-word">Blobbed</p>
            <div className="brand-loader-mark" aria-hidden="true">
              <span className="brand-loader-ring brand-loader-ring--static" />
              <span className="brand-loader-core">B</span>
            </div>
            <div className="brand-loader-copy">
              <p className="brand-loader-label">Couldn&apos;t open library</p>
              <p className="brand-loader-hint">{loadingError}</p>
            </div>
            <div className="brand-loader-actions">
              <button
                type="button"
                className="app-modal-btn app-modal-btn-primary"
                onClick={retrySync}
                disabled={isRetrying}
              >
                {isRetrying ? 'Retrying…' : 'Retry'}
              </button>
              <button
                type="button"
                className="app-modal-btn app-modal-btn-ghost"
                onClick={() => void onDisconnect()}
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <BrandLoader
        label="Syncing your library"
        hint="Index + wallet key wrap"
      />
    );
  }

  return (
    <DriveLayout
      folderName={folderId ? currentFolder?.name : undefined}
      onNewFolder={openNewFolder}
      onUpload={() => inputRef.current?.click()}
      onRefresh={() => setTick(t => t + 1)}
      onSearch={setFilterQuery}
      isLoading={false}
    >
      <DriveHeader
        folderName={folderId ? currentFolder?.name : undefined}
        onNewFolder={openNewFolder}
        onUpload={() => inputRef.current?.click()}
        viewMode={viewMode}
        onViewChange={setView}
        filterOpen={filterOpen}
        onFilterOpenChange={setFilterOpen}
        filterQuery={filterQuery}
        onFilterQueryChange={setFilterQuery}
        filterKind={filterKind}
        onFilterKindChange={setFilterKind}
        sortBy={sortBy}
        onSortChange={setSort}
        fileCount={files.length}
        folderCount={folders.length}
      />
      <DriveToolbar
        onRefresh={() => setTick(t => t + 1)}
        onSearch={setFilterQuery}
      />
      <DriveContent>
        <div
          className={`app-drop ${files.length > 0 ? 'app-drop-compact' : ''} ${drag ? 'is-drag' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            if (e.dataTransfer.files?.length) void handleFiles(e.dataTransfer.files);
          }}
        >
          <span className="app-drop-title">Drop files here</span>
          <span className="app-drop-hint">
            {folderId ? 'Upload into this folder' : 'or click to browse'}
          </span>
        </div>

        {!folderId && folders.length > 0 && (
          <div className="drive-folder-grid">
            {folders.map((folder) => (
              <button key={folder.id} className="drive-folder-card" onClick={() => setFolderId(folder.id)}>
                <div className="drive-folder-icon">📁</div>
                <div className="drive-folder-name">{folder.name}</div>
                <div className="drive-folder-count">{countFilesInFolder(owner, folder.id)} files</div>
              </button>
            ))}
          </div>
        )}

        {files.length > 0 && (
          <div className={viewMode === 'grid' ? 'drive-file-grid' : 'drive-file-list'}>
            {files.map((file) => {
              const mime = file.mimeType || '';
              const name = file.originalName || 'Untitled';
              const size = Number(file.sizeBytes || 0);
              return (
              <div key={file.id} className="drive-file-item">
                <div className="drive-file-icon">
                  {isImageMime(mime, name) ? '🖼️' : isVideoMime(mime, name) ? '🎥' : '📄'}
                </div>
                <div className="drive-file-info">
                  <div className="drive-file-name">{name}</div>
                  <div className="drive-file-meta">
                    {formatSize(size)} · {new Date(file.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="drive-file-actions">
                  <button type="button">Open</button>
                  <button type="button">Share</button>
                  <button type="button" onClick={() => askDeleteFile(file.id, name)}>Delete</button>
                </div>
              </div>
              );
            })}
          </div>
        )}

        {files.length === 0 && folders.length === 0 && (
          <div className="app-empty-hint">No files yet. Upload something!</div>
        )}
      </DriveContent>

      {dialog?.type === 'folder' && (
        <div className="modal">
          <div className="modal-content">
            <h3>New Folder</h3>
            <input
              ref={folderInputRef}
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="input"
              placeholder="Folder name"
            />
            <div className="modal-actions">
              <button onClick={() => setDialog(null)}>Cancel</button>
              <button onClick={handleCreateFolder} disabled={dialogBusy}>
                {dialogBusy ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DriveLayout>
  );
}
