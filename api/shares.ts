import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Legacy mock shares API — disabled.
 * Real shares are client-side URL fragments only (/view#…).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(410).json({
    error: 'Server-side share tokens disabled',
    code: 'FRAGMENT_SHARES_ONLY',
    hint: 'Share via client-generated /view#fragment links (keys never hit this API).',
  });
}
