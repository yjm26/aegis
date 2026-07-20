import React from 'react';
import type { FolderMetadata } from '../../../../scripts/types';
import DriveActionMenu, { type DriveAction } from './DriveActionMenu';

export type DriveFolderGridProps = {
  folders: FolderMetadata[];
  countInFolder: (id: string) => number;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onRename?: (id: string) => void;
};

const FOLDER_GRID_CLASS =
  'grid grid-cols-[repeat(auto-fill,minmax(min(100%,14rem),16rem))] justify-start gap-3.5 max-[560px]:grid-cols-1';

const FOLDER_CARD_CLASS =
  'group relative flex aspect-[4/3] min-h-[9.5rem] cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_12%_0%,oklch(0.34_0.05_190_/_0.22),transparent_15rem),radial-gradient(circle_at_86%_18%,oklch(0.32_0.035_250_/_0.18),transparent_13rem),rgba(255,255,255,0.018)] p-4 text-left font-[inherit] text-inherit shadow-[0_14px_42px_rgba(0,0,0,0.18)] transition-[border-color,background,transform] duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.035] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/35 motion-reduce:transition-none motion-reduce:hover:translate-y-0 max-[560px]:aspect-auto max-[560px]:min-h-[7.25rem]';

export default function DriveFolderGrid({
  folders,
  countInFolder,
  onOpen,
  onDelete,
  onRename,
}: DriveFolderGridProps) {
  if (!folders.length) return null;

  return (
    <div className={FOLDER_GRID_CLASS} aria-label="Folders">
      {folders.map((f) => {
        const count = countInFolder(f.id);
        const actions: DriveAction[] = [
          ...(onRename
            ? [{ label: 'Rename folder', onSelect: () => onRename(f.id) }]
            : []),
          {
            label: 'Delete folder',
            tone: 'danger',
            onSelect: () => onDelete(f.id),
          },
        ];
        return (
          <article key={f.id} className="group relative min-w-0">
            <button
              type="button"
              className={FOLDER_CARD_CLASS}
              onClick={() => onOpen(f.id)}
            >
              <span className="flex items-start justify-between gap-3 pr-10">
                <span
                  className="relative grid h-11 w-13 place-items-center rounded-xl border border-[oklch(0.70_0.045_190_/_0.20)] bg-[oklch(0.25_0.035_190_/_0.24)] text-[oklch(0.86_0.045_190)] shadow-inner shadow-white/[0.03] before:absolute before:left-2 before:top-[-0.28rem] before:h-2 before:w-6 before:rounded-t-md before:border before:border-b-0 before:border-[oklch(0.70_0.045_190_/_0.22)] before:bg-[oklch(0.30_0.04_190_/_0.28)]"
                  aria-hidden="true"
                >
                  <span className="h-3 w-7 rounded-sm border border-[oklch(0.75_0.05_190_/_0.24)] bg-[oklch(0.65_0.06_190_/_0.10)]" />
                </span>
                <span className="rounded-full border border-[oklch(0.68_0.04_250_/_0.18)] bg-[oklch(0.18_0.025_250_/_0.32)] px-2 py-1 text-[0.62rem] uppercase tracking-[0.08em] text-[oklch(0.84_0.032_250_/_0.68)]">
                  Folder
                </span>
              </span>

              <span className="min-w-0">
                <span className="block truncate text-[0.98rem] font-normal tracking-[-0.015em] text-white/90">
                  {f.name}
                </span>
                <span className="mt-1 block text-[0.75rem] text-white/48">
                  {count} item{count === 1 ? '' : 's'} · private index
                </span>
              </span>
            </button>
            <div className="absolute right-3 top-3 z-20 text-white/52 transition-colors duration-150 group-hover:text-white/80">
              <DriveActionMenu label="Folder actions" iconOnly actions={actions} />
            </div>
          </article>
        );
      })}
    </div>
  );
}
