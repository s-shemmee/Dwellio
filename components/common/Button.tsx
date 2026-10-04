import React from 'react';
import { ButtonProps } from '@/interfaces';

interface ExtendedButtonProps extends ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
}

const Button: React.FC<ExtendedButtonProps> = ({
  text,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled = false,
  isLoading = false,
  loadingText = 'Please wait…',
}) => {
  const baseStyles =
    'px-4 py-2 rounded-full font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const variants = {
    primary: 'bg-teal-600 text-white hover:bg-teal-700 focus-visible:ring-teal-600',
    secondary:
      'bg-black/80 text-white hover:bg-black focus-visible:ring-black',
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]}`}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-disabled={disabled || isLoading}
    >
      {isLoading ? loadingText : text}
    </button>
  );
};

export default Button;
