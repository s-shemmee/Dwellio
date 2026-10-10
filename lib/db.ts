import type { Db } from 'mongodb';
import type { PropertyProps, Review } from '@/interfaces/index';
import type { Quote } from '@/utils/pricing';
import { getClient } from '@/lib/mongodb';

export const getDb = async (): Promise<Db> =>
  (await getClient()).db(process.env.MONGODB_DB ?? 'dwellio');

/* ------------------------------ documents ------------------------------ */

export interface PropertyDoc extends Omit<PropertyProps, 'reviews'> {
  slug: string;
}

export interface ReviewDoc extends Review {
  propertySlug: string;
}

export interface BookingDoc {
  reference: string;
  propertySlug: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    smsUpdates: boolean;
  };
  billingAddress: {
    streetAddress: string;
    apartment: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  quote: Quote;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
  expiresAt?: Date;
}

/* ------------------------------- indexes -------------------------------- */

export const ensureIndexes = async (db: Db) => {
  await db.collection('properties').createIndex({ slug: 1 }, { unique: true });
  await db.collection('reviews').createIndex({ propertySlug: 1, date: -1 });
  await db.collection('bookings').createIndex({ reference: 1 }, { unique: true });
  await db.collection('bookings').createIndex({ propertySlug: 1, checkIn: 1, checkOut: 1 });
  await db.collection('bookings').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
};
