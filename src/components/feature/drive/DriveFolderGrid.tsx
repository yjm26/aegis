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

export default function DriveFolderGrid({
  folders,
  countInFolder,
  onOpen,
  onDelete,
  onRename,
}: DriveFolderGridProps) {
  if (!folders.length) return null;

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-3">
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
          <div key={f.id} className="relative flex min-w-0 flex-col">
            <button
              type="button"
              className="flex min-h-36 flex-1 cursor-pointer flex-col gap-2 border border-white/10 bg-[radial-gradient(ellipse_85%_70%_at_15%_0%,rgba(120,145,170,0.075),transparent_70%),rgba(255,255,255,0.012)] p-4 pb-10 text-left font-[inherit] text-inherit transition hover:border-white/18 hover:bg-white/[0.03]"
              onClick={() => onOpen(f.id)}
            >
              <span
                className="relative block h-5 w-6 border border-white/22 bg-white/[0.035] opacity-72 before:absolute before:-left-px before:-top-2 before:h-2 before:w-4 before:border before:border-b-0 before:border-white/18 before:bg-white/[0.03]"
                aria-hidden="true"
              />
              <span className="truncate text-[0.88rem] text-white/88">{f.name}</span>
              <span className="text-[0.72rem] text-white/42">
                {count} item{count === 1 ? '' : 's'}
              </span>
            </button>
            <div className="absolute bottom-2 right-2 text-white/42">
              <DriveActionMenu label="More" actions={actions} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
