import React, { useState } from 'react';
import Image from 'next/image';
import { formatMoney, Quote } from '@/utils/pricing';

interface OrderSummaryProps {
  propertyName: string;
  image?: string;
  rating?: number;
  reviewCount?: number | null;
  checkIn: string;
  checkOut: string;
  price: number;
  quote: Quote;
}

const formatDay = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${iso}T00:00:00Z`));

const pill = 'px-2.5 py-1 text-sm text-gray-700 bg-gray-100 rounded';

const OrderSummary: React.FC<OrderSummaryProps> = ({
  propertyName,
  image,
  rating,
  reviewCount,
  checkIn,
  checkOut,
  price,
  quote,
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const nightsLabel = `${quote.nights} ${quote.nights === 1 ? 'night' : 'nights'}`;

  return (
    <section
      aria-labelledby="order-summary-heading"
      className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl sm:p-6"
    >
      <h2 id="order-summary-heading" className="mb-5 text-2xl font-semibold text-gray-900">
        Review Order Details
      </h2>

      <div className="relative overflow-hidden bg-gray-100 aspect-3/2 rounded-xl">
        {image && !imageFailed && (
          <Image
            src={image}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover"
            onError={() => setImageFailed(true)}
          />
        )}
      </div>

      <h3 className="mt-4 text-2xl font-semibold text-gray-900">{propertyName}</h3>

      {typeof rating === 'number' && (
        <p className="flex items-center gap-1.5 mt-1 text-gray-800">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
            className="w-5 h-5 text-amber-500 fill-amber-500"
          >
            <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21.1 7 14.2 2 9.3l6.9-1z" />
          </svg>
          <span>
            <span className="sr-only">Rated </span>
            {rating}
          </span>
          {typeof reviewCount === 'number' && (
            <span className="text-gray-600">({reviewCount} reviews)</span>
          )}
        </p>
      )}

      <ul className="flex flex-wrap gap-2 mt-3" aria-label="Your stay">
        <li className={pill}>
          {formatDay(checkIn)} – {formatDay(checkOut)}
        </li>
        <li className={pill}>{nightsLabel}</li>
      </ul>

      <dl className="mt-6 space-y-3 text-lg">
        <div className="flex justify-between gap-4">
          <dt className="text-gray-600">
            {formatMoney(price)} x {nightsLabel}
          </dt>
          <dd className="font-medium text-gray-900">{formatMoney(quote.subtotal)}</dd>
        </div>
        {quote.discount > 0 && (
          <div className="flex justify-between gap-4">
            <dt className="text-gray-600">Weekly discount ({quote.discountPercent}%)</dt>
            <dd className="font-medium text-gray-900">-{formatMoney(quote.discount)}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <dt className="text-gray-600">Service fee</dt>
          <dd className="font-medium text-gray-900">{formatMoney(quote.serviceFee)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 pt-4 mt-2 border-t border-gray-200">
          <dt className="text-gray-900">Grand Total</dt>
          <dd className="text-3xl font-bold text-gray-900">{formatMoney(quote.total)}</dd>
        </div>
      </dl>
    </section>
  );
};

export default OrderSummary;
