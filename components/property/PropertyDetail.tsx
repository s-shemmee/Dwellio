import React, { useEffect, useRef, useState } from 'react';
import { getAmenityIcon } from '@/utils/amenityIcons';
import Image from 'next/image';
import { PropertyProps } from '@/interfaces/index';
import { slugify } from '@/utils/slugify';
import BookingSection from '@/components/property/BookingSection';
import ReviewSection from './ReviewSection';
import Avatar from '@/components/common/Avatar';

interface PropertyDetailProps {
  property: PropertyProps;
}

const sections = [
  { id: 'description', label: 'Description' },
  { id: 'amenities', label: 'What we offer' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'host', label: 'About host' },
];

const formatDate = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  }).format(date);
};

const SafeImage: React.FC<{
  src?: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  decorative?: boolean;
  position?: string;
}> = ({ src, alt, sizes, priority, decorative, position }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    if (decorative) {
      return <div aria-hidden="true" className="w-full h-full bg-gray-100" />;
    }

    return (
      <div
        role="img"
        aria-label={`${alt} (image unavailable)`}
        className="flex items-center justify-center w-full h-full text-sm text-gray-600 bg-gray-100"
      >
        Image unavailable
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={decorative ? '' : alt}
      aria-hidden={decorative || undefined}
      fill
      sizes={sizes}
      priority={priority}
      className="object-cover"
      style={position ? { objectPosition: position } : undefined}
      onError={() => setFailed(true)}
    />
  );
};

