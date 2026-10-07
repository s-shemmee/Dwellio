import type { NextApiRequest, NextApiResponse } from 'next';
import { findPropertyBySlug } from '@/utils/properties';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const property = findPropertyBySlug(req.query.id);
  if (!property) {
    return res.status(404).json({ message: 'Property not found' });
  }

  return res.status(200).json(property.reviews ?? []);
}
