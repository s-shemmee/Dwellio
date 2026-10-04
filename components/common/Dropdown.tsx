'use client';

import React, { useEffect, useRef } from 'react';

interface DropdownProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  align?: 'left' | 'right';
  label: string;
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  id,
  isOpen,
  onClose,
  children,
  align = 'left',
  label,
  className = '',
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id={id}
      ref={panelRef}
      role="menu"
      aria-label={label}
      className={`absolute z-40 mt-2 min-w-50 max-w-[calc(100vw-2rem)] rounded-xl border border-gray-200 bg-white p-2 shadow-lg
        ${align === 'right' ? 'right-0' : 'left-0'}
        ${className}`}
    >
      {children}
    </div>
  );
};

export default Dropdown;
