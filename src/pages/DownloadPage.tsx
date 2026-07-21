import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { parseShareFragment } from '../../scripts/share';
import { downloadShareItem } from '../../scripts/preview';
import type { ShareFileItem, SharePayload } from '../../scripts/types';
import AegisLogo from '../components/shared/AegisLogo';

function toItems(p: SharePayload): ShareFileItem[] {
  if (p.type === 'folder') return p.files || [];
  return [
    {
      a: p.a,
      n: p.n,
      k: p.k,
      name: p.name,
      mime: p.mime,
      size: p.size,
    },
  ];
}

const DOWNLOAD_PILL_CLASS =
  'rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-[0.68rem] uppercase tracking-[0.1em] text-white/62';

/**
 * Legacy /download route. single-file download or bounce to /view for albums.
 */
export default function DownloadPage() {
  const loc = useLocation();
  const nav = useNavigate();
  const [msg, setMsg] = useState('Preparing download…');
  const [err, setErr] = useState('');
  const [fileName, setFileName] = useState('Shared file');

  useEffect(() => {
    const hash = loc.hash || window.location.hash;
    const payload = parseShareFragment(hash);
    if (!payload) {
      setErr('Invalid or missing share link.');
      setMsg('Cannot download');
      setFileName('Invalid link');
      return;
    }
    if (payload.type === 'folder' && (payload.files?.length || 0) > 1) {
      nav(`/view${hash}`, { replace: true });
      return;
    }
    const items = toItems(payload);
    if (!items.length) {
      setErr('Nothing to download.');
      setFileName(payload.type === 'folder' ? payload.name || 'Empty folder' : 'Shared file');
      return;
    }
    (async () => {
      try {
        for (const item of items) {
          setFileName(item.name);
          setMsg('Downloading encrypted blob…');
          await downloadShareItem(item);
        }
        setMsg('Download ready. Check your downloads folder.');
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : String(e));
        setMsg('Download failed');
      }
    })();
  }, [loc.hash, nav]);

  return (
    <div className="flex min-h-[100svh] min-h-[100dvh] flex-col bg-[var(--bg)] text-[var(--text)]">
      <header className="flex items-center justify-between gap-4 border-b border-[var(--border)] bg-[color-mix(in_oklch,var(--bg)_94%,transparent)] px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex shrink-0 items-center leading-none text-[var(--text)] no-underline"
          aria-label="Aegis home"
        >
          <AegisLogo variant="horizontal" className="!w-[clamp(7.25rem,9vw,9rem)]" />
        </Link>
        <span className="text-[0.68rem] uppercase tracking-[0.12em] text-white/42">
          Secure download
        </span>
      </header>

      <main className="grid flex-1 place-items-center px-[clamp(1.15rem,4vw,2.75rem)] py-12">
        <section className="w-full max-w-[34rem] overflow-hidden rounded-[2rem] border border-white/8 bg-[radial-gradient(circle_at_10%_0%,oklch(0.34_0.05_190_/_0.18),transparent_18rem),radial-gradient(circle_at_92%_8%,oklch(0.32_0.035_250_/_0.16),transparent_16rem),rgba(255,255,255,0.014)] p-[clamp(1.25rem,4vw,2rem)] text-center shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
          <p className="m-0 text-[0.72rem] uppercase tracking-[0.18em] text-white/40">
            Encrypted blob download
          </p>
          <h1 className="m-0 mt-4 text-[clamp(2rem,5vw,3.35rem)] font-[260] leading-[1.02] tracking-[-0.055em] text-[var(--text)]">
            {msg}
          </h1>
          <p className="mx-auto mt-4 max-w-[25rem] break-words text-[0.9rem] leading-[1.55] text-white/52">
            {fileName}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2" aria-label="Download security details">
            <span className={DOWNLOAD_PILL_CLASS}>Browser decrypted</span>
            <span className={DOWNLOAD_PILL_CLASS}>Encrypted blob download</span>
            <span className={DOWNLOAD_PILL_CLASS}>URL fragment key</span>
          </div>

          <p className="mx-auto mt-6 max-w-[27rem] text-[0.86rem] leading-[1.65] text-white/50">
            The file key stays in the URL fragment and never gets sent to Aegis servers.
          </p>

          {err ? (
            <p className="m-0 mt-5 rounded-2xl border border-red-300/15 bg-red-950/20 px-4 py-3 text-[0.875rem] leading-[1.5] text-[#e8a0a0]" role="alert">
              {err}
            </p>
          ) : null}

          <Link
            to={`/view${loc.hash}`}
            className="mt-7 inline-flex min-h-11 items-center rounded-full border border-white/10 px-5 text-[0.72rem] uppercase tracking-[0.12em] text-[var(--text)] no-underline transition-[border-color,background,opacity] duration-150 hover:border-white/24 hover:bg-white/[0.04] motion-reduce:transition-none"
          >
            Open secure preview
          </Link>
        </section>
      </main>
    </div>
  );
}
