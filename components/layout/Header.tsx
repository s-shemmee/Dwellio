'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Search, Menu, X, Minus, Plus } from 'lucide-react';

const categories = [
  { name: 'Rooms', icon: '/assets/icons/Rooms.svg' },
  { name: 'Mansion', icon: '/assets/icons/Mansion.svg' },
  { name: 'Countryside', icon: '/assets/icons/Countryside.svg' },
  { name: 'Villa', icon: '/assets/icons/Villa.svg' },
  { name: 'Tropical', icon: '/assets/icons/Tropical.svg' },
  { name: 'New', icon: '/assets/icons/New.svg' },
  { name: 'Amazing pool', icon: '/assets/icons/AmazingPool.svg' },
  { name: 'Beach house', icon: '/assets/icons/BeachHouse.svg' },
  { name: 'Island', icon: '/assets/icons/Island.svg' },
  { name: 'Camping', icon: '/assets/icons/Camping.svg' },
  { name: 'Apartment', icon: '/assets/icons/Apartment.svg' },
  { name: 'House', icon: '/assets/icons/House.svg' },
  { name: 'Lakefront', icon: '/assets/icons/Lakefront.svg' },
  { name: 'Farm house', icon: '/assets/icons/FarmHouse.svg' },
  { name: 'Treehouse', icon: '/assets/icons/Treehouse.svg' },
  { name: 'Cabins', icon: '/assets/icons/Cabin.svg' },
  { name: 'Castles', icon: '/assets/icons/Castle.svg' },
  { name: 'Lakeside', icon: '/assets/icons/Lakeside.svg' },
];

const AUTH_ENABLED = false;

const AuthButton = ({
  label,
  className,
}: {
  label: string;
  className: string;
}) => (
  <button
    type="button"
    aria-disabled={!AUTH_ENABLED}
    title={AUTH_ENABLED ? undefined : 'Coming soon'}
    onClick={(e) => {
      if (!AUTH_ENABLED) e.preventDefault();
    }}
    className={`${className} ${
      AUTH_ENABLED ? '' : 'opacity-60 cursor-not-allowed'
    }`}
  >
    {label}
  </button>
);

