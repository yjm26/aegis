import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  isShelbyConfigured,
  makeBlobName,
  uploadBlobToShelby,
} from './lib/shelby.js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '12mb',
    },
  },
};

/**
 * POST /api/upload
 * Body: { encryptedBase64, fileName, ownerAddress, fileSize? }
 *
 * Encrypts already done client-side. Backend relays ciphertext to Shelby
 * using service wallet (APTOS_PRIVATE_KEY).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!isShelbyConfigured()) {
      return res.status(503).json({
        error: 'Shelby upload not configured',
        code: 'MISSING_APTOS_PRIVATE_KEY',
        hint: 'Set APTOS_PRIVATE_KEY (testnet) on the server, then retry.',
      });
    }

    const { encryptedBase64, fileName, ownerAddress, fileSize } = req.body || {};
    if (!encryptedBase64 || !fileName || !ownerAddress) {
      return res.status(400).json({ error: 'Missing fields: encryptedBase64, fileName, ownerAddress' });
    }

    const blobData = Uint8Array.from(Buffer.from(encryptedBase64, 'base64'));
    const maxBytes = Number(process.env.MAX_UPLOAD_BYTES || 10 * 1024 * 1024);
    if (blobData.length > maxBytes) {
      return res.status(413).json({
        error: `Max encrypted payload ${Math.floor(maxBytes / (1024 * 1024))}MB`,
      });
    }

    const blobName = makeBlobName(String(ownerAddress), String(fileName));
    const result = await uploadBlobToShelby({ blobData, blobName });

    return res.status(200).json({
      success: true,
      storageAccount: result.storageAccount,
      blobName: result.blobName,
      // keep blobHash alias = blobName for older UI bits
      blobHash: result.blobName,
      ownerAddress,
      fileName,
      fileSize: fileSize ?? blobData.length,
      network: process.env.APTOS_NETWORK || 'testnet',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    console.error('Upload error:', err);
    return res.status(500).json({ error: message });
  }
}
