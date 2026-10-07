import React from 'react';
import Link from 'next/link';

const linkFocus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 rounded-sm';

const columns = [
  {
    title: 'Explore',
    links: ['Apartments in Dubai', 'Hotels in New York', 'Villa in Spain', 'Mansion in Indonesia'],
  },
  { title: 'Company', links: ['About us', 'Blog', 'Career', 'Customers', 'Brand'] },
  { title: 'Help', links: ['Support', 'Cancel booking', 'Refunds Process'] },
];

const legalLinks = ['Terms of Service', 'Policy service', 'Cookies Policy', 'Partners'];

const Footer = () => {
  return (
    <>
      {/* Decorative stripe */}
      <div aria-hidden="true" className="w-full h-6 bg-brand" />

      <footer className="px-4 pt-10 pb-6 text-sm text-white bg-zinc-900 md:px-8 lg:px-10">
        <div className="container flex flex-col gap-10 mx-auto lg:flex-row lg:justify-between">
          <div className="w-full lg:max-w-md">
            <p className="mb-4 text-2xl font-bold font-oxygen">Dwellio</p>
            <p className="text-gray-300">
              Dwellio is a platform where travelers can discover and book unique, comfortable, and
              affordable lodging options worldwide. From cozy city apartments and tranquil
              countryside retreats to exotic beachside villas, Dwellio connects you with the perfect
              place to stay for any trip.
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="grid w-full grid-cols-2 gap-8 sm:grid-cols-3 md:gap-12 lg:flex lg:w-auto lg:gap-16 lg:justify-end"
          >
            {columns.map((col) => (
              <div key={col.title}>
                <h2 className="mb-2 font-semibold">{col.title}</h2>
                <ul className="space-y-1 text-gray-300">
                  {col.links.map((label) => (
                    <li key={label}>
                      <Link href="#" className={`transition hover:text-white ${linkFocus}`}>
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="container flex flex-col items-center pt-4 mx-auto mt-10 text-xs text-gray-400 border-t border-gray-700 sm:flex-row sm:justify-between sm:gap-4">
          <p className="text-center sm:text-left">
            Some hotels require you to cancel more than 24 hours before check-in. Details{' '}
            <Link href="#" className={`text-brand hover:underline ${linkFocus}`}>
              here
            </Link>
          </p>
          <ul className="flex flex-wrap justify-center gap-4 mt-4 sm:mt-0">
            {legalLinks.map((label) => (
              <li key={label}>
                <Link href="#" className={`hover:text-white ${linkFocus}`}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </footer>
    </>
  );
};

export default Footer;
