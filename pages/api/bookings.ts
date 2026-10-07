import type { NextApiRequest, NextApiResponse } from 'next';
import { randomUUID } from 'crypto';
import { findPropertyBySlug } from '@/utils/properties';
import { calculateQuote, countNights, MAX_NIGHTS } from '@/utils/pricing';

type FieldErrors = Record<string, string>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[0-9\s().-]{7,20}$/;

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const body: Record<string, unknown> =
    typeof req.body === 'object' && req.body !== null ? req.body : {};

  const property = findPropertyBySlug(typeof body.propertyId === 'string' ? body.propertyId : undefined);
  if (!property) {
    return res.status(404).json({ message: 'Property not found' });
  }

  const errors: FieldErrors = {};

  // --- Contact + billing details ---
  const firstName = text(body.firstName);
  const lastName = text(body.lastName);
  const email = text(body.email);
  const phoneNumber = text(body.phoneNumber);

  if (!firstName || firstName.length > 80) errors.firstName = 'Please enter your first name.';
  if (!lastName || lastName.length > 80) errors.lastName = 'Please enter your last name.';
  if (!EMAIL.test(email) || email.length > 254) errors.email = 'Please enter a valid email address.';
  if (!PHONE.test(phoneNumber)) errors.phoneNumber = 'Please enter a valid phone number.';

  const billing = {
    streetAddress: text(body.streetAddress),
    city: text(body.city),
    state: text(body.state),
    zipCode: text(body.zipCode),
    country: text(body.country),
  };
  (Object.keys(billing) as (keyof typeof billing)[]).forEach((key) => {
    if (!billing[key] || billing[key].length > 120) {
      errors[key] = 'Please complete your billing address.';
    }
  });

  // --- Dates ---
  const checkIn = text(body.checkIn);
  const checkOut = text(body.checkOut);
  const nights = countNights(checkIn, checkOut);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  if (nights === null || nights < 1) {
    errors.dates = 'Please choose valid check-in and check-out dates.';
  } else if (nights > MAX_NIGHTS) {
    errors.dates = `Stays are limited to ${MAX_NIGHTS} nights.`;
  } else if (checkIn < yesterday) {
    errors.dates = "Check-in can't be in the past.";
  }

  if (!(property.price > 0)) {
    errors.property = 'This property is not available to book right now.';
  }

  const firstError = Object.values(errors)[0];
  if (firstError || nights === null) {
    return res.status(400).json({ message: firstError ?? 'Invalid booking request.', errors });
  }

  const quote = calculateQuote({
    price: property.price,
    nights,
    discountPercent: Number(property.discount) || 0,
  });

  return res.status(201).json({
    message: 'Booking confirmed!',
    booking: {
      id: randomUUID(),
      propertyName: property.name,
      checkIn,
      checkOut,
      quote,
    },
  });
}
