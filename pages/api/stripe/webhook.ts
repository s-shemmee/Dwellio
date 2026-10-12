import type { NextApiRequest, NextApiResponse } from 'next';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { confirmPaidBooking } from '@/lib/bookings';

export const config = { api: { bodyParser: false } };

const readRawBody = async (req: NextApiRequest): Promise<Buffer> => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers['stripe-signature'];
  if (!secret || typeof signature !== 'string') {
    return res.status(400).json({ message: 'Missing webhook configuration or signature.' });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await readRawBody(req), signature, secret);
  } catch {
    return res.status(400).json({ message: 'Invalid signature.' });
  }

  try {
    if (event.type === 'payment_intent.succeeded') {
      await confirmPaidBooking(event.data.object);
    }
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook handling failed:', err instanceof Error ? err.message : err);
    return res.status(500).json({ message: 'Webhook handler failed.' });
  }
}
