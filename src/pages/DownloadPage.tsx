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

/**
 * Legacy /download route. single-file download or bounce to /view for albums.
 */
export default function DownloadPage() {
  const loc = useLocation();
  const nav = useNavigate();
  const [msg, setMsg] = useState('Preparing download…');
  const [err, setErr] = useState('');

  useEffect(() => {
    const hash = loc.hash || window.location.hash;
    const payload = parseShareFragment(hash);
    if (!payload) {
      setErr('Invalid or missing share link.');
      setMsg('Cannot download');
      return;
    }
    if (payload.type === 'folder' && (payload.files?.length || 0) > 1) {
      nav(`/view${hash}`, { replace: true });
      return;
    }
    const items = toItems(payload);
    if (!items.length) {
      setErr('Nothing to download.');
      return;
    }
    (async () => {
      try {
        for (const item of items) {
          setMsg(`Downloading ${item.name}…`);
          await downloadShareItem(item);
        }
        setMsg('Done. Check your downloads folder.');
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : String(e));
        setMsg('Download failed');
      }
    })();
  }, [loc.hash, nav]);

  return (
    <div className="grid min-h-screen place-items-center bg-[var(--bg)] px-6 text-[var(--text)]">
      <div className="max-w-[26rem] text-center">
        <Link to="/" className="mb-6 inline-flex items-center leading-none text-[var(--text)] no-underline" aria-label="Aegis home">
          <AegisLogo variant="horizontal" className="!w-[clamp(5.35rem,7vw,6.8rem)]" />
        </Link>
        <h1 className="m-0 text-[clamp(1.75rem,3vw,2.25rem)] font-light leading-[1.1] tracking-[-0.03em] text-[var(--text)]">{msg}</h1>
        {err ? <p className="m-0 mt-4 text-[0.875rem] leading-[1.5] text-[#e8a0a0]">{err}</p> : null}
        <p className="m-0 mt-4 text-[0.8125rem] text-[var(--text-3)]">
          <Link to={`/view${loc.hash}`} className="text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--text)] no-underline transition-opacity duration-150 hover:opacity-55 motion-reduce:transition-none">
            Open preview instead
          </Link>
        </p>
      </div>
    </div>
  );
}
