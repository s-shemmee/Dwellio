import type { NextApiRequest, NextApiResponse } from 'next';
import { findPropertyBySlug } from '@/lib/properties';
import { createPendingBooking, isRangeAvailable, PENDING_HOLD_MINUTES } from '@/lib/bookings';
import { calculateQuote, countNights, MAX_NIGHTS } from '@/utils/pricing';

type FieldErrors = Record<string, string>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[0-9\s().-]{7,20}$/;

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const body: Record<string, unknown> =
      typeof req.body === 'object' && req.body !== null ? req.body : {};

    const property = await findPropertyBySlug(body.propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const errors: FieldErrors = {};

    const guest = {
      firstName: text(body.firstName),
      lastName: text(body.lastName),
      email: text(body.email).toLowerCase(),
      phoneNumber: text(body.phoneNumber),
      smsUpdates: body.smsUpdates === true,
    };
    if (!guest.firstName || guest.firstName.length > 80) errors.firstName = 'Please enter your first name.';
    if (!guest.lastName || guest.lastName.length > 80) errors.lastName = 'Please enter your last name.';
    if (!EMAIL.test(guest.email) || guest.email.length > 254) errors.email = 'Please enter a valid email address.';
    if (!PHONE.test(guest.phoneNumber)) errors.phoneNumber = 'Please enter a valid phone number.';

    const billingAddress = {
      streetAddress: text(body.streetAddress),
      apartment: text(body.apartment),
      city: text(body.city),
      state: text(body.state),
      zipCode: text(body.zipCode),
      country: text(body.country),
    };
    (['streetAddress', 'city', 'state', 'zipCode', 'country'] as const).forEach((key) => {
      if (!billingAddress[key] || billingAddress[key].length > 120) {
        errors[key] = 'Please complete your billing address.';
      }
    });
    if (billingAddress.apartment.length > 120) errors.apartment = 'This is too long.';

    const checkIn = text(body.checkIn);
    const checkOut = text(body.checkOut);
    const nights = countNights(checkIn, checkOut);
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10); // timezone slack

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

    if (!(await isRangeAvailable(property.slug, checkIn, checkOut))) {
      const message = 'Sorry, those dates are no longer available. Please choose different dates.';
      return res.status(409).json({ message, errors: { dates: message } });
    }

    const quote = calculateQuote({
      price: property.price,
      nights,
      discountPercent: Number(property.discount) || 0,
    });

    const booking = await createPendingBooking({
      propertySlug: property.slug,
      checkIn,
      checkOut,
      nights,
      guest,
      billingAddress,
      quote,
    });

    return res.status(201).json({
      message: `Dates held for ${PENDING_HOLD_MINUTES} minutes.`,
      booking: {
        id: booking.reference,
        propertyName: property.name,
        checkIn,
        checkOut,
        quote,
      },
    });
  } catch (err) {
    console.error('POST /api/bookings failed:', err); // message only; never log the body
    return res.status(500).json({ message: 'We couldn’t process your booking. Please try again.' });
  }
}
