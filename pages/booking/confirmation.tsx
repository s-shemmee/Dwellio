import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';
import { formatMoney } from '@/utils/pricing';

interface BookingView {
  reference: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  propertyName: string;
  propertySlug: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  total: number;
  firstName: string;
}

type State =
  | { kind: 'loading' }
  | { kind: 'ready'; booking: BookingView }
  | { kind: 'not-found' }
  | { kind: 'error' };

const MAX_POLLS = 10;

const formatDay = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${iso}T00:00:00Z`));

const linkClasses =
  'inline-block px-5 py-2.5 font-medium text-white rounded-full bg-brand-dark hover:bg-brand-darker focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-darker focus-visible:ring-offset-2';

export default function BookingConfirmationPage() {
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!router.isReady) return;
    const reference = router.query.reference;
    if (typeof reference !== 'string') {
      setState({ kind: 'not-found' });
      return;
    }

    let cancelled = false;
    let polls = 0;
    let timer: number | undefined;

    const load = async () => {
      try {
        const { data } = await axios.get<BookingView>(
          `/api/bookings/${encodeURIComponent(reference)}`,
        );
        if (cancelled) return;
        setState({ kind: 'ready', booking: data });
        if (data.status === 'pending' && polls++ < MAX_POLLS) {
          timer = window.setTimeout(load, 2000);
        }
      } catch (err) {
        if (cancelled) return;
        setState(
          axios.isAxiosError(err) && err.response?.status === 404
            ? { kind: 'not-found' }
            : { kind: 'error' },
        );
      }
    };

    load();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [router.isReady, router.query.reference, reloadKey]);

  return (
    <>
      <Head>
        <title>Booking confirmation | Dwellio</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="container max-w-2xl px-4 py-12 mx-auto">
        {state.kind === 'loading' && (
          <p role="status" className="text-center text-gray-600">
            Loading your booking...
          </p>
        )}

        {state.kind === 'not-found' && (
          <div className="text-center">
            <h1 className="mb-2 text-2xl font-bold text-gray-900">Booking not found</h1>
            <p className="mb-6 text-gray-600">Check the link, or start a new booking.</p>
            <Link href="/" className={linkClasses}>
              Browse properties
            </Link>
          </div>
        )}

        {state.kind === 'error' && (
          <div role="alert" className="text-center">
            <h1 className="mb-2 text-2xl font-bold text-gray-900">We couldn’t load your booking</h1>
            <p className="mb-6 text-gray-600">Your payment is safe. Try again in a moment.</p>
            <button type="button" onClick={() => setReloadKey((k) => k + 1)} className={linkClasses}>
              Try again
            </button>
          </div>
        )}

        {state.kind === 'ready' && (
          <Details booking={state.booking} />
        )}
      </div>
    </>
  );
}

function Details({ booking }: { booking: BookingView }) {
  const rows: [string, string][] = [
    ['Property', booking.propertyName],
    ['Check-in', formatDay(booking.checkIn)],
    ['Check-out', formatDay(booking.checkOut)],
    ['Nights', String(booking.nights)],
    ['Total paid', formatMoney(booking.total)],
    ['Reference', booking.reference],
  ];

  const heading =
    booking.status === 'confirmed'
      ? `You’re booked, ${booking.firstName}!`
      : booking.status === 'pending'
        ? 'Confirming your payment...'
        : 'We couldn’t keep your dates';

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-gray-900">{heading}</h1>

      {booking.status === 'pending' && (
        <p role="status" className="mb-6 text-gray-700">
          Your payment went through. We’re finalising the booking, which usually takes a few seconds.
          This page updates by itself.
        </p>
      )}
      {booking.status === 'cancelled' && (
        <p role="alert" className="mb-6 text-gray-700">
          Someone else booked these dates first, so your payment has been refunded automatically.
          Refunds can take a few days to appear on your statement.
        </p>
      )}

      {booking.status !== 'cancelled' && (
        <dl className="mt-6 text-lg border-gray-200 divide-y divide-gray-200 border-y">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 py-3">
              <dt className="text-gray-600">{label}</dt>
              <dd className="font-medium text-right text-gray-900 break-all">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-8">
        <Link href="/" className={linkClasses}>
          Back to home
        </Link>
      </div>
    </div>
  );
}
