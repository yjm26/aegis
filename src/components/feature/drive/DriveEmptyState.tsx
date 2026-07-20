import React from 'react';

type Props = {
  scope: 'library' | 'folder' | 'filtered';
  onUpload: () => void;
  onNewFolder?: () => void;
  onClearFilters?: () => void;
};

const ghostButton =
  'border border-white/10 bg-white/[0.02] px-4 py-2 text-[0.68rem] uppercase tracking-[0.14em] text-white/65 transition hover:border-white/22 hover:text-white';

export default function DriveEmptyState({
  scope,
  onUpload,
  onNewFolder,
  onClearFilters,
}: Props) {
  const copy =
    scope === 'filtered'
      ? {
          kicker: 'No matches',
          title: 'Nothing matches this view.',
          body: 'Try another search or clear filters.',
        }
      : scope === 'folder'
        ? {
            kicker: 'Empty folder',
            title: 'Drop files into this folder.',
            body: 'Files encrypt in your browser before they touch Shelby.',
          }
        : {
            kicker: 'Encrypted library',
            title: 'Start with an encrypted upload.',
            body: 'Create a folder or upload files. Aegis encrypts locally, then stores ciphertext on Shelby.',
          };

  return (
    <section className="relative mt-1 overflow-hidden border border-white/8 bg-[radial-gradient(ellipse_55%_80%_at_12%_0%,rgba(115,135,160,0.08),transparent_70%),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.03)_1px,transparent_1px),rgba(255,255,255,0.012)] bg-[length:auto,4rem_4rem,4rem_4rem,auto] px-6 py-8 text-center sm:px-10 sm:py-10">
      <p className="m-0 mb-2 text-[0.65rem] uppercase tracking-[0.16em] text-white/42">
        {copy.kicker}
      </p>
      <h2 className="m-0 text-[clamp(1.25rem,3vw,1.8rem)] font-light tracking-[-0.03em] text-white">
        {copy.title}
      </h2>
      <p className="mx-auto mt-2 max-w-[34rem] text-[0.88rem] leading-[1.6] text-white/54">
        {copy.body}
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {scope === 'filtered' ? (
          <button type="button" className={ghostButton} onClick={onClearFilters}>
            Clear filters
          </button>
        ) : (
          <>
            {onNewFolder ? (
              <button type="button" className={ghostButton} onClick={onNewFolder}>
                New folder
              </button>
            ) : null}
            <button
              type="button"
              className="min-w-36 border border-white bg-white px-4 py-2 text-[0.68rem] uppercase tracking-[0.14em] text-black transition hover:bg-[#e8e1d7]"
              onClick={onUpload}
            >
              Upload files
            </button>
          </>
        )}
      </div>
    </section>
  );
}
