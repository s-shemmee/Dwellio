import { randomUUID } from 'crypto';
import { BookingDoc, getDb } from '@/lib/db';

export const PENDING_HOLD_MINUTES = 30;

export const isRangeAvailable = async (
  propertySlug: string,
  checkIn: string,
  checkOut: string,
): Promise<boolean> => {
  const db = await getDb();
  const clash = await db.collection<BookingDoc>('bookings').findOne(
    {
      propertySlug,
      checkIn: { $lt: checkOut },
      checkOut: { $gt: checkIn },
      $or: [{ status: 'confirmed' }, { status: 'pending', expiresAt: { $gt: new Date() } }],
    },
    { projection: { _id: 1 } },
  );
  return clash === null;
};
 
export const createPendingBooking = async (
  data: Omit<BookingDoc, 'reference' | 'status' | 'createdAt' | 'expiresAt'>,
): Promise<BookingDoc> => {
  const now = new Date();
  const booking: BookingDoc = {
    ...data,
    reference: randomUUID(),
    status: 'pending',
    createdAt: now,
    expiresAt: new Date(now.getTime() + PENDING_HOLD_MINUTES * 60_000),
  };
  const db = await getDb();
  await db.collection<BookingDoc>('bookings').insertOne({ ...booking });
  return booking;
};
