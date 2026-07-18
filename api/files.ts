import type { VercelRequest, VercelResponse } from '@vercel/node';
import { dbStatus, listFilesDb } from './lib/db.js';

/**
 * Legacy files API — READ only.
 * Mutations must go through authenticated POST /api/library.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  try {
    if (req.method === 'GET') {
      const { owner, folderId } = req.query;
      if (!owner || typeof owner !== 'string') {
        return res.status(400).json({ error: 'Missing owner' });
      }
      let folderFilter: string | null | undefined = undefined;
      if (typeof folderId === 'string') {
        folderFilter =
          folderId === '' || folderId === 'root' ? null : folderId;
      }
      const list = await listFilesDb(owner, folderFilter);
      // Never echo plain data-URL thumbs
      const safe = list.map((f) => ({
        ...f,
        thumbDataUrl:
          f.thumbDataUrl && f.thumbDataUrl.startsWith('bt1.')
            ? f.thumbDataUrl
            : undefined,
        // Do not expose encryptedKey on legacy public list — empty string
        encryptedKey: f.encryptedKey?.startsWith('bw1.')
          ? f.encryptedKey
          : f.encryptedKey
            ? '[redacted-use-library-api]'
            : '',
      }));
      return res.status(200).json(safe);
    }

    if (
      req.method === 'POST' ||
      req.method === 'PUT' ||
      req.method === 'PATCH' ||
      req.method === 'DELETE'
    ) {
      return res.status(410).json({
        error: 'Legacy files mutations disabled',
        code: 'USE_LIBRARY_API',
        hint: 'Use authenticated POST /api/library (session or owner auth).',
        ...dbStatus(),
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Files API error';
    console.error('files API:', err);
    return res.status(500).json({ error: message, ...dbStatus() });
  }
}
