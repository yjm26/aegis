import type { VercelRequest, VercelResponse } from '@vercel/node';

const mockShares: any[] = [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const share = {
      id: crypto.randomUUID(),
      share_token: Math.random().toString(36).substring(2, 15),
      ...req.body,
      created_at: new Date().toISOString(),
    };
    mockShares.push(share);
    return res.status(201).json(share);
  }

  if (req.method === 'GET') {
    const { token } = req.query;
    const share = mockShares.find(s => s.share_token === token);
    if (!share) return res.status(404).json({ error: 'Not found' });
    share.download_count = (share.download_count || 0) + 1;
    return res.json(share);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
