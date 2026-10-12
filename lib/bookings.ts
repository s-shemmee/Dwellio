import { randomUUID } from 'crypto';
import type Stripe from 'stripe';
import { BookingDoc, getDb } from '@/lib/db';
import { getStripe } from '@/lib/stripe';

export const PENDING_HOLD_MINUTES = 30;

export const newReference = () => randomUUID();

const bookingsCollection = async () => (await getDb()).collection<BookingDoc>('bookings');

export const isRangeAvailable = async (
  propertySlug: string,
  checkIn: string,
  checkOut: string,
  excludeReference?: string,
): Promise<boolean> => {
  const bookings = await bookingsCollection();
  const clash = await bookings.findOne(
    {
      propertySlug,
      checkIn: { $lt: checkOut },
      checkOut: { $gt: checkIn },
      ...(excludeReference ? { reference: { $ne: excludeReference } } : {}),
      $or: [{ status: 'confirmed' }, { status: 'pending', expiresAt: { $gt: new Date() } }],
    },
    { projection: { _id: 1 } },
  );
  return clash === null;
};

export const createPendingBooking = async (
  data: Omit<BookingDoc, 'status' | 'createdAt' | 'expiresAt' | 'paymentIntentId'>,
): Promise<BookingDoc> => {
  const now = new Date();
  const booking: BookingDoc = {
    ...data,
    status: 'pending',
    createdAt: now,
    expiresAt: new Date(now.getTime() + PENDING_HOLD_MINUTES * 60_000),
  };
  await (await bookingsCollection()).insertOne({ ...booking });
  return booking;
};

export const attachPaymentIntent = async (reference: string, paymentIntentId: string) => {
  await (await bookingsCollection()).updateOne({ reference }, { $set: { paymentIntentId } });
};

export const deleteBooking = async (reference: string) => {
  await (await bookingsCollection()).deleteOne({ reference });
};

export const getBookingByReference = async (reference: string): Promise<BookingDoc | null> => {
  const doc = await (await bookingsCollection()).findOne({ reference }, { projection: { _id: 0 } });
  return doc as unknown as BookingDoc | null;
};

const refund = async (paymentIntentId: string) => {
  try {
    await getStripe().refunds.create({ payment_intent: paymentIntentId });
  } catch (err) {
    // Already refunded (webhook replay) or a real failure: log, never throw.
    console.error('Refund failed for', paymentIntentId, err instanceof Error ? err.message : err);
  }
};

export const confirmPaidBooking = async (
  paymentIntent: Stripe.PaymentIntent,
): Promise<'confirmed' | 'already-confirmed' | 'refunded'> => {
  const bookings = await bookingsCollection();
  const booking = await bookings.findOne({ paymentIntentId: paymentIntent.id });

  // The hold expired and was cleaned up before the payment arrived.
  if (!booking || booking.status === 'cancelled') {
    await refund(paymentIntent.id);
    return 'refunded';
  }
  if (booking.status === 'confirmed') return 'already-confirmed';

  // The hold may have lapsed and someone else taken the dates meanwhile.
  const stillFree = await isRangeAvailable(
    booking.propertySlug,
    booking.checkIn,
    booking.checkOut,
    booking.reference,
  );
  if (!stillFree) {
    await bookings.updateOne(
      { reference: booking.reference },
      { $set: { status: 'cancelled' }, $unset: { expiresAt: '' } },
    );
    await refund(paymentIntent.id);
    return 'refunded';
  }

  await bookings.updateOne(
    { reference: booking.reference, status: 'pending' },
    { $set: { status: 'confirmed' }, $unset: { expiresAt: '' } },
  );
  return 'confirmed';
};