const Icon: React.FC<{ path: string; className?: string }> = ({
  path,
  className,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    className={className ?? 'w-4 h-4'}
  >
    <path d={path} />
  </svg>
);

const ICONS = {
  star: 'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21.1 7 14.2 2 9.3l6.9-1z',
  pin: 'M12 21s-7-6.2-7-11a7 7 0 1114 0c0 4.8-7 11-7 11zm0-8.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  heart:
    'M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 000-7.8z',
  share: 'M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4-4 4M12 2v13',
  bed: 'M3 18v-8a2 2 0 012-2h14a2 2 0 012 2v8M3 14h18M3 18v2m18-2v2M7 8V6h4v2',
  bath: 'M4 12h16v3a4 4 0 01-4 4H8a4 4 0 01-4-4v-3zm2 0V6a2 2 0 014 0M7 19l-1 2m11-2l1 2',
  guests:
    'M17 20v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2m14-9a3 3 0 100-6M21 20v-2a4 4 0 00-3-3.9M10 11a3 3 0 100-6 3 3 0 000 6z',
  user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
};

const PropertyDetail: React.FC<PropertyDetailProps> = ({
  property: rawProperty,
}) => {
  const property = rawProperty;

  const [activeSection, setActiveSection] = useState('description');
  const [descExpanded, setDescExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState('');
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const els = sections
      .map((section) => document.getElementById(section.id))
      .filter((el): el is HTMLElement => el !== null);

    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const topMost = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top,
          )[0];

        if (topMost) setActiveSection(topMost.target.id);
      },
      { rootMargin: '-20% 0px -60% 0px' },
    );

    els.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!status) return;

    const timer = window.setTimeout(() => setStatus(''), 3500);
    return () => window.clearTimeout(timer);
  }, [status]);

  if (!property) {
    return (
      <div
        role="alert"
        className="container p-6 mx-auto my-8 text-center text-red-700 border border-red-200 rounded-lg bg-red-50"
      >
        <p className="font-semibold">
          We couldn&apos;t load this property.
        </p>
        <p className="mt-1 text-sm">
          Please go back and try again.
        </p>
      </div>
    );
  }

  const handleShare = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title: property.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        setStatus('Link copied to clipboard.');
      }
    } catch (err) {
      if ((err as DOMException)?.name !== 'AbortError') {
        setStatus(
          "Couldn't share this page. Copy the link from your address bar.",
        );
      }
    }
  };

  const handleSave = () => {
    setSaved((prev) => !prev);
    setStatus(saved ? 'Removed from saved.' : 'Saved.');
  };

  const rating =
    typeof property.rating === 'number' &&
    !Number.isNaN(property.rating)
      ? property.rating
      : null;

  const allImages = [
    property.image,
    ...(property.images ?? []),
  ].filter(
    (src, index, array): src is string =>
      Boolean(src) && array.indexOf(src) === index,
  );

  const mainImage = allImages[0];

  const reusePositions = ['50% 30%', '20% 60%', '80% 60%'];

  const secondary = mainImage
    ? [0, 1, 2].map((index) => ({
        src: allImages[index + 1] ?? mainImage,
        reused: !allImages[index + 1],
        position: reusePositions[index],
      }))
    : [];

  const published = formatDate(property.publishedAt);
  const description = property.description?.trim();
  const isLongDescription = (description?.length ?? 0) > 400;

  const location = [
    property.address?.city,
    property.address?.state,
    property.address?.country,
  ]
    .filter(Boolean)
    .join(', ');

  const stats = [
    {
      icon: ICONS.bed,
      label: `${property.offers?.bed ?? '—'} ${
        Number(property.offers?.bed) === 1 ? 'Bedroom' : 'Bedrooms'
      }`,
    },
    {
      icon: ICONS.bath,
      label: `${property.offers?.shower ?? '—'} ${
        Number(property.offers?.shower) === 1 ? 'Bathroom' : 'Bathrooms'
      }`,
    },
    {
      icon: ICONS.guests,
      label: `${property.offers?.occupants ?? '—'} guests`,
    },
  ];

  const actionBtn =
    'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-full hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2';

  return (
    <div className="container p-4 mx-auto lg:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 lg:text-4xl">
            {property.name}
          </h1>

          <div className="flex flex-wrap items-center text-gray-600 gap-x-5 gap-y-1">
            {rating !== null && (
              <span className="inline-flex items-center gap-1.5">
                <Icon
                  path={ICONS.star}
                  className="w-5 h-5 text-amber-500 fill-amber-500"
                />
                <span className="font-semibold text-gray-900">
                  <span className="sr-only">Rated </span>
                  {rating}
                  <span className="sr-only"> out of 5</span>
                </span>

                {typeof property.reviewCount === 'number' && (
                  <span>({property.reviewCount} reviews)</span>
                )}
              </span>
            )}

            {location && (
              <span className="inline-flex items-center gap-1.5">
                <Icon
                  path={ICONS.pin}
                  className="w-4 h-4 text-gray-900"
                />
                {location}
              </span>
            )}

            {property.host?.name && (
              <span className="inline-flex items-center gap-1.5">
                <Icon
                  path={ICONS.user}
                  className="w-4 h-4 text-gray-900"
                />
                <span className="sr-only">Hosted by </span>
                {property.host.name}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            aria-pressed={saved}
            className={actionBtn}
          >
            <Icon
              path={ICONS.heart}
              className={`w-4 h-4 ${
                saved ? 'fill-red-500 text-red-500' : ''
              }`}
            />
            Save
          </button>

          <button
            type="button"
            onClick={handleShare}
            className={actionBtn}
          >
            <Icon path={ICONS.share} />
            Share
          </button>
        </div>

        <p
          role="status"
          aria-live="polite"
          className="w-full text-sm text-gray-600 empty:hidden"
        >
          {status}
        </p>
      </div>

      <div className="relative mb-6">
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-4 lg:grid-rows-2 lg:h-104">
          <div className="relative h-64 overflow-hidden rounded-xl sm:h-80 lg:h-auto lg:col-span-2 lg:row-span-2">
            <SafeImage
              src={mainImage}
              alt={`${property.name}, main photo`}
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>

          {secondary.map((slot, index) => (
            <div
              key={index}
              className={`relative hidden overflow-hidden rounded-xl lg:block ${
                index === 0 ? 'lg:col-span-2' : 'lg:col-span-1'
              }`}
            >
              <SafeImage
                src={slot.src}
                alt={`${property.name}, photo ${index + 2}`}
                sizes="(max-width: 1024px) 0px, 25vw"
                decorative={slot.reused}
                position={slot.reused ? slot.position : undefined}
              />
            </div>
          ))}
        </div>

        {allImages.length > 1 && (
          <button
            type="button"
            onClick={() => dialogRef.current?.showModal()}
            className="absolute px-5 py-2 text-sm font-medium text-gray-900 rounded-full shadow bottom-4 right-4 bg-white/95 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
          >
            Show all photos
            <span className="sr-only"> ({allImages.length})</span>
          </button>
        )}
      </div>

      <dialog
        ref={dialogRef}
        aria-label={`All photos of ${property.name}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            dialogRef.current?.close();
          }
        }}
        className="w-full max-w-5xl p-0 rounded-xl backdrop:bg-black/70"
      >
        <div className="p-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-end mb-3">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="px-4 py-2 text-sm font-medium text-gray-900 border border-gray-300 rounded-full hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {allImages.map((src, index) => (
              <div
                key={src}
                className="relative overflow-hidden rounded-lg aspect-4/3"
              >
                <SafeImage
                  src={src}
                  alt={`${property.name}, photo ${
                    index + 1
                  } of ${allImages.length}`}
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
            ))}
          </div>
        </div>
      </dialog>

      <ul
        className="flex flex-wrap gap-2 mb-8"
        aria-label="Property summary"
      >
        {stats.map((stat) => (
          <li
            key={stat.label}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs text-gray-800 border border-gray-300 rounded-full"
          >
            <Icon path={stat.icon} className="w-4 h-4" />
            {stat.label}
          </li>
        ))}

        {(property.category ?? []).map((category) => (
          <li
            key={category}
            className="px-3 py-1.5 text-xs text-gray-700 bg-gray-100 rounded-full"
          >
            {category}
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <nav
            aria-label="Property sections"
            className="flex items-center justify-between gap-6 border-b border-gray-200"
          >
            <ul className="flex gap-6 overflow-x-auto sm:gap-8">
              {sections.map((section) => {
                const isActive = activeSection === section.id;

                return (
                  <li key={section.id} className="shrink-0">
                    <a
                      href={`#${section.id}`}
                      aria-current={isActive ? 'true' : undefined}
                      onClick={() => setActiveSection(section.id)}
                      className={`block py-4 text-sm font-medium border-b-2 rounded-t focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 ${
                        isActive
                          ? 'border-teal-700 text-teal-700'
                          : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                      }`}
                    >
                      {section.label}
                    </a>
                  </li>
                );
              })}
            </ul>

            {published && (
              <span className="hidden text-sm text-gray-600 md:block shrink-0">
                Published {published}
              </span>
            )}
          </nav>

          <section
            id="description"
            aria-labelledby="description-heading"
            className="py-8 scroll-mt-[calc(var(--header-height,8rem)+1rem)]"
          >
            <h2 id="description-heading" className="sr-only">
              Description
            </h2>

            {description ? (
              <>
                <p
                  id="description-text"
                  className={`leading-relaxed text-gray-800 whitespace-pre-line ${
                    descExpanded || !isLongDescription
                      ? ''
                      : 'line-clamp-6'
                  }`}
                >
                  {description}
                </p>

                {isLongDescription && (
                  <button
                    type="button"
                    onClick={() => setDescExpanded((value) => !value)}
                    aria-expanded={descExpanded}
                    aria-controls="description-text"
                    className="mt-4 font-medium text-teal-700 rounded hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
                  >
                    {descExpanded ? 'Show less' : 'Read more'}
                  </button>
                )}
              </>
            ) : (
              <p className="text-gray-600">
                No description available for this property yet.
              </p>
            )}
          </section>

          <section
            id="amenities"
            aria-labelledby="amenities-heading"
            className="py-8 border-t border-gray-200 scroll-mt-[calc(var(--header-height,8rem)+1rem)]"
          >
            <h2
              id="amenities-heading"
              className="mb-2 text-2xl font-semibold text-gray-900"
            >
              What this place offers
            </h2>

            {property.amenities &&
            property.amenities.length > 0 ? (
              <>
                <p className="mb-6 text-gray-700">
                  Each home is fully equipped to meet your needs, with
                  ample space and privacy.
                </p>

                <ul className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                  {property.amenities.map((amenity: string) => {
                    const iconSrc = getAmenityIcon(amenity);

                    return (
                      <li key={amenity} className="flex items-center gap-3 text-lg text-gray-900">
                        {iconSrc ? (
                          <Image
                            src={iconSrc}
                            alt=""
                            width={20}
                            height={20}
                            className="object-contain w-5 h-5 shrink-0"
                          />
                        ) : (
                          <span aria-hidden="true" className="w-5 h-5 shrink-0" />
                        )}
                        <span>{amenity}</span>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <p className="text-gray-600">
                No amenities listed for this property yet.
              </p>
            )}
          </section>

          <section
            id="reviews"
            aria-labelledby="reviews-heading"
            className="py-8 border-t border-gray-200 scroll-mt-[calc(var(--header-height,8rem)+1rem)]"
          >
            <h2 id="reviews-heading" className="sr-only">
              Reviews
            </h2>

            <ReviewSection
              propertyId={slugify(property.name)}
              totalCount={property.reviewCount}
              averageRating={property.rating}
            />
          </section>

          <section
            id="host"
            aria-labelledby="host-heading"
            className="py-8 border-t border-gray-200 scroll-mt-[calc(var(--header-height,8rem)+1rem)]"
          >
            <h2
              id="host-heading"
              className="mb-4 text-2xl font-semibold text-gray-900"
            >
              About the host
            </h2>

            {property.host ? (
              <div className="flex items-start gap-4">
                <Avatar src={property.host.avatar} name={property.host.name} size={64} />

                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {property.host.name}
                  </h3>

                  {property.host.hostingSince && (
                    <p className="text-gray-600">
                      {property.host.hostingSince}
                    </p>
                  )}

                  {property.host.bio && (
                    <p className="mt-2 text-gray-700">
                      {property.host.bio}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-600">
                Host details aren&apos;t available for this property yet.
              </p>
            )}
          </section>
        </div>

        <aside id="booking" aria-label="Booking" className="lg:col-span-1">
          <div className="lg:sticky lg:top-[calc(var(--header-height,8rem)+1rem)]">
            <BookingSection
              price={property.price}
              propertyId={slugify(property.name)}
              discount={property.discount}
            />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PropertyDetail;
