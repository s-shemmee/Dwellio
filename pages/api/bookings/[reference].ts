import type { NextApiRequest, NextApiResponse } from 'next';
import { confirmPaidBooking, getBookingByReference } from '@/lib/bookings';
import { findPropertyBySlug } from '@/lib/properties';
import { getStripe } from '@/lib/stripe';

const REFERENCE = /^[0-9a-f-]{36}$/i;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const reference = req.query.reference;
  if (typeof reference !== 'string' || !REFERENCE.test(reference)) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  try {
    let booking = await getBookingByReference(reference);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.status === 'pending' && booking.paymentIntentId) {
      try {
        const paymentIntent = await getStripe().paymentIntents.retrieve(booking.paymentIntentId);
        if (paymentIntent.status === 'succeeded') {
          await confirmPaidBooking(paymentIntent);
          booking = (await getBookingByReference(reference)) ?? booking;
        }
      } catch (err) {
        console.error('Payment status check failed:', err instanceof Error ? err.message : err);
      }
    }

    const property = await findPropertyBySlug(booking.propertySlug);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      reference: booking.reference,
      status: booking.status,
      propertyName: property?.name ?? 'Your stay',
      propertySlug: booking.propertySlug,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      nights: booking.nights,
      total: booking.quote.total,
      firstName: booking.guest.firstName,
    });
  } catch (err) {
    console.error('GET /api/bookings/[reference] failed:', err instanceof Error ? err.message : err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}
