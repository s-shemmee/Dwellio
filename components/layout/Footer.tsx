'use client';

import React from 'react';
import Link from 'next/link';

const linkFocus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 rounded-sm';

const Footer = () => {
  return (
    <>
      {/* Decorative Stripe */}
      <div className="w-full h-6 bg-teal-600" />

      <footer className="px-4 pt-10 pb-6 text-sm text-white bg-zinc-900 md:px-8 lg:px-10">
        <div className="container flex flex-col gap-10 mx-auto lg:flex-row lg:justify-between">
          {/* Logo + Description */}
          <div className="w-full lg:max-w-md">
            <p className="mb-4 text-2xl font-bold font-oxygen">Dwellio</p>
            <p className="text-gray-300">
              Dwellio is a platform where travelers can discover and book unique, comfortable,
              and affordable lodging options worldwide. From cozy city apartments and tranquil
              countryside retreats to exotic beachside villas, Dwellio connects you with the
              perfect place to stay for any trip.
            </p>
          </div>

          {/* 3 Columns */}
          <div className="w-full sm:grid sm:grid-cols-3 sm:gap-8 md:gap-12 lg:flex lg:gap-16 lg:justify-end">
            <div>
              <h4 className="mb-2 font-semibold">Explore</h4>
              <ul className="space-y-1 text-gray-300">
                <li>
                  <Link href="#" className={`transition hover:text-white ${linkFocus}`}>
                    Apartments in Dubai
                  </Link>
                </li>
                <li>
                  <Link href="#" className={`transition hover:text-white ${linkFocus}`}>
                    Hotels in New York
                  </Link>
                </li>
                <li>
                  <Link href="#" className={`transition hover:text-white ${linkFocus}`}>
                    Villa in Spain
                  </Link>
                </li>
                <li>
                  <Link href="#" className={`transition hover:text-white ${linkFocus}`}>
                    Mansion in Indonesia
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-2 font-semibold">Company</h4>
              <ul className="space-y-1 text-gray-300">
                <li>
                  <Link href="#" className={`transition hover:text-white ${linkFocus}`}>
                    About us
                  </Link>
                </li>
                <li>
                  <Link href="#" className={`transition hover:text-white ${linkFocus}`}>
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className={`transition hover:text-white ${linkFocus}`}>
                    Career
                  </Link>
                </li>
                <li>
                  <Link href="#" className={`transition hover:text-white ${linkFocus}`}>
                    Customers
                  </Link>
                </li>
                <li>
                  <Link href="#" className={`transition hover:text-white ${linkFocus}`}>
                    Brand
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-2 font-semibold">Help</h4>
              <ul className="space-y-1 text-gray-300">
                <li>
                  <Link href="#" className={`transition hover:text-white ${linkFocus}`}>
                    Support
                  </Link>
                </li>
                <li>
                  <Link href="#" className={`transition hover:text-white ${linkFocus}`}>
                    Cancel booking
                  </Link>
                </li>
                <li>
                  <Link href="#" className={`transition hover:text-white ${linkFocus}`}>
                    Refunds Process
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Legal Footer */}
        <div className="container flex flex-col items-center pt-4 mx-auto mt-10 text-xs text-gray-400 border-t border-gray-700 sm:flex-row sm:justify-between sm:gap-4">
          <p className="text-center sm:text-left">
            Some hotels require you to cancel more than 24 hours before check-in. Details{' '}
            <Link href="#" className={`text-teal-600 hover:underline ${linkFocus}`}>
              here
            </Link>
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-4 sm:mt-0">
            <Link href="#" className={`hover:text-white ${linkFocus}`}>
              Terms of Service
            </Link>
            <Link href="#" className={`hover:text-white ${linkFocus}`}>
              Policy service
            </Link>
            <Link href="#" className={`hover:text-white ${linkFocus}`}>
              Cookies Policy
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
