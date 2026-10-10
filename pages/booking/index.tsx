import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import BookingForm from '@/components/booking/BookingForm';
import OrderSummary from '@/components/booking/OrderSummary';
import CancellationPolicy from '@/components/booking/CancellationPolicy';
import { findPropertyBySlug } from '@/lib/properties';
import { slugify } from '@/utils/slugify';
import { calculateQuote, countNights, MAX_NIGHTS, Quote } from '@/utils/pricing';

interface BookingPageProps {
  propertyId: string;
  propertyName: string;
  image: string | null;
  rating: number | null;
  reviewCount: number | null;
  price: number;
  checkIn: string;
  checkOut: string;
  quote: Quote;
}

export const getServerSideProps: GetServerSideProps<BookingPageProps> = async ({ query }) => {
  const property = await findPropertyBySlug(query.propertyId);
  if (!property) return { notFound: true };

  const propertyId = slugify(property.name); 
  const backToProperty = {
    redirect: { destination: `/property/${propertyId}`, permanent: false },
  } as const;

  const { checkIn, checkOut } = query;
  if (typeof checkIn !== 'string' || typeof checkOut !== 'string') return backToProperty;

  const nights = countNights(checkIn, checkOut);
  if (nights === null || nights < 1 || nights > MAX_NIGHTS) return backToProperty;

  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  if (checkIn < yesterday) return backToProperty;

  if (!(property.price > 0)) return backToProperty;

  return {
    props: {
      propertyId,
      propertyName: property.name,
      image: property.image ?? null,
      rating: typeof property.rating === 'number' ? property.rating : null,
      reviewCount: typeof property.reviewCount === 'number' ? property.reviewCount : null,
      price: property.price,
      checkIn,
      checkOut,
      quote: calculateQuote({
        price: property.price,
        nights,
        discountPercent: Number(property.discount) || 0,
      }),
    },
  };
};

export default function BookingPage({
  propertyId,
  propertyName,
  image,
  rating,
  reviewCount,
  price,
  checkIn,
  checkOut,
  quote,
}: BookingPageProps) {
  return (
    <>
      <Head>
        <title>{`Confirm and pay | ${propertyName} | Dwellio`}</title>
        <meta name="robots" content="noindex" />
      </Head>

      {/* Booking bar */}
      <div>
        <div className="container px-4 mx-auto lg:px-6">
          <Link
            href={`/property/${propertyId}`}
            className="inline-flex items-center gap-2 py-4 -mb-px text-xl font-semibold text-teal-700 border-b-2 border-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
              className="w-5 h-5"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>
              Booking<span className="sr-only">: back to {propertyName}</span>
            </span>
          </Link>
        </div>
      </div>

      <div className="container px-4 py-8 mx-auto lg:px-6 lg:py-10">
        <h1 className="sr-only">Confirm and pay</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start">
          <BookingForm booking={{ propertyId, checkIn, checkOut }}>
            <CancellationPolicy checkIn={checkIn} />
          </BookingForm>

          <div className="lg:sticky lg:top-[calc(var(--header-height,8rem)+1rem)]">
            <OrderSummary
              propertyName={propertyName}
              image={image ?? undefined}
              rating={rating ?? undefined}
              reviewCount={reviewCount}
              price={price}
              checkIn={checkIn}
              checkOut={checkOut}
              quote={quote}
            />
          </div>
        </div>
      </div>
    </>
  );
}
