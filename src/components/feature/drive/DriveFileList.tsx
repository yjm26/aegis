import React from 'react';
import type { FileMetadata } from '../../../../scripts/types';
import { isImageMime, isVideoMime } from '../../../../scripts/preview';

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024)
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

export type DriveFileListProps = {
  files: FileMetadata[];
  viewMode: 'list' | 'grid';
  thumbs: Map<string, string>;
  onPreview: (id: string) => void;
  onShare: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function DriveFileList({
  files,
  viewMode,
  thumbs,
  onPreview,
  onShare,
  onDelete,
}: DriveFileListProps) {
  if (!files.length) return null;

  return (
    <div className={viewMode === 'grid' ? 'app-file-grid' : 'app-file-list'}>
      {files.map((f) => {
        const name = f.originalName || 'Untitled';
        const mime = f.mimeType || '';
        const canPreview =
          isImageMime(mime, name) || isVideoMime(mime, name);
        const thumb = thumbs.get(f.id);
        const video = isVideoMime(mime, name);

        return (
          <article
            key={f.id}
            className={viewMode === 'grid' ? 'app-file-card' : 'app-file-row'}
          >
            <button
              type="button"
              className="app-file-thumb app-file-thumb-btn"
              onClick={() => {
                if (canPreview) onPreview(f.id);
              }}
              disabled={!canPreview}
              title={canPreview ? 'Preview' : undefined}
            >
              {thumb ? (
                <img src={thumb} alt="" />
              ) : (
                <span className="app-file-thumb-ph">
                  {video ? '▶' : canPreview ? '…' : 'FILE'}
                </span>
              )}
              {video ? <span className="app-file-badge">Video</span> : null}
            </button>
            <div className="app-file-meta">
              <h3 className="app-file-name" title={name}>
                {name}
              </h3>
              <p className="app-file-sub">
                {formatSize(Number(f.sizeBytes || 0))} ·{' '}
                {(f.createdAt || '').slice(0, 10)}
              </p>
            </div>
            <div className="app-file-actions">
              {canPreview ? (
                <button
                  type="button"
                  className="app-btn-text"
                  onClick={() => onPreview(f.id)}
                >
                  {video ? 'Play' : 'Preview'}
                </button>
              ) : null}
              <button
                type="button"
                className="app-btn-text"
                onClick={() => onShare(f.id)}
              >
                Share
              </button>
              <button
                type="button"
                className="app-btn-text app-btn-danger"
                onClick={() => onDelete(f.id)}
              >
                Delete
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
