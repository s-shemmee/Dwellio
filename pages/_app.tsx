import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Quicksand, Oxygen } from 'next/font/google';
import Layout from '@/components/layout/Layout';

const quicksand = Quicksand({
  variable: '--next-quicksand',
  subsets: ['latin'],
  display: 'swap',
});

const oxygen = Oxygen({
  variable: '--next-oxygen',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '700'],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${quicksand.variable} ${oxygen.variable} font-sans`}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </div>
  );
}
