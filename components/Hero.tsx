import Image from 'next/image';
import React from 'react';

const Hero = () => {
  return (
    <div className="px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-0">
      <section className="relative mx-auto my-8 overflow-hidden rounded-[30px] max-w-screen-2xl min-h-75 md:min-h-100 lg:h-125">
        <Image
          src="/assets/images/hero-img.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/20 via-black/25 to-black/50" />
        {/* Text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white font-oxygen">
          <h1 className="max-w-xl text-3xl font-bold leading-tight [text-shadow:0_2px_8px_rgba(0,0,0,0.35)] sm:text-4xl md:text-5xl lg:text-6xl">
            Find your favorite place here!
          </h1>
          <p className="max-w-md mt-2 text-base sm:mt-4 sm:text-lg md:text-xl [text-shadow:0_1px_4px_rgba(0,0,0,0.35)]">
            The best prices for over 2 million properties worldwide
          </p>
        </div>
      </section>
    </div>
  );
};

export default Hero;
