import React from 'react';
import type { FolderMetadata } from '../../../scripts/types';

export type DriveLayoutProps = {
  children: React.ReactNode;
  folders: FolderMetadata[];
  folderId: string | null;
  onSelectAll: () => void;
  onSelectFolder: (id: string) => void;
  onNewFolder: () => void;
  onUpload: () => void;
  countInFolder: (folderId: string) => number;
  railFoot?: string;
};

/**
 * Shell: sidebar rail (Library + folders under All files) + stage.
 */
export default function DriveLayout({
  children,
  folders,
  folderId,
  onSelectAll,
  onSelectFolder,
  onNewFolder,
  onUpload,
  countInFolder,
  railFoot,
}: DriveLayoutProps) {
  return (
    <main className="app-shell">
      <aside className="app-rail app-reveal app-reveal-2">
        <button
          type="button"
          className="app-btn-ghost app-btn-block"
          onClick={onNewFolder}
        >
          New folder
        </button>
        <button type="button" className="app-upload-cta" onClick={onUpload}>
          Upload files
        </button>

        <nav className="app-rail-nav" aria-label="Library">
          <p className="app-rail-label">Library</p>
          <button
            type="button"
            className={`app-rail-item ${folderId === null ? 'is-active' : ''}`}
            onClick={onSelectAll}
          >
            All files
          </button>
          <div className="app-folder-nav">
            {folders.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`app-rail-item ${folderId === f.id ? 'is-active' : ''}`}
                onClick={() => onSelectFolder(f.id)}
              >
                {f.name}
                <span className="app-rail-count">{countInFolder(f.id)}</span>
              </button>
            ))}
          </div>
        </nav>

        <p className="app-rail-foot">
          {railFoot || 'Encrypted on device. Blobs on Shelby.'}
        </p>
      </aside>

      <section className="app-stage app-reveal app-reveal-3">{children}</section>
    </main>
  );
}
