import type { VercelRequest, VercelResponse } from '@vercel/node';

// Mock database for now — replace with real PostgreSQL pool when DATABASE_URL is set
const mockDb: any[] = [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const { owner } = req.query;
    const files = mockDb.filter(f => f.owner_address === owner);
    return res.json(files);
  }

  if (req.method === 'POST') {
    const file = {
      id: crypto.randomUUID(),
      ...req.body,
      created_at: new Date().toISOString(),
    };
    mockDb.push(file);
    return res.status(201).json(file);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    const idx = mockDb.findIndex(f => f.id === id);
    if (idx >= 0) mockDb.splice(idx, 1);
    return res.status(204).end();
  }

  res.status(405).json({ error: 'Method not allowed' });
}
