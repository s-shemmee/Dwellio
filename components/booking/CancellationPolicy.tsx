import React from 'react';

interface CancellationPolicyProps {
  checkIn?: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const formatDay = (date: Date, withYear = false) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    ...(withYear ? { year: 'numeric' as const } : {}),
    timeZone: 'UTC',
  }).format(date);

const CancellationPolicy: React.FC<CancellationPolicyProps> = ({ checkIn }) => {
  const parsed = checkIn && ISO_DATE.test(checkIn) ? new Date(`${checkIn}T00:00:00Z`) : null;
  const checkInDate = parsed && !Number.isNaN(parsed.getTime()) ? parsed : null;
  const freeUntil = checkInDate ? new Date(checkInDate.getTime() - 86_400_000) : null;

  return (
    <>
      <section
        aria-labelledby="cancellation-heading"
        className="pt-8 mt-8 border-t border-gray-200"
      >
        <h2 id="cancellation-heading" className="text-2xl font-semibold text-gray-900">
          Cancellation policy
        </h2>
        <p className="mt-4 text-lg text-gray-700">
          {checkInDate && freeUntil ? (
            <>
              <strong className="font-semibold text-gray-900">
                Free cancellation before {formatDay(freeUntil)}.
              </strong>{' '}
              Cancel before check-in on {formatDay(checkInDate)} for a partial refund.
            </>
          ) : (
            <>
              <strong className="font-semibold text-gray-900">
                Free cancellation until 24 hours before check-in.
              </strong>{' '}
              Cancel before check-in for a partial refund.
            </>
          )}
        </p>
      </section>

      <section aria-labelledby="rules-heading" className="pt-8 mt-8 border-t border-gray-200">
        <h2 id="rules-heading" className="text-2xl font-semibold text-gray-900">
          Ground rules
        </h2>
        <p className="mt-4 text-lg text-gray-700">
          We ask every guest to remember a few simple things about what makes a great guest.
        </p>
        <ul className="mt-4 space-y-1 text-lg text-gray-700 list-disc list-inside">
          <li>Follow the house rules</li>
          <li>Treat your Host’s home like your own</li>
        </ul>
      </section>
    </>
  );
};

export default CancellationPolicy;
