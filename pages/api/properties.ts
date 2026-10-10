import type { NextApiRequest, NextApiResponse } from 'next';
import { listProperties } from '@/lib/properties';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const properties = await listProperties();
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json(properties);
  } catch (err) {
    console.error('GET /api/properties failed:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}
