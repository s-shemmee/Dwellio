import type { Review } from '@/interfaces/index';
import { getDb, PropertyDoc, ReviewDoc } from '@/lib/db';

const noId = { projection: { _id: 0 } } as const;
const SLUG = /^[\w-]{1,100}$/;

export const listProperties = async (): Promise<PropertyDoc[]> => {
  const db = await getDb();
  const docs = await db.collection<PropertyDoc>('properties').find({}, noId).toArray();
  return docs as unknown as PropertyDoc[]; // _id is projected out
};

export const findPropertyBySlug = async (slug: unknown): Promise<PropertyDoc | null> => {
  if (typeof slug !== 'string' || !SLUG.test(slug)) return null;
  const db = await getDb();
  const doc = await db
    .collection<PropertyDoc>('properties')
    .findOne({ slug: slug.toLowerCase() }, noId);
  return doc as unknown as PropertyDoc | null;
};
 
export const listReviews = async (slug: string, limit = 4): Promise<Review[]> => {
  const db = await getDb();
  const docs = await db
    .collection<ReviewDoc>('reviews')
    .find({ propertySlug: slug }, { projection: { _id: 0, propertySlug: 0 } })
    .sort({ date: -1 })
    .limit(limit)
    .toArray();
  return docs as unknown as Review[];
};