const CategoryItem = ({
  name,
  icon,
  active,
  onClick,
}: {
  name: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex flex-col items-center cursor-pointer pb-2 relative group shrink-0
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 rounded-sm
        ${
          active
            ? 'text-gray-900 border-b-2 border-teal-600'
            : 'text-gray-600 hover:text-gray-900'
        }
        transition-colors duration-200`}
    >
      <span className="flex items-center justify-center w-6 h-6 mb-1">
        <Image src={icon} alt="" aria-hidden="true" width={24} height={24} />
      </span>

      <span className="text-xs font-medium">{name}</span>

      {!active && (
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-300 scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-200" />
      )}
    </button>
  );
};

const GuestStepper = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) => (
  <div className="flex items-center gap-2 shrink-0">
    <button
      type="button"
      onClick={() => onChange(Math.max(0, value - 1))}
      disabled={value <= 0}
      aria-label="Decrease number of guests"
      className="flex items-center justify-center border border-gray-300 rounded-full w-7 h-7 shrink-0 disabled:opacity-40 hover:border-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
    >
      <Minus className="w-3 h-3" aria-hidden="true" />
    </button>

    <span
      className="w-5 text-sm font-semibold text-center shrink-0"
      aria-live="polite"
    >
      {value}
    </span>

    <button
      type="button"
      onClick={() => onChange(value + 1)}
      aria-label="Increase number of guests"
      className="flex items-center justify-center border border-gray-300 rounded-full w-7 h-7 shrink-0 hover:border-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
    >
      <Plus className="w-3 h-3" aria-hidden="true" />
    </button>
  </div>
);

const Header = () => {
  const router = useRouter();

  const [activeCategory, setActiveCategory] = useState('Villa');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(0);

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isMobileMenuOpen && !isMobileSearchOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;

      setIsMobileMenuOpen(false);
      setIsMobileSearchOpen(false);
      menuButtonRef.current?.focus();
    };

    document.addEventListener('keydown', handleKeyDown);

    if (isMobileMenuOpen) {
      mobileMenuRef.current?.querySelector('button')?.focus();
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen, isMobileSearchOpen]);

  const runSearch = () => {
    const params = new URLSearchParams();

    if (location.trim()) {
      params.set('location', location.trim());
    }

    if (checkIn) {
      params.set('checkIn', checkIn);
    }

    if (checkOut) {
      params.set('checkOut', checkOut);
    }

    if (guests > 0) {
      params.set('guests', String(guests));
    }

    router.push(`/?${params.toString()}`);
    setIsMobileSearchOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch();
  };

  useEffect(() => {
    const el = headerRef.current;

    if (!el) return;

    const update = () => {
      document.documentElement.style.setProperty(
        '--header-height',
        `${el.offsetHeight}px`
      );
    };

    update();

    if (typeof ResizeObserver === 'undefined') return;

    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  return (
    <>
      <div className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-center text-white bg-teal-600">
        <div className="flex items-center gap-2 mx-auto sm:gap-4">
          <Image
            src="/assets/icons/Case.svg"
            width={20}
            height={20}
            alt=""
            aria-hidden="true"
          />

          <span className="text-xs sm:text-sm">
            Overseas trip? Get the latest information on travel guides
          </span>

          <button
            type="button"
            className="px-2 py-0.5 ml-0.5 text-xs sm:px-3 sm:py-1 sm:ml-1 text-white rounded-full bg-black/80 hover:bg-black whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            More Info
          </button>
        </div>
      </div>

      <header
        ref={headerRef}
        className="sticky top-0 z-50 w-full font-sans bg-white shadow-sm"
      >
        {/* Main header */}
        <div className="flex items-center justify-between gap-3 px-4 py-4 bg-white sm:px-6 md:px-8 lg:px-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/assets/icons/DwellioLogo.png"
              width={100}
              height={100}
              alt="Dwellio home"
              priority
            />
          </Link>

          {/* Desktop search */}
          <form
            onSubmit={handleSearchSubmit}
            className="items-center justify-between flex-1 hidden max-w-2xl min-w-0 px-3 py-2 transition-shadow bg-white border border-gray-100 rounded-full shadow-sm lg:flex hover:shadow-md"
          >
            <div className="flex items-center min-w-0 text-gray-600 divide-x divide-gray-100 grow">
              <div className="flex-1 min-w-0 px-4 text-sm font-semibold">
                <label
                  htmlFor="search-location"
                  className="block text-black"
                >
                  Location
                </label>

                <input
                  id="search-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Search destination"
                  className="w-full min-w-0 text-gray-500 placeholder-gray-400 truncate outline-none"
                />
              </div>

              <div className="px-4 text-sm font-semibold shrink-0">
                <label htmlFor="search-checkin" className="block text-black">
                  Check in
                </label>

                <input
                  id="search-checkin"
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="text-gray-500 outline-none w-29"
                />
              </div>

              <div className="px-4 text-sm font-semibold shrink-0">
                <label htmlFor="search-checkout" className="block text-black">
                  Check out
                </label>

                <input
                  id="search-checkout"
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="text-gray-500 outline-none w-29"
                />
              </div>

              <div className="px-4 text-sm font-semibold shrink-0">
                <span className="block text-black">People</span>

                <GuestStepper
                  value={guests}
                  onChange={setGuests}
                />
              </div>
            </div>

            <button
              type="submit"
              aria-label="Search"
              className="flex items-center justify-center w-10 h-10 ml-2 text-white rounded-full shrink-0 bg-amber-500 hover:bg-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
            >
              <Search className="w-5 h-5" aria-hidden="true" />
            </button>
          </form>

          {/* Mobile search trigger */}
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={isMobileSearchOpen}
            className="flex items-center flex-1 max-w-sm min-w-0 px-4 py-2 transition-shadow border border-gray-200 rounded-full shadow-sm lg:hidden hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            <span className="min-w-0 text-sm text-left text-gray-500 truncate grow">
              {location || 'Search destination'}
            </span>

            <Search
              className="w-5 h-5 ml-2 shrink-0 text-amber-600"
              aria-hidden="true"
            />
          </button>

          {/* Desktop auth */}
          <div className="items-center hidden gap-4 lg:flex shrink-0">
            <AuthButton
              label="Sign In"
              className="px-4 py-2 text-sm text-white rounded-full shadow-md bg-black/80 hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            />

            <AuthButton
              label="Sign Up"
              className="px-4 py-2 text-sm text-white bg-teal-600 rounded-full shadow-md hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
            />
          </div>

          {/* Mobile menu */}
          <div className="flex items-center gap-2 lg:hidden shrink-0">
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
              aria-haspopup="dialog"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu-panel"
              className="p-2 rounded-full hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            >
              <Menu
                className="w-6 h-6 text-gray-600"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        {/* Categories — home page only */}
        {router.pathname === '/' && (
          <div className="py-4 overflow-x-auto border-t border-gray-200 scrollbar-hide">
            <div className="flex items-center px-4 space-x-8 md:space-x-12 sm:px-6 md:px-8 lg:px-10">
              {categories.map(({ name, icon }) => (
                <CategoryItem
                  key={name}
                  name={name}
                  icon={icon}
                  active={activeCategory === name}
                  onClick={() => setActiveCategory(name)}
                />
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Mobile search panel */}
      {isMobileSearchOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          className="fixed inset-0 flex flex-col bg-white z-60 lg:hidden"
        >
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Search</h2>

            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(false)}
              aria-label="Close search"
              className="p-2 rounded-full hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col flex-1 gap-5 px-4 py-6 overflow-y-auto"
          >
            <div>
              <label
                htmlFor="mobile-location"
                className="block mb-1 text-sm font-semibold text-black"
              >
                Location
              </label>

              <input
                id="mobile-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Search destination"
                className="w-full px-4 py-3 border border-gray-300 outline-none rounded-xl focus:border-teal-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="mobile-checkin"
                  className="block mb-1 text-sm font-semibold text-black"
                >
                  Check in
                </label>

                <input
                  id="mobile-checkin"
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 outline-none rounded-xl focus:border-teal-600"
                />
              </div>

              <div>
                <label
                  htmlFor="mobile-checkout"
                  className="block mb-1 text-sm font-semibold text-black"
                >
                  Check out
                </label>

                <input
                  id="mobile-checkout"
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 outline-none rounded-xl focus:border-teal-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border border-gray-300 rounded-xl">
              <span className="text-sm font-semibold text-black">
                Guests
              </span>

              <GuestStepper
                value={guests}
                onChange={setGuests}
              />
            </div>

            <button
              type="submit"
              className="flex items-center justify-center w-full gap-2 py-3 mt-auto font-semibold text-white rounded-full bg-amber-500 hover:bg-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
            >
              <Search className="w-5 h-5" aria-hidden="true" />
              Search
            </button>
          </form>
        </div>
      )}

      {/* Mobile menu panel */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-60 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/40"
          />

          <div
            ref={mobileMenuRef}
            id="mobile-menu-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="absolute top-0 right-0 flex flex-col w-4/5 h-full max-w-xs gap-4 p-6 bg-white shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold">Menu</span>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
                className="p-2 rounded-full hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <AuthButton
              label="Sign In"
              className="w-full px-4 py-3 text-sm font-semibold text-white rounded-full shadow-md bg-black/80 hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            />

            <AuthButton
              label="Sign Up"
              className="w-full px-4 py-3 text-sm font-semibold text-white bg-teal-600 rounded-full shadow-md hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
            />

            <p className="text-sm text-gray-600">
              Accounts are coming soon.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
