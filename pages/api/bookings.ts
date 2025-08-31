import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Simulate booking creation
    res.status(201).json({ message: 'Booking confirmed!' });
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
