import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { parseLiveFolderFragment, parseShareFragment } from '../../scripts/share';
import {
  fetchLiveFolderShare,
  liveFolderItemsToShareItems,
} from '../../scripts/live-share-view';
import {
  previewObjectUrl,
  downloadShareItem,
  isImageMime,
  isVideoMime,
} from '../../scripts/preview';
import type { ShareFileItem, SharePayload } from '../../scripts/types';
import MediaLightbox, {
  type MediaLightboxState,
} from '../components/feature/media/MediaLightbox';
import AegisLogo from '../components/shared/AegisLogo';

function filesFromPayload(p: SharePayload): { title: string; files: ShareFileItem[] } {
  if (p.type === 'folder') {
    return { title: p.name || 'Folder', files: p.files || [] };
  }
  return {
    title: p.name || 'File',
    files: [
      {
        a: p.a,
        n: p.n,
        k: p.k,
        name: p.name,
        mime: p.mime,
        size: p.size,
      },
    ],
  };
}

type TileState = {
  item: ShareFileItem;
  url?: string;
  failed?: boolean;
};

const VIEW_META_BADGE_CLASS =
  'border border-[color-mix(in_oklch,var(--border,#2a2a2a)_82%,var(--text,#fff))] bg-[color-mix(in_oklch,var(--surface,#111)_72%,transparent)] px-[0.55rem] py-[0.38rem] text-[0.6875rem] uppercase tracking-[0.06em] text-[color-mix(in_oklch,var(--text,#fff)_64%,transparent)]';

const VIEW_TILE_CLASS =
  'flex cursor-pointer flex-col overflow-hidden border border-[var(--border,#2a2a2a)] bg-[color-mix(in_oklch,var(--surface,#111)_76%,transparent)] transition-[border-color,background,transform] duration-150 hover:-translate-y-px hover:border-[color-mix(in_oklch,var(--text,#fff)_34%,var(--border,#333))] hover:bg-[color-mix(in_oklch,var(--surface,#111)_92%,var(--text,#fff))] motion-reduce:transition-none motion-reduce:hover:translate-y-0';

const VIEW_PLACEHOLDER_CLASS =
  'text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--text-muted,#666)]';

const VIEW_MEDIA_OBJECT_CLASS = 'h-full w-full object-cover';

const VIEW_DOWNLOAD_BUTTON_CLASS =
  'min-h-[2.45rem] w-full cursor-pointer appearance-none border border-[color-mix(in_oklch,var(--border,#2a2a2a)_78%,var(--text,#fff))] bg-transparent text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--text,#fff)] transition-[background,color,border-color] duration-150 hover:border-[var(--text,#fff)] hover:bg-[var(--text,#fff)] hover:text-[var(--bg,#0a0a0a)] motion-reduce:transition-none';

function fileKindLabel(item: ShareFileItem): string {
  if (isImageMime(item.mime, item.name)) return 'Image';
  if (isVideoMime(item.mime, item.name)) return 'Video';
  return 'File';
}

function shortName(name: string): string {
  if (name.length <= 34) return name;
  const dot = name.lastIndexOf('.');
  const ext = dot > 0 && name.length - dot <= 8 ? name.slice(dot) : '';
  const base = ext ? name.slice(0, dot) : name;
  return `${base.slice(0, 12)}…${base.slice(-6)}${ext}`;
}

