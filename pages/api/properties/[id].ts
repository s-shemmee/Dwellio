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
  const { id } = req.query;
  if (req.method === 'GET') {
    const property = properties.find(
      p => p.name.replace(/\s+/g, '-').toLowerCase() === String(id).toLowerCase()
    );
    if (property) {
      res.status(200).json(property);
    } else {
      res.status(404).json({ message: 'Property not found' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
