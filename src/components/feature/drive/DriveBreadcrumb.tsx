import React from 'react';

type Props = {
  folderName?: string | null;
  onBackToLibrary: () => void;
};

export default function DriveBreadcrumb({ folderName, onBackToLibrary }: Props) {
  const inFolder = Boolean(folderName);

  return (
    <nav
      className="mb-3 flex min-w-0 items-center gap-2 text-[0.68rem] uppercase tracking-[0.12em] text-white/42 max-[560px]:text-[0.62rem]"
      aria-label="Breadcrumb"
    >
      {inFolder ? (
        <button
          type="button"
          className="min-h-8 border-0 bg-transparent p-0 text-white/45 transition-colors duration-150 hover:text-white motion-reduce:transition-none"
          onClick={onBackToLibrary}
        >
          Library
        </button>
      ) : (
        <span>Library</span>
      )}
      <span className="text-white/24" aria-hidden="true">/</span>
      <span className="min-w-0 truncate text-white/70">
        {folderName || 'All files'}
      </span>
    </nav>
  );
}