export default function ViewPage() {
  const loc = useLocation();
  const [title, setTitle] = useState('Shared');
  const [sub, setSub] = useState('Decrypting in your browser…');
  const [error, setError] = useState('');
  const [tiles, setTiles] = useState<TileState[]>([]);
  const [isLiveFolder, setIsLiveFolder] = useState(false);
  const [shareLabel, setShareLabel] = useState('Shared');
  const [itemCount, setItemCount] = useState(0);
  const [lightbox, setLightbox] = useState<MediaLightboxState | null>(null);

  useEffect(() => {
    const objectUrls: string[] = [];
    let cancelled = false;

    (async () => {
      setError('');
      const hash = loc.hash || window.location.hash;
      let t = 'Shared';
      let files: ShareFileItem[] = [];
      const liveRef = parseLiveFolderFragment(hash);
      setIsLiveFolder(Boolean(liveRef));
      setShareLabel(liveRef ? 'Live folder' : 'Shared');
      if (liveRef) {
        setTitle('Live folder');
        setSub('Loading current folder contents…');
        const live = await fetchLiveFolderShare(liveRef.shareId);
        files = await liveFolderItemsToShareItems(live, liveRef.folderKey);
        t = live.name || 'Live folder';
        setSub('This link stays current as the owner adds or removes files. Keys stay in the URL fragment.');
      } else {
        const payload = parseShareFragment(hash);
        if (!payload) {
          setTitle('Invalid link');
          setSub('This share link is missing or corrupted.');
          setError('No share payload in URL.');
          return;
        }
        const snap = filesFromPayload(payload);
        setShareLabel(payload.type === 'folder' ? 'Shared folder' : 'Shared file');
        t = snap.title;
        files = snap.files;
        setSub(
          files.length
            ? 'This share decrypts locally in your browser. The server never receives the file key.'
            : 'This folder is empty.'
        );
      }
      if (!files.length) {
        setTitle(t);
        setItemCount(0);
        setTiles([]);
        return;
      }
      setTitle(t);
      setItemCount(files.length);
      setTiles(files.map((item) => ({ item })));

      for (let i = 0; i < files.length; i++) {
        if (cancelled) return;
        const item = files[i];
        const image = isImageMime(item.mime, item.name);
        const video = isVideoMime(item.mime, item.name);
        if (!image && !video) continue;
        try {
          const url = await previewObjectUrl(item);
          objectUrls.push(url);
          if (cancelled) return;
          setTiles((prev) =>
            prev.map((tile, idx) => (idx === i ? { ...tile, url } : tile))
          );
        } catch {
          if (cancelled) return;
          setTiles((prev) =>
            prev.map((tile, idx) => (idx === i ? { ...tile, failed: true } : tile))
          );
        }
      }
    })().catch((e) => {
      setError(e instanceof Error ? e.message : String(e));
    });

    return () => {
      cancelled = true;
      for (const u of objectUrls) URL.revokeObjectURL(u);
    };
  }, [loc.hash]);

  return (
    <div className="flex min-h-[100svh] min-h-[100dvh] flex-col bg-[var(--bg)] text-[var(--text)]">
      <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-[var(--border)] bg-[color-mix(in_oklch,var(--bg)_96%,transparent)] px-4 py-3.5 text-[var(--text)] sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex shrink-0 items-center leading-none text-[var(--text)] no-underline" aria-label="Aegis home">
          <AegisLogo variant="horizontal" className="!w-[clamp(5.35rem,7vw,6.8rem)]" />
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <Link to="/" className="text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--text)] no-underline transition-opacity duration-150 hover:opacity-55 motion-reduce:transition-none">
            Home
          </Link>
        </div>
      </header>


      <main className="mx-auto w-full max-w-[58rem] px-[clamp(1.15rem,4vw,2.5rem)] pb-20 pt-10 sm:pt-[clamp(3rem,7vw,5rem)]">
        <header className="grid max-w-[44rem] gap-3">
          <p className="mb-[0.15rem] text-[0.6875rem] uppercase tracking-[0.16em] text-[color-mix(in_oklch,var(--text-muted,#888)_80%,transparent)]">{shareLabel}</p>
          <h1 className="m-0 text-[clamp(2.25rem,5vw,4rem)] font-[250] leading-[0.98] tracking-[-0.055em]">{title}</h1>
          <div className="mt-1 flex flex-wrap gap-[0.45rem]" aria-label="Share details">
            <span className={VIEW_META_BADGE_CLASS}>{itemCount} item{itemCount === 1 ? '' : 's'}</span>
            <span className={VIEW_META_BADGE_CLASS}>{isLiveFolder ? 'Live folder' : 'Snapshot'}</span>
            <span className={VIEW_META_BADGE_CLASS}>Browser decrypt</span>
          </div>
          <p className="mt-1 max-w-[34rem] text-sm leading-[1.6] text-[color-mix(in_oklch,var(--text-muted,#888)_88%,var(--text,#fff))]">{sub}</p>
        </header>

        {error ? <div className="mt-6 text-sm text-[#e8a0a0]">{error}</div> : null}

        <div className="mt-[clamp(2rem,5vw,3rem)] grid grid-cols-1 items-start gap-4 sm:grid-cols-[repeat(auto-fill,minmax(min(100%,14rem),16rem))]">
          {tiles.map(({ item, url, failed }, index) => {
            const image = isImageMime(item.mime, item.name);
            const video = isVideoMime(item.mime, item.name);
            return (
              <article
                key={`${item.n}-${index}`}
                className={VIEW_TILE_CLASS}
                onClick={() => {
                  if (!url) {
                    if (!image && !video) {
                      void downloadShareItem(item).catch((err) =>
                        alert(
                          'Download failed: ' +
                            (err instanceof Error ? err.message : String(err))
                        )
                      );
                    }
                    return;
                  }
                  setLightbox({
                    url,
                    name: item.name,
                    kind: video ? 'video' : 'image',
                  });
                }}
              >
                <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-[#0f0f0f]">
                  {url && image ? (
                    <img className={VIEW_MEDIA_OBJECT_CLASS} src={url} alt="" loading="lazy" />
                  ) : url && video ? (
                    <>
                      <video className={VIEW_MEDIA_OBJECT_CLASS} src={url} muted playsInline preload="metadata" />
                      <span className="absolute bottom-2 left-2 bg-black/70 px-[0.42rem] py-[0.24rem] text-[0.5625rem] uppercase tracking-[0.1em] text-white">Video</span>
                    </>
                  ) : failed ? (
                    <span className={VIEW_PLACEHOLDER_CLASS}>Failed</span>
                  ) : image || video ? (
                    <span className={VIEW_PLACEHOLDER_CLASS}>…</span>
                  ) : (
                    <span className={VIEW_PLACEHOLDER_CLASS}>FILE</span>
                  )}
                </div>
                <div className="grid gap-3 border-t border-[var(--border,#2a2a2a)] p-[0.85rem]">
                  <div className="min-w-0">
                    <p className="m-0 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[0.8125rem] text-[color-mix(in_oklch,var(--text,#fff)_88%,transparent)]" title={item.name}>{shortName(item.name)}</p>
                    <p className="mt-[0.22rem] text-[0.6875rem] uppercase tracking-[0.08em] text-[color-mix(in_oklch,var(--text-muted,#888)_76%,transparent)]">{fileKindLabel(item)}</p>
                  </div>
                  <button
                    type="button"
                    className={VIEW_DOWNLOAD_BUTTON_CLASS}
                    onClick={(e) => {
                      e.stopPropagation();
                      void downloadShareItem(item).catch((err) =>
                        alert(
                          'Download failed: ' +
                            (err instanceof Error ? err.message : String(err))
                        )
                      );
                    }}
                  >
                    Download
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      <MediaLightbox state={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}
