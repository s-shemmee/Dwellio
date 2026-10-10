import type { NextApiRequest, NextApiResponse } from 'next';
import { findPropertyBySlug } from '@/lib/properties';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const property = await findPropertyBySlug(req.query.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    return res.status(200).json({
      ...property,
      images: property.images?.length ? property.images : [property.image],
    });
  } catch (err) {
    console.error('GET /api/properties/[id] failed:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}
