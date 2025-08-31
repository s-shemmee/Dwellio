import { PROPERTYLISTINGSAMPLE } from '@/constants/index';
import type { NextApiRequest, NextApiResponse } from 'next';

// Add default values for missing fields to each property
const properties = PROPERTYLISTINGSAMPLE.map(property => ({
  ...property,
  images: property.images || [property.image],
  description: property.description || 'No description available.',
  amenities: property.amenities || ['WiFi', 'Pool', 'Parking'],
  reviews: property.reviews || [
    { id: 1, comment: 'Great place!' },
    { id: 2, comment: 'Would stay again.' },
  ],
}));

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.status(200).json(properties);
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
