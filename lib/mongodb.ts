import { MongoClient } from 'mongodb';

declare global {
  // eslint-disable-next-line no-var
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

export const getClient = (): Promise<MongoClient> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Copy .env.example to .env.local and fill it in.');
  }
 
  if (process.env.NODE_ENV === 'development') {
    global.__mongoClientPromise ??= new MongoClient(uri).connect();
    return global.__mongoClientPromise;
  }
  // Production: module scope is reused between requests on a warm server.
  global.__mongoClientPromise ??= new MongoClient(uri).connect();
  return global.__mongoClientPromise;
};
