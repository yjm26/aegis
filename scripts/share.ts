/**
 * Share link format (v2):
 *   /pages/download.html#<storageAccount>|<blobName>|<keyBase64>
 * All three parts are encodeURIComponent'd, joined by |.
 *
 * Legacy (v1): #blobHash:key  — still parsed where possible.
 */

export function generateShareLink(
  storageAccount: string,
  blobName: string,
  key: string
): string {
  const base = window.location.origin + '/pages/download.html';
  const frag = [
    encodeURIComponent(storageAccount),
    encodeURIComponent(blobName),
    encodeURIComponent(key),
  ].join('|');
  return `${base}#${frag}`;
}

/** @deprecated use generateShareLink(account, blobName, key) */
export function generateShareLinkLegacy(blobHash: string, key: string): string {
  return generateShareLink('unknown', blobHash, key);
}

export interface SharePayload {
  storageAccount: string;
  blobName: string;
  key: string;
}

export function parseShareFragment(hash: string): SharePayload | null {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!raw) return null;

  // v2: a|n|k
  if (raw.includes('|')) {
    const parts = raw.split('|');
    if (parts.length < 3) return null;
    const [a, n, ...rest] = parts;
    const k = rest.join('|'); // key shouldn't have | but be safe
    try {
      return {
        storageAccount: decodeURIComponent(a),
        blobName: decodeURIComponent(n),
        key: decodeURIComponent(k),
      };
    } catch {
      return null;
    }
  }

  // v1 legacy: hash:key (single colon split from right? first colon)
  if (raw.includes(':')) {
    const idx = raw.indexOf(':');
    const blobName = decodeURIComponent(raw.slice(0, idx));
    const key = decodeURIComponent(raw.slice(idx + 1));
    return {
      storageAccount: '', // unknown — download will fail unless set
      blobName,
      key,
    };
  }

  return null;
}
