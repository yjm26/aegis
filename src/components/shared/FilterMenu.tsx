import React, { useEffect, useRef } from 'react';

export type FileKindFilter = 'all' | 'image' | 'video' | 'other';
export type SortKey = 'newest' | 'name' | 'size';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  query: string;
  onQueryChange: (q: string) => void;
  kind: FileKindFilter;
  onKindChange: (k: FileKindFilter) => void;
  sort: SortKey;
  onSortChange: (s: SortKey) => void;
  resultCount?: number;
};

const KINDS: { id: FileKindFilter; label: string }[] = [
  { id: 'all', label: 'All types' },
  { id: 'image', label: 'Images' },
  { id: 'video', label: 'Videos' },
  { id: 'other', label: 'Other' },
];

const SORTS: { id: SortKey; label: string }[] = [
  { id: 'newest', label: 'Newest' },
  { id: 'name', label: 'Name' },
  { id: 'size', label: 'Size' },
];

const FILTER_TRIGGER_BASE_CLASS =
  'ml-[0.1rem] inline-flex cursor-pointer items-center gap-[0.35rem] rounded-full border-0 border-l border-l-white/10 bg-transparent px-[0.55rem] py-[0.28rem] text-[0.7rem] text-[rgba(200,195,185,0.7)] hover:text-[#f0ebe3]';

const FILTER_TRIGGER_OPEN_CLASS = 'bg-white/10 text-white';

const FILTER_DOT_CLASS =
  'h-[6px] w-[6px] rounded-full bg-[#8ab4ff] shadow-[0_0_6px_rgba(120,160,255,0.5)]';

const FILTER_PANEL_CLASS =
  'absolute right-0 top-[calc(100%+0.4rem)] z-40 w-[min(280px,calc(100vw-2rem))] rounded-xl border border-white/10 bg-[rgba(12,12,16,0.96)] p-3 text-left shadow-[0_14px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl';

const FILTER_LABEL_CLASS =
  'mb-[0.3rem] mt-[0.55rem] block text-[0.62rem] uppercase tracking-[0.08em] text-[rgba(180,175,165,0.55)] first:mt-0';

const FILTER_SEARCH_CLASS =
  'w-full rounded-lg border border-white/10 bg-black/35 px-[0.55rem] py-[0.45rem] text-[0.8rem] text-[#eee] outline-none focus:border-[rgba(160,170,255,0.35)]';

const FILTER_CHIP_BASE_CLASS =
  'cursor-pointer rounded-full border border-white/10 bg-transparent px-2 py-[0.28rem] text-[0.7rem] text-[rgba(210,205,195,0.7)] hover:border-white/20 hover:text-white';

const FILTER_CHIP_ACTIVE_CLASS = 'border-white/20 bg-white/10 text-white';

export default function FilterMenu({
  open,
  onOpenChange,
  query,
  onQueryChange,
  kind,
  onKindChange,
  sort,
  onSortChange,
  resultCount,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const active =
    query.trim().length > 0 || kind !== 'all' || sort !== 'newest';

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 30);
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) onOpenChange(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onOpenChange]);

  function clearAll() {
    onQueryChange('');
    onKindChange('all');
    onSortChange('newest');
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className={`${FILTER_TRIGGER_BASE_CLASS} ${open || active ? FILTER_TRIGGER_OPEN_CLASS : ''}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => onOpenChange(!open)}
      >
        Filter
        {active ? <span className={FILTER_DOT_CLASS} aria-hidden="true" /> : null}
        <span className="text-[0.6rem] opacity-55" aria-hidden="true">
          {open ? '▴' : '▾'}
        </span>
      </button>

      {open ? (
        <div className={FILTER_PANEL_CLASS} role="dialog" aria-label="Filter files">
          <label className={FILTER_LABEL_CLASS} htmlFor="drive-filter-search">
            Search
          </label>
          <input
            id="drive-filter-search"
            ref={inputRef}
            className={FILTER_SEARCH_CLASS}
            type="search"
            placeholder="Name…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            autoComplete="off"
          />

          <p className={FILTER_LABEL_CLASS}>Type</p>
          <div className="flex flex-wrap gap-[0.3rem]" role="group" aria-label="File type">
            {KINDS.map((k) => (
              <button
                key={k.id}
                type="button"
                className={`${FILTER_CHIP_BASE_CLASS} ${kind === k.id ? FILTER_CHIP_ACTIVE_CLASS : ''}`}
                onClick={() => onKindChange(k.id)}
              >
                {k.label}
              </button>
            ))}
          </div>

          <p className={FILTER_LABEL_CLASS}>Sort</p>
          <div className="flex flex-wrap gap-[0.3rem]" role="group" aria-label="Sort">
            {SORTS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`${FILTER_CHIP_BASE_CLASS} ${sort === s.id ? FILTER_CHIP_ACTIVE_CLASS : ''}`}
                onClick={() => onSortChange(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2">
            <span className="text-[0.68rem] text-[rgba(180,175,165,0.5)]">
              {typeof resultCount === 'number'
                ? `${resultCount} result${resultCount === 1 ? '' : 's'}`
                : ''}
            </span>
            {active ? (
              <button type="button" className="cursor-pointer border-0 bg-transparent text-[0.68rem] text-[rgba(200,195,185,0.65)] hover:text-white" onClick={clearAll}>
                Clear
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
