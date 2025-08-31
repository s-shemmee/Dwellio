'use client';

import React, { useState, useEffect } from 'react';
import { Quicksand, Oxygen } from 'next/font/google';
import Layout from '@/components/layout/Layout';
import Hero from '@/components/Hero';
import Pill from '@/components/common/Pill';
import Card from '@/components/common/Card';
import axios from 'axios';
import { PropertyProps } from '@/interfaces/index';

const quicksand = Quicksand({
  variable: '--font-quicksand',
  subsets: ['latin'],
  display: 'swap',
});

const oxygen = Oxygen({
  variable: '--font-oxygen',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '700'],
});

const filters = [
  'All',
  'Top Villa',
  'Free Reschedule',
  'Book Now, Pay Later',
  'Self CheckIn',
  'pet friendly',
  'Instant Book',
];

export default function Home() {
  const [selected, setSelected] = useState<string | null>('All');
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [properties, setProperties] = useState<PropertyProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get('/api/properties');
        setProperties(response.data);
      } catch {
        setError('Failed to fetch properties.');
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // Filter properties based on selected category
  const filteredProperties = properties.filter(property => {
    if (selected === 'All') {
      return true;
    }
    if (selected === 'Top Villa') {
      return property.rating >= 4.9;
    }
    if (selected === 'Self CheckIn') {
      return property.category?.includes('Self Checkin');
    }
    if (selected === 'pet friendly') {
      return property.category?.includes('Pet Friendly');
    }
    if (selected === 'Instant Book') {
      return property.category?.includes('Instant Book');
    }
    return selected ? property.category?.includes(selected) : false;
  });

  if (loading) {
    return <p className="py-10 text-center">Loading...</p>;
  }
  if (error) {
    return <p className="py-10 text-center text-red-500">{error}</p>;
  }

  return (
    <div className={`${quicksand.variable} ${oxygen.variable} bg-gray-50`}>
      <Layout>
        <Hero />
        <div className="container px-4 mx-auto sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-0">
          <div className="flex flex-col mt-8 mb-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2 mb-4 sm:mb-0">
              {filters.map(filter => (
                <Pill
                  key={filter}
                  label={filter}
                  isSelected={selected === filter}
                  onClick={() => setSelected(filter)}
                />
              ))}
            </div>
            <div className="flex items-center justify-end space-x-2 sm:justify-start">
              <Pill
                label="Filter"
                variant="filter"
                isSelected={filterOpen}
                onClick={() => setFilterOpen(!filterOpen)}
              />
              <Pill
                label="Sorted by: Highest price"
                variant="sort"
                isSelected={sortOpen}
                onClick={() => setSortOpen(!sortOpen)}
              />
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 gap-6 py-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProperties.map((property, index) => (
              <Card key={property.name || index} property={property} />
            ))}
          </div>
        </div>
      </Layout>
    </div>
  );
}
