'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bed, ShowerHead, Users } from 'lucide-react';
import { PropertyProps } from '@/interfaces/index';

interface CardProps {
  property: PropertyProps;
}

const Card: React.FC<CardProps> = ({ property }) => {
  const { name, address, rating, category, price, offers, image, discount } = property;

  const slug = name.replace(/\s+/g, '-').toLowerCase();

  const hasRating = typeof rating === 'number' && !Number.isNaN(rating);

  return (
    <Link
      href={`/property/${slug}`}
      className="block overflow-hidden transition-shadow duration-300 bg-white rounded-lg shadow-md hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
    >
      {/* Image Section */}
      <div className="relative">
        <Image
          src={image}
          alt={name}
          className="object-cover w-full h-48 rounded-t-lg"
          width={400}
          height={300}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
        />
        {discount && (
          <span className="absolute px-2 py-1 text-xs font-bold text-white bg-teal-500 rounded-full top-2 left-2">
            {discount}% OFF
          </span>
        )}
      </div>

      {/* Content Section */}
      <div className="relative p-4">
        {/* Categories  */}
        <div className="flex flex-wrap gap-1 mb-2">
          {category.map((cat, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full font-oxygen"
            >
              {cat}
            </span>
          ))}
        </div>
        {/* Name of the place */}
        <h3 className="pr-20 text-base font-semibold leading-tight text-gray-800 font-quicksand">
          {name}
        </h3>
        {/* Location */}
        <p className="pr-20 mt-1 text-xs text-gray-600 font-oxygen">
          {address.city}, {address.country}
        </p>
        {/* Pill for Bed, Shower, Occupants with icons */}
        <div className="flex items-center px-3 py-1 mt-3 space-x-3 bg-gray-100 rounded-full w-fit">
          <div className="flex items-center text-xs text-gray-600 font-oxygen">
            <Bed className="w-3 h-3 mr-1" aria-hidden="true" />
            {offers.bed}
          </div>
          <div className="flex items-center text-xs text-gray-600 font-oxygen">
            <ShowerHead className="w-3 h-3 mr-1" aria-hidden="true" />
            {offers.shower}
          </div>
          <div className="flex items-center text-xs text-gray-600 font-oxygen">
            <Users className="w-3 h-3 mr-1" aria-hidden="true" />
            {offers.occupants}
          </div>
        </div>
        {/* Rating and Price */}
        <div className="absolute flex flex-col items-end top-4 right-4">
          <span className="text-sm text-amber-500 font-oxygen">
            {hasRating ? `★ ${rating.toFixed(1)}` : 'New'}
          </span>
          <p className="mt-1 text-lg font-bold leading-tight text-gray-900 font-quicksand">
            ${price}
          </p>
          <p className="text-xs text-gray-500 font-oxygen">/night</p>
        </div>
      </div>
    </Link>
  );
};

export default Card;
