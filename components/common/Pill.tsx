'use client';

import React from 'react';

type PillProps = {
  label: string;
  isSelected?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'filter' | 'sort';
};

const Pill = ({ label, isSelected = false, onClick, variant = 'default' }: PillProps) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-4 py-1 rounded-full border text-sm font-medium transition whitespace-nowrap
        ${
          isSelected
            ? 'bg-teal-100/50 text-teal-600 border-teal-600'
            : 'bg-white text-black border-gray-300'
        }
      `}
    >
      {variant === 'filter' && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
        >
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="16" y1="6" y2="6" />
          <line x1="8" x2="20" y1="18" y2="18" />
        </svg>
      )}
      {label}
      {variant === 'sort' && (
        <svg
          className="w-3 h-3 ml-1"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      )}
    </button>
  );
};

export default Pill;
