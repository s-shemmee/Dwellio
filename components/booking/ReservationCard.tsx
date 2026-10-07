import React, { useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import {
  calculateQuote,
  countNights,
  formatMoney,
  MAX_NIGHTS,
  WEEKLY_DISCOUNT_MIN_NIGHTS,
} from '@/utils/pricing';

interface ReservationCardProps {
  price: number;
  propertyId: string;
  discountPercent?: number;
}

type Errors = { checkIn?: string; checkOut?: string };

const pad = (n: number) => String(n).padStart(2, '0');
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const addDays = (iso: string, days: number) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
};

const inputClasses =
  'w-full px-3 py-2.5 text-gray-900 bg-white border rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:border-teal-700';

const ReservationCard: React.FC<ReservationCardProps> = ({ price, propertyId, discountPercent = 0 }) => {
  const router = useRouter();
  const idPrefix = useId();
  const checkInRef = useRef<HTMLInputElement>(null);
  const checkOutRef = useRef<HTMLInputElement>(null);

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [today, setToday] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => setToday(todayISO()), []);

  const nights = checkIn && checkOut ? countNights(checkIn, checkOut) : null;

  const validate = (): Errors => {
    const errors: Errors = {};
    if (!checkIn) errors.checkIn = 'Choose a check-in date.';
    else if (today && checkIn < today) errors.checkIn = "Check-in can't be in the past.";

    if (!checkOut) errors.checkOut = 'Choose a check-out date.';
    else if (nights === null || nights < 1) errors.checkOut = 'Check-out must be after check-in.';
    else if (nights > MAX_NIGHTS) errors.checkOut = `Stays are limited to ${MAX_NIGHTS} nights.`;
    return errors;
  };

  const errors = showErrors ? validate() : {};
  const isValid = Object.keys(validate()).length === 0;
  const quote =
    isValid && nights !== null ? calculateQuote({ price, nights, discountPercent }) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);
    setSubmitError(null);

    const current = validate();
    if (current.checkIn) return void checkInRef.current?.focus();
    if (current.checkOut) return void checkOutRef.current?.focus();

    setSubmitting(true);
    try {
      await router.push({ pathname: '/booking', query: { propertyId, checkIn, checkOut } });
    } catch {
      setSubmitError('We couldn’t start your reservation. Please try again.');
      setSubmitting(false);
    }
  };

  const ids = {
    checkIn: `${idPrefix}-checkin`,
    checkOut: `${idPrefix}-checkout`,
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor={ids.checkIn} className="block mb-1.5 text-sm font-semibold text-gray-900">
          Check in
        </label>
        <input
          ref={checkInRef}
          id={ids.checkIn}
          type="date"
          value={checkIn}
          min={today || undefined}
          onChange={(e) => setCheckIn(e.target.value)}
          aria-invalid={Boolean(errors.checkIn)}
          aria-describedby={errors.checkIn ? `${ids.checkIn}-error` : undefined}
          className={`${inputClasses} ${errors.checkIn ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.checkIn && (
          <p id={`${ids.checkIn}-error`} className="mt-1 text-sm text-red-700">
            {errors.checkIn}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={ids.checkOut} className="block mb-1.5 text-sm font-semibold text-gray-900">
          Check out
        </label>
        <input
          ref={checkOutRef}
          id={ids.checkOut}
          type="date"
          value={checkOut}
          min={checkIn ? addDays(checkIn, 1) : today || undefined}
          onChange={(e) => setCheckOut(e.target.value)}
          aria-invalid={Boolean(errors.checkOut)}
          aria-describedby={errors.checkOut ? `${ids.checkOut}-error` : undefined}
          className={`${inputClasses} ${errors.checkOut ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.checkOut && (
          <p id={`${ids.checkOut}-error`} className="mt-1 text-sm text-red-700">
            {errors.checkOut}
          </p>
        )}
      </div>

      {/* Breakdown: announced politely when dates change the numbers. */}
      <div aria-live="polite" className="pt-1">
        {quote ? (
          <>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">
                  {formatMoney(price)} x {quote.nights} {quote.nights === 1 ? 'night' : 'nights'}
                </dt>
                <dd className="font-medium text-gray-900">{formatMoney(quote.subtotal)}</dd>
              </div>
              {quote.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">Weekly discount ({quote.discountPercent}%)</dt>
                  <dd className="font-medium text-gray-900">-{formatMoney(quote.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-600">Service fee</dt>
                <dd className="font-medium text-gray-900">{formatMoney(quote.serviceFee)}</dd>
              </div>
            </dl>
            <div className="flex justify-between pt-4 mt-4 border-t border-gray-200">
              <span className="text-gray-600">Total payment</span>
              <span className="font-semibold text-teal-700">{formatMoney(quote.total)}</span>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-600">
            Select your dates to see the total.
            {discountPercent > 0 && ` Stays of ${WEEKLY_DISCOUNT_MIN_NIGHTS}+ nights get ${discountPercent}% off.`}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        aria-busy={submitting}
        className="w-full px-4 py-3 font-medium text-white bg-teal-700 rounded-lg hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-800 focus-visible:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {submitting ? 'Reserving...' : 'Reserve now'}
      </button>

      {submitError && (
        <p role="alert" className="px-3 py-2 text-sm text-red-700 border border-red-200 rounded-md bg-red-50">
          {submitError}
        </p>
      )}
    </form>
  );
};

export default ReservationCard;
