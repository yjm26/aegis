import React from 'react';
import type { FileKindFilter, SortKey } from '../../shared/FilterMenu';
import DriveBreadcrumb from './DriveBreadcrumb';
import DriveToolbar from './DriveToolbar';

export type DriveHeaderProps = {
  folderName?: string | null;
  onBackToLibrary: () => void;
  fileCount: number;
  folderCount: number;
  looseFileCount: number;
  viewMode: 'list' | 'grid';
  onViewChange: (mode: 'list' | 'grid') => void;
  filterOpen: boolean;
  onFilterOpenChange: (open: boolean) => void;
  filterQuery: string;
  onFilterQueryChange: (q: string) => void;
  filterKind: FileKindFilter;
  onFilterKindChange: (k: FileKindFilter) => void;
  sortBy: SortKey;
  onSortChange: (s: SortKey) => void;
  onUpload: () => void;
  onShareFolder?: () => void;
  onDeleteFolder?: () => void;
};

export default function DriveHeader({
  folderName,
  onBackToLibrary,
  fileCount,
  folderCount,
  looseFileCount,
  viewMode,
  onViewChange,
  filterOpen,
  onFilterOpenChange,
  filterQuery,
  onFilterQueryChange,
  filterKind,
  onFilterKindChange,
  sortBy,
  onSortChange,
  onUpload,
  onShareFolder,
  onDeleteFolder,
}: DriveHeaderProps) {
  const inFolder = Boolean(folderName);
  const subtitle = inFolder
    ? `${fileCount} file${fileCount === 1 ? '' : 's'} · live folder sharing available`
    : `${folderCount} folder${folderCount === 1 ? '' : 's'} · ${looseFileCount} loose file${
        looseFileCount === 1 ? '' : 's'
      } · encrypted before upload`;

  return (
    <div className="flex items-start justify-between gap-4 pb-1 max-[720px]:flex-col">
      <div className="min-w-0">
        <DriveBreadcrumb folderName={folderName} onBackToLibrary={onBackToLibrary} />
        <p className="m-0 mb-1 text-[0.64rem] uppercase tracking-[0.16em] text-white/30">Encrypted storage</p>
        <h1 className="m-0 text-[clamp(1.75rem,3vw,2.25rem)] font-light leading-[1.1] tracking-[-0.03em] text-[var(--text)]">{folderName || 'Library'}</h1>
        <p className="m-0 mt-1 text-[0.8125rem] text-[var(--text-3)]">{subtitle}</p>
      </div>

      <DriveToolbar
        inFolder={inFolder}
        viewMode={viewMode}
        onViewChange={onViewChange}
        filterOpen={filterOpen}
        onFilterOpenChange={onFilterOpenChange}
        filterQuery={filterQuery}
        onFilterQueryChange={onFilterQueryChange}
        filterKind={filterKind}
        onFilterKindChange={onFilterKindChange}
        sortBy={sortBy}
        onSortChange={onSortChange}
        resultCount={fileCount}
        onUpload={onUpload}
        onShareFolder={onShareFolder}
        onDeleteFolder={onDeleteFolder}
      />
    </div>
  );
}
