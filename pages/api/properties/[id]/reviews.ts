import type { NextApiRequest, NextApiResponse } from 'next';

const reviews: { [key: string]: { id: number; comment: string }[] } = {
  'villa-arrecife-beach-house': [
    { id: 1, comment: 'Amazing stay! Highly recommend.' },
    { id: 2, comment: 'Beautiful property and great host.' },
  ],
  'amazing-pool-apartment': [
    { id: 1, comment: 'Loved the pool and location.' },
    { id: 2, comment: 'Clean and comfortable.' },
  ],
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (req.method === 'GET') {
    const key = String(id).toLowerCase();
    res.status(200).json(reviews[key] || []);
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
