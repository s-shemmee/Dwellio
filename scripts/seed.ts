import { PROPERTYLISTINGSAMPLE } from '@/constants/index';
import { slugify } from '@/utils/slugify';
import { ensureIndexes, getDb, PropertyDoc, ReviewDoc } from '@/lib/db';
import { getClient } from '@/lib/mongodb';
 
async function main() {
  const db = await getDb();
  await ensureIndexes(db);
 
  const seen = new Set<string>();
  let reviewTotal = 0;
 
  for (const sample of PROPERTYLISTINGSAMPLE) {
    const slug = slugify(sample.name).toLowerCase();
    if (seen.has(slug)) throw new Error(`Two properties share the slug "${slug}"`);
    seen.add(slug);
 
    const { reviews = [], ...property } = sample;
 
    await db
      .collection<PropertyDoc>('properties')
      .replaceOne({ slug }, { ...property, slug }, { upsert: true });
 
    await db.collection<ReviewDoc>('reviews').deleteMany({ propertySlug: slug });
    if (reviews.length > 0) {
      await db
        .collection<ReviewDoc>('reviews')
        .insertMany(reviews.map((review) => ({ ...review, propertySlug: slug })));
      reviewTotal += reviews.length;
    }
  }
 
  console.log(`Seeded ${seen.size} properties and ${reviewTotal} reviews into "${db.databaseName}".`);
  await (await getClient()).close();
}
 
main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
