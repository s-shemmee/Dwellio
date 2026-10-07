import React, { useState } from 'react';
import Image from 'next/image';

interface AvatarProps {
  src?: string;
  name: string;
  size?: number;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, name, size = 56, className = '' }) => {
  const [failed, setFailed] = useState(false);
  const initial = Array.from(name.trim())[0]?.toUpperCase() ?? '?';

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative overflow-hidden bg-gray-200 rounded-full shrink-0 ${className}`}
    >
      {src && !failed ? (
        <Image
          src={src}
          alt=""
          fill
          sizes={`${size}px`}
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          aria-hidden="true"
          style={{ fontSize: Math.round(size * 0.4) }}
          className="flex items-center justify-center w-full h-full font-semibold text-gray-700 select-none"
        >
          {initial}
        </span>
      )}
    </div>
  );
};

export default Avatar;