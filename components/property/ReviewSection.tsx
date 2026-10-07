import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import axios from 'axios';

interface Review {
  id: number | string;
  comment: string;
  author?: string;
  avatar?: string;
  yearsOnPlatform?: number;
  date?: string;
  tripType?: string;
  rating?: number;
}

interface ReviewSectionProps {
  propertyId: string;
  totalCount?: number;
  averageRating?: number;
}

const formatMonthYear = (value?: string) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(d);
};

const Avatar: React.FC<{ src?: string; name: string }> = ({ src, name }) => {
  const [failed, setFailed] = useState(false);
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <div className="relative overflow-hidden bg-gray-200 rounded-full w-14 h-14 shrink-0">
      {src && !failed ? (
        <Image
          src={src}
          alt=""
          fill
          sizes="56px"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex items-center justify-center w-full h-full text-lg font-semibold text-gray-700"
        >
          {initial}
        </span>
      )}
    </div>
  );
};

const ReviewSection: React.FC<ReviewSectionProps> = ({ propertyId, totalCount, averageRating }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`/api/properties/${propertyId}/reviews`, {
          signal: controller.signal,
        });
        if (!Array.isArray(response.data)) {
          throw new Error('Unexpected reviews response shape');
        }
        setReviews(response.data);
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error('Failed to fetch reviews:', err);
        setError('We couldn’t load reviews right now. Please try again in a moment.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchReviews();
    return () => controller.abort();
  }, [propertyId, reloadKey]);

  if (loading) {
    return (
      <div role="status" aria-live="polite" className="flex items-center gap-2 py-4 text-gray-600">
        <span
          className="w-4 h-4 border-2 border-gray-300 rounded-full animate-spin border-t-teal-600 motion-reduce:animate-none"
          aria-hidden="true"
        />
        Loading reviews...
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-col gap-3 px-4 py-3 text-red-700 border border-red-200 rounded-lg bg-red-50 sm:flex-row sm:items-center sm:justify-between"
      >
        <span>{error}</span>
        <button
          type="button"
          onClick={() => setReloadKey((k) => k + 1)}
          className="self-start px-3 py-1.5 text-sm font-medium text-red-800 bg-white border border-red-300 rounded-full hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2"
        >
          Try again
        </button>
      </div>
    );
  }

  if (reviews.length === 0) {
    return <p className="py-4 text-gray-600">No reviews yet. Be the first to share your stay.</p>;
  }

  // Average only from reviews that carry a numeric rating.
  const rated = reviews.filter((r) => typeof r.rating === 'number' && !Number.isNaN(r.rating));
  const computed =
    rated.length > 0 ? rated.reduce((sum, r) => sum + (r.rating as number), 0) / rated.length : null;
  const average =
    typeof averageRating === 'number' && !Number.isNaN(averageRating) ? averageRating : computed;
  const count = totalCount ?? reviews.length;

  return (
    <div>
      <p className="flex items-center gap-2 mb-8 text-2xl font-semibold text-gray-900">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
          className="w-7 h-7 text-amber-500 fill-amber-500"
        >
          <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21.1 7 14.2 2 9.3l6.9-1z" />
        </svg>
        {average !== null && (
          <span>
            <span className="sr-only">Average rating </span>
            {average.toFixed(2)}
          </span>
        )}
        <span className="text-lg font-normal text-gray-600">
          ({count} {count === 1 ? 'review' : 'reviews'})
        </span>
      </p>

      <ul className="grid grid-cols-1 gap-x-10 gap-y-10 md:grid-cols-2">
        {reviews.map((review) => {
          const name = review.author?.trim() || 'Guest';
          const when = formatMonthYear(review.date);
          const years = review.yearsOnPlatform;
          const meta = [when, review.tripType].filter(Boolean);

          return (
            <li key={review.id}>
              <article>
                <header className="flex items-center gap-4 mb-3">
                  <Avatar src={review.avatar} name={name} />
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{name}</h3>
                    {typeof years === 'number' && (
                      <p className="text-gray-600">
                        {years} {years === 1 ? 'year' : 'years'} on Dwellio
                      </p>
                    )}
                  </div>
                </header>

                {meta.length > 0 && (
                  <p className="mb-2 text-sm text-gray-600">{meta.join(' · ')}</p>
                )}
                <p className="leading-relaxed text-gray-800">{review.comment}</p>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ReviewSection;
