import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';
import PropertyDetail from '@/components/property/PropertyDetail';
import { PropertyProps } from '@/interfaces/index';

type State =
  | { status: 'loading' }
  | { status: 'ready'; property: PropertyProps }
  | { status: 'not-found' }
  | { status: 'error' };

const Skeleton = () => (
  <div role="status" aria-live="polite" className="container p-4 mx-auto lg:p-6">
    <span className="sr-only">Loading property...</span>
    <div aria-hidden="true" className="animate-pulse motion-reduce:animate-none">
      <div className="w-2/3 mb-3 bg-gray-200 rounded h-9" />
      <div className="w-1/3 h-5 mb-6 bg-gray-200 rounded" />
      <div className="h-64 mb-6 bg-gray-200 sm:h-80 lg:h-104 rounded-xl" />
      <div className="flex gap-2 mb-8">
        <div className="h-8 bg-gray-200 rounded-full w-28" />
        <div className="h-8 bg-gray-200 rounded-full w-28" />
        <div className="h-8 bg-gray-200 rounded-full w-28" />
      </div>
    </div>
  </div>
);

const Message: React.FC<{
  title: string;
  body: string;
  action?: React.ReactNode;
  alert?: boolean;
}> = ({ title, body, action, alert }) => (
  <div
    role={alert ? 'alert' : undefined}
    className="container px-4 py-16 mx-auto text-center"
  >
    <h1 className="mb-2 text-2xl font-bold text-gray-900">{title}</h1>
    <p className="mb-6 text-gray-600">{body}</p>
    {action}
  </div>
);

const linkClasses =
  'inline-block px-5 py-2.5 font-medium text-white bg-teal-700 rounded-full hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-800 focus-visible:ring-offset-2';

export default function PropertyDetailPage() {
  const router = useRouter();
  const [state, setState] = useState<State>({ status: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!router.isReady) return;

    const id = router.query.id;
    if (typeof id !== 'string' || !id) {
      setState({ status: 'not-found' });
      return;
    }

    const controller = new AbortController();
    setState({ status: 'loading' });

    axios
      .get<PropertyProps>(`/api/properties/${encodeURIComponent(id)}`, {
        signal: controller.signal,
      })
      .then((res) => setState({ status: 'ready', property: res.data }))
      .catch((err) => {
        if (axios.isCancel(err)) return;
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setState({ status: 'not-found' });
        } else {
          console.error('Failed to load property:', err);
          setState({ status: 'error' });
        }
      });

    return () => controller.abort();
  }, [router.isReady, router.query.id, reloadKey]);

  if (state.status === 'loading') {
    return (
      <>
        <Head>
          <title>Loading... | Dwellio</title>
        </Head>
        <Skeleton />
      </>
    );
  }

  if (state.status === 'not-found') {
    return (
      <>
        <Head>
          <title>Property not found | Dwellio</title>
        </Head>
        <Message
          title="Property not found"
          body="This property may have been removed, or the link is incorrect."
          action={
            <Link href="/" className={linkClasses}>
              Browse all properties
            </Link>
          }
        />
      </>
    );
  }

  if (state.status === 'error') {
    return (
      <>
        <Head>
          <title>Something went wrong | Dwellio</title>
        </Head>
        <Message
          alert
          title="We couldn’t load this property"
          body="Check your connection and try again."
          action={
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className={linkClasses}
            >
              Try again
            </button>
          }
        />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{`${state.property.name} | Dwellio`}</title>
      </Head>
      <PropertyDetail property={state.property} />
    </>
  );
}
