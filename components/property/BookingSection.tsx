import React from 'react';
import ReservationCard from '../booking/ReservationCard';
import { formatMoney } from '@/utils/pricing';

interface BookingSectionProps {
  price?: number;
  propertyId: string;
  discount?: string;
}

const BookingSection: React.FC<BookingSectionProps> = ({ price, propertyId, discount }) => {
  const hasValidPrice = typeof price === 'number' && !Number.isNaN(price) && price > 0;
  const discountPercent = Number(discount) || 0;

  return (
    <section
      aria-labelledby="booking-heading"
      className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl lg:p-6"
    >
      <h2 id="booking-heading" className="sr-only">
        Book this property
      </h2>

      <div className="pb-4 mb-5 border-b border-gray-200">
        {hasValidPrice ? (
          <p className="text-2xl font-bold text-gray-900">
            {formatMoney(price)}
            <span className="ml-1 text-base font-normal text-gray-600">/night</span>
          </p>
        ) : (
          <p
            role="alert"
            className="px-3 py-2 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50"
          >
            Price unavailable for this property right now.
          </p>
        )}
      </div>

      {hasValidPrice && (
        <ReservationCard price={price} propertyId={propertyId} discountPercent={discountPercent} />
      )}
    </section>
  );
};

export default BookingSection;
