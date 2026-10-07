'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Hero from '@/components/Hero';
import Pill from '@/components/common/Pill';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Dropdown from '@/components/common/Dropdown';
import axios from 'axios';
import { PropertyProps } from '@/interfaces/index';

const filters = [
  'All',
  'Top Villa',
  'Free Reschedule',
  'Book Now, Pay Later',
  'Self CheckIn',
  'Instant Book',
];

type SortOption = 'default' | 'price-desc' | 'price-asc' | 'rating-desc';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'default', label: 'Recommended' },
  { value: 'price-desc', label: 'Highest price' },
  { value: 'price-asc', label: 'Lowest price' },
  { value: 'rating-desc', label: 'Top rated' },
];

export default function Home() {
  const [selected, setSelected] = useState<string>('All');
  const [properties, setProperties] = useState<PropertyProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/properties');
      setProperties(response.data);
    } catch (err) {
      console.error('Failed to fetch properties:', err);
      setError('Failed to fetch properties.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const filteredProperties = properties.filter((property) => {
    if (selected === 'All') return true;
    if (selected === 'Top Villa') return property.rating >= 4.9;
    if (selected === 'Self CheckIn') return property.category?.includes('Self Checkin');
    if (selected === 'pet friendly') return property.category?.includes('Pet Friendly');
    if (selected === 'Instant Book') return property.category?.includes('Instant Book');
    return property.category?.includes(selected) ?? false;
  });

  const sortedProperties = (() => {
    switch (sortOption) {
      case 'price-desc':
        return [...filteredProperties].sort((a, b) => b.price - a.price);
      case 'price-asc':
        return [...filteredProperties].sort((a, b) => a.price - b.price);
      case 'rating-desc':
        return [...filteredProperties].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      default:
        return filteredProperties;
    }
  })();

  const currentSortLabel =
    sortOptions.find((opt) => opt.value === sortOption)?.label ?? 'Recommended';

  return (
    <div className="bg-gray-50">
        <Hero />
        <div className="container px-4 mx-auto sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-0">
          <div className="flex flex-col mt-8 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2 mb-4 sm:mb-0">
              {filters.map((filter) => (
                <Pill
                  key={filter}
                  label={filter}
                  isSelected={selected === filter}
                  onClick={() => setSelected(filter)}
                />
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 sm:justify-start">
              <div className="relative">
                <Pill
                  label="Filter"
                  variant="filter"
                  isSelected={filterMenuOpen}
                  onClick={() => setFilterMenuOpen((prev) => !prev)}
                  ariaHasPopup
                  ariaExpanded={filterMenuOpen}
                  ariaControls="filter-dropdown-panel"
                />
                <Dropdown
                  id="filter-dropdown-panel"
                  isOpen={filterMenuOpen}
                  onClose={() => setFilterMenuOpen(false)}
                  label="Filter options"
                  align="right"
                >
                  <p className="px-3 py-2 text-sm text-gray-500">
                    Filter options coming soon.
                  </p>
                </Dropdown>
              </div>

              {/* Sort dropdown */}
              <div className="relative">
                <Pill
                  label={`Sorted by: ${currentSortLabel}`}
                  variant="sort"
                  isSelected={sortOption !== 'default'}
                  onClick={() => setSortMenuOpen((prev) => !prev)}
                  ariaHasPopup
                  ariaExpanded={sortMenuOpen}
                  ariaControls="sort-dropdown-panel"
                />
                <Dropdown
                  id="sort-dropdown-panel"
                  isOpen={sortMenuOpen}
                  onClose={() => setSortMenuOpen(false)}
                  label="Sort options"
                  align="right"
                >
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      role="menuitemradio"
                      aria-checked={sortOption === opt.value}
                      onClick={() => {
                        setSortOption(opt.value);
                        setSortMenuOpen(false);
                      }}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600
                        ${
                          sortOption === opt.value
                            ? 'bg-teal-100/50 text-teal-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </Dropdown>
              </div>
            </div>
          </div>

          <p className="sr-only" role="status" aria-live="polite">
            {loading
              ? 'Loading properties…'
              : `${sortedProperties.length} ${sortedProperties.length === 1 ? 'property' : 'properties'} found`}
          </p>

          {loading && (
            <p className="py-10 text-center text-gray-600" role="status" aria-live="polite">
              Loading properties…
            </p>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center gap-4 py-10 text-center" role="alert">
              <p className="text-red-500">{error}</p>
              <Button text="Try again" onClick={fetchProperties} variant="primary" />
            </div>
          )}

          {!loading && !error && sortedProperties.length === 0 && (
            <p className="py-10 text-center text-gray-600">
              No properties match this filter. Try a different one.
            </p>
          )}

          {!loading && !error && sortedProperties.length > 0 && (
            <div className="grid grid-cols-1 gap-6 py-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedProperties.map((property, index) => (
                <Card key={property.name || index} property={property} />
              ))}
            </div>
          )}
        </div>
    </div>
  );
}
