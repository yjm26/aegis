import React from 'react';
import type { FileMetadata } from '../../../../scripts/types';
import { isImageMime, isVideoMime } from '../../../../scripts/preview';
import DriveActionMenu, { type DriveAction } from './DriveActionMenu';
import { fileTypeLabel, formatFileDate, formatFileSize } from './driveFormat';

export type DriveFileListProps = {
  files: FileMetadata[];
  viewMode: 'list' | 'grid';
  thumbs: Map<string, string>;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onPreview: (id: string) => void;
  onShare: (id: string) => void;
  onDelete: (id: string) => void;
  onRename?: (id: string) => void;
  onMove?: (id: string) => void;
};

export default function DriveFileList({
  files,
  viewMode,
  thumbs,
  selectedIds,
  onToggleSelect,
  onPreview,
  onShare,
  onDelete,
  onRename,
  onMove,
}: DriveFileListProps) {
  if (!files.length) return null;

  return (
    <div
      className={
        viewMode === 'grid'
          ? 'mt-3 grid grid-cols-[repeat(auto-fill,minmax(148px,1fr))] gap-3'
          : 'flex flex-col border-t border-white/10'
      }
    >
      {files.map((f) => {
        const name = f.originalName || 'Untitled';
        const mime = f.mimeType || '';
        const canPreview =
          isImageMime(mime, name) || isVideoMime(mime, name);
        const thumb = thumbs.get(f.id);
        const video = isVideoMime(mime, name);
        const checked = selectedIds?.has(f.id) ?? false;
        const kindLabel = fileTypeLabel(mime, name);
        const menuActions: DriveAction[] = [
          ...(onRename
            ? [{ label: 'Rename', onSelect: () => onRename(f.id) }]
            : []),
          ...(onMove ? [{ label: 'Move', onSelect: () => onMove(f.id) }] : []),
          { label: 'Delete', tone: 'danger', onSelect: () => onDelete(f.id) },
        ];
        const articleClass =
          viewMode === 'grid'
            ? `flex flex-col overflow-hidden rounded-xl border border-white/8 bg-white/[0.02] transition hover:border-white/15 hover:bg-white/[0.035] ${checked ? 'border-white/24 bg-white/[0.045]' : ''}`
            : `flex items-center justify-between gap-4 border-b border-white/10 px-0.5 py-4 transition hover:bg-white/[0.02] max-[720px]:flex-col max-[720px]:items-start ${checked ? 'bg-white/[0.035]' : ''}`;
        const thumbClass =
          viewMode === 'grid'
            ? 'relative flex aspect-square h-auto w-full shrink-0 items-center justify-center overflow-hidden border-0 bg-white/[0.02]'
            : 'relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden border border-white/10 bg-white/[0.02]';

        return (
          <article key={f.id} className={articleClass}>
            {onToggleSelect ? (
              <label className="flex shrink-0 items-center justify-center text-white/55">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleSelect(f.id)}
                  aria-label={`Select ${name}`}
                />
              </label>
            ) : null}
            <button
              type="button"
              className={thumbClass}
              onClick={() => {
                if (canPreview) onPreview(f.id);
              }}
              disabled={!canPreview}
              title={canPreview ? 'Preview' : undefined}
            >
              {thumb ? (
                <img className="h-full w-full object-cover" src={thumb} alt="" />
              ) : (
                <span className="text-[0.64rem] uppercase tracking-[0.12em] text-white/45">
                  {video ? '▶' : canPreview ? '' : kindLabel}
                </span>
              )}
              <span className="pointer-events-none absolute bottom-1.5 left-1.5 rounded bg-black/55 px-1.5 py-0.5 text-[0.6rem] uppercase tracking-[0.04em] text-[#ddd]">
                {kindLabel}
              </span>
            </button>
            <div className={viewMode === 'grid' ? 'min-w-0 px-3 pb-1 pt-2' : 'min-w-0 flex-1'}>
              <h3
                className="m-0 truncate text-[0.86rem] font-normal tracking-[-0.01em] text-white/90"
                title={name}
              >
                {name}
              </h3>
              <p className="m-0 mt-1 text-[0.72rem] text-white/42">
                {formatFileSize(Number(f.sizeBytes || 0))} ·{' '}
                {formatFileDate(f.createdAt)}
              </p>
            </div>
            <div
              className={
                viewMode === 'grid'
                  ? 'flex flex-wrap gap-1 px-2 pb-3 pt-1'
                  : 'flex shrink-0 items-center gap-2'
              }
            >
              {canPreview ? (
                <button
                  type="button"
                  className="border-0 bg-transparent px-1 py-1 text-[0.72rem] uppercase tracking-[0.08em] text-white/55 transition hover:text-white"
                  onClick={() => onPreview(f.id)}
                >
                  {video ? 'Play' : 'Preview'}
                </button>
              ) : null}
              <button
                type="button"
                className="border-0 bg-transparent px-1 py-1 text-[0.72rem] uppercase tracking-[0.08em] text-white/85 transition hover:text-white"
                onClick={() => onShare(f.id)}
              >
                Share
              </button>
              <DriveActionMenu actions={menuActions} align="up" />
            </div>
          </article>
        );
      })}
    </div>
  );
}
