import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Quicksand, Oxygen } from 'next/font/google';

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

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${quicksand.variable} ${oxygen.variable}`}>
      <Component {...pageProps} />
    </div>
  );
}
