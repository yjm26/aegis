import type { VercelRequest, VercelResponse } from '@vercel/node';
import { dbStatus, getLibrary } from './lib/db.js';

/**
 * Legacy folders API — READ only.
 * Mutations must go through authenticated POST /api/library.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  try {
    if (req.method === 'GET') {
      const owner = req.query.owner;
      if (!owner || typeof owner !== 'string') {
        return res.status(400).json({ error: 'Missing owner' });
      }
      const lib = await getLibrary(owner);
      return res.status(200).json({ folders: lib.folders, ...dbStatus() });
    }

    if (
      req.method === 'POST' ||
      req.method === 'PUT' ||
      req.method === 'PATCH' ||
      req.method === 'DELETE'
    ) {
      return res.status(410).json({
        error: 'Legacy folders mutations disabled',
        code: 'USE_LIBRARY_API',
        hint: 'Use authenticated POST /api/library (session or owner auth).',
        ...dbStatus(),
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Folders API error';
    console.error('folders API:', err);
    return res.status(500).json({ error: message, ...dbStatus() });
  }
}
