import Stripe from 'stripe';

let client: Stripe | undefined;

export const getStripe = (): Stripe => {
  if (client) return client;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set. See .env.example.');

  if (!key.startsWith('sk_test_') && process.env.STRIPE_ALLOW_LIVE !== 'true') {
    throw new Error('chill, this project only runs with Stripe test keys (sk_test_...) :).');
  }

  client = new Stripe(key);
  return client;
};
