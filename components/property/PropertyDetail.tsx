import React, { useState } from 'react';
import Image from 'next/image';
import { PropertyProps } from '@/interfaces/index';
import BookingSection from '@/components/property/BookingSection';
import ReviewSection from './ReviewSection';

interface PropertyDetailProps {
  property: PropertyProps;
}

const PropertyDetail: React.FC<PropertyDetailProps> = ({ property }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'amenities', label: 'What we offer' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'host', label: 'About host' },
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-lg ${index < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ★
      </span>
    ));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="mt-4">
            <p className="leading-relaxed text-gray-700">
              {property.description || 'No description available.'}
            </p>
          </div>
        );
      case 'amenities':
        return (
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {property.amenities?.map((amenity: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
                    <span className="text-sm text-green-600">✓</span>
                  </div>
                  <span className="text-gray-700">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'reviews':
        return <ReviewSection propertyId={property.name.replace(/\s+/g, '-').toLowerCase()} />;
      case 'host':
        return (
          <div className="mt-4">
            <div className="flex items-center space-x-4">
              <Image
                src="https://placehold.co/80x80.png"
                alt="Host"
                className="w-16 h-16 rounded-full"
                width={80}
                height={80}
              />
              <div>
                <h4 className="text-lg font-semibold">John Doe</h4>
                <p className="text-gray-600">Super host · 5 years hosting</p>
                <p className="mt-2 text-gray-700">
                  I&apos;m passionate about providing exceptional experiences for my guests. I love
                  sharing local recommendations and ensuring everyone has a comfortable stay.
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container p-4 mx-auto lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold lg:text-4xl">{property.name}</h1>
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            {renderStars(property.rating)}
            <span className="font-semibold">{property.rating}</span>
          </div>
          <span className="text-gray-600">
            {property.address.city}, {property.address.state}, {property.address.country}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Image Grid */}
          <div className="grid grid-cols-2 gap-2 mb-6 lg:grid-cols-4">
            <div className="col-span-2 lg:col-span-2 lg:row-span-2">
              <Image
                src={property.image}
                alt={property.name}
                className="object-cover w-full h-64 rounded-lg lg:h-96"
                width={600}
                height={400}
                priority
              />
            </div>
            {property.images?.slice(1, 5).map((image: string, index: number) => (
              <div key={index} className="hidden lg:block">
                <Image
                  src={image}
                  alt={`${property.name} ${index + 2}`}
                  className="object-cover w-full h-24 rounded-lg lg:h-46"
                  width={300}
                  height={200}
                />
              </div>
            ))}
          </div>

          {/* Property Info */}
          <div className="pb-6 mb-6 border-b">
            <h2 className="mb-4 text-xl font-semibold">
              {property.offers.bed} bedroom • {property.offers.shower} bathroom •{' '}
              {property.offers.occupants} guests
            </h2>
            <div className="flex flex-wrap gap-2">
              {property.category.map((cat: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-full"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b">
            <nav className="flex space-x-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mb-6">{renderTabContent()}</div>
        </div>

        {/* Booking Section */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <BookingSection price={property.price} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
