import React, { useId, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  Elements,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';

interface BookingFormProps {
  booking: { propertyId: string; checkIn: string; checkOut: string };
  children?: React.ReactNode;
}

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

const SMS_OPT_IN_DEFAULT = false;

const COUNTRIES = [
  'Australia',
  'Austria',
  'Belgium',
  'Brazil',
  'Canada',
  'Denmark',
  'Egypt',
  'France',
  'Germany',
  'Ghana',
  'Greece',
  'India',
  'Indonesia',
  'Ireland',
  'Italy',
  'Japan',
  'Kenya',
  'Malaysia',
  'Mexico',
  'Morocco',
  'Netherlands',
  'New Zealand',
  'Nigeria',
  'Norway',
  'Portugal',
  'Saudi Arabia',
  'Singapore',
  'South Africa',
  'South Korea',
  'Spain',
  'Sweden',
  'Switzerland',
  'Tanzania',
  'Thailand',
  'Turkey',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
];

interface Values {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  smsUpdates: boolean;
  streetAddress: string;
  apartment: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}
type TextKey = Exclude<keyof Values, 'smsUpdates'>;
type Errors = Partial<Record<keyof Values, string>>;

const initialValues: Values = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  smsUpdates: SMS_OPT_IN_DEFAULT,
  streetAddress: '',
  apartment: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
};

// Visual order, used to focus the first invalid field.
const FIELD_ORDER: (keyof Values)[] = [
  'firstName',
  'lastName',
  'email',
  'phoneNumber',
  'streetAddress',
  'apartment',
  'city',
  'state',
  'zipCode',
  'country',
];

/* ------------------------------ validation ------------------------------ */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[0-9\s().-]{7,20}$/; // same rule as /api/bookings

const validate = (v: Values): Errors => {
  const e: Errors = {};
  if (!v.firstName.trim()) e.firstName = 'Enter your first name.';
  if (!v.lastName.trim()) e.lastName = 'Enter your last name.';
  if (!EMAIL.test(v.email.trim())) e.email = 'Enter a valid email address.';
  if (!PHONE.test(v.phoneNumber.trim())) e.phoneNumber = 'Enter a valid phone number.';
  if (!v.streetAddress.trim()) e.streetAddress = 'Enter your street address.';
  if (!v.city.trim()) e.city = 'Enter your city.';
  if (!v.state.trim()) e.state = 'Enter your state.';
  if (!v.zipCode.trim()) e.zipCode = 'Enter your zip code.';
  if (!v.country) e.country = 'Select your country.';
  return e;
};

/* -------------------------------- card ---------------------------------- */

type CardField = 'number' | 'expiry' | 'cvc';
type CardState = { complete: boolean; error: string };
type CardEvent = { complete: boolean; error?: { message?: string } };

const CARD_REQUIRED: Record<CardField, string> = {
  number: 'Enter your card number.',
  expiry: 'Enter the expiration date.',
  cvc: 'Enter the security code.',
};

const elementStyle = {
  style: {
    base: { fontSize: '16px', color: '#111827', '::placeholder': { color: '#6b7280' } },
    invalid: { color: '#b91c1c' },
  },
};

/* ------------------------------- fields --------------------------------- */

const chevron = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    className="absolute w-5 h-5 text-gray-700 -translate-y-1/2 pointer-events-none right-4 top-1/2"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur: () => void;
  error?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: number;
  placeholder?: string;
  optional?: boolean;
  variant?: 'stacked' | 'cell';
}

const TextField: React.FC<FieldProps> = ({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  type = 'text',
  autoComplete,
  inputMode,
  maxLength,
  placeholder,
  optional,
  variant = 'stacked',
}) => {
  const errorId = `${id}-error`;
  const common = {
    id,
    type,
    value,
    onChange,
    onBlur,
    autoComplete,
    inputMode,
    maxLength,
    placeholder,
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? errorId : undefined,
  };
  const text = optional ? `${label} (optional)` : label;

  if (variant === 'cell') {
    return (
      <div className="px-4 py-2.5 bg-white">
        <label htmlFor={id} className="block text-xs text-gray-600">
          {text}
        </label>
        <input
          {...common}
          className="w-full p-0 text-base text-gray-900 placeholder-gray-500 bg-transparent border-0 focus:outline-none focus:ring-0"
        />
        {error && (
          <p id={errorId} className="mt-1 text-xs text-red-700">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={id} className="block mb-1.5 text-sm font-semibold text-gray-900">
        {text}
      </label>
      <input
        {...common}
        className={`w-full h-12 px-3 text-gray-900 bg-white border rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark focus-visible:border-brand-dark ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
};

const CardCell: React.FC<{
  id: string;
  label: string;
  error?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}> = ({ id, label, error, icon, children }) => (
  <div className="px-4 py-2.5 bg-white">
    <label htmlFor={id} className="flex items-center gap-1.5 text-xs text-gray-600">
      {label}
      {icon}
    </label>
    <div className="py-1">{children}</div>
    {error && (
      <p id={`${id}-error`} className="mt-1 text-xs text-red-700">
        {error}
      </p>
    )}
  </div>
);

const groupClasses =
  'overflow-hidden border border-gray-300 divide-y divide-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-brand-dark focus-within:border-brand-dark';

const sectionClasses = 'pt-8 mt-8 border-t border-gray-200';

/* -------------------------------- form ---------------------------------- */

const BookingFormInner: React.FC<BookingFormProps> = ({ booking, children }) => {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const idPrefix = useId();
  const id = (name: string) => `${idPrefix}-${name}`;

  const [values, setValues] = useState<Values>(initialValues);
  const [errors, setErrors] = useState<Errors>({});
  const [card, setCard] = useState<Record<CardField, CardState>>({
    number: { complete: false, error: '' },
    expiry: { complete: false, error: '' },
    cvc: { complete: false, error: '' },
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  // Kept after a failed payment so "try again" reuses the same held booking.
  const [session, setSession] = useState<{ reference: string; clientSecret: string } | null>(null);

  const setField = (name: TextKey, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setErrors(prev => (prev[name] ? { ...prev, [name]: undefined } : prev));
  };

  const onText = (name: TextKey) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setField(name, e.target.value);

  const onBlur = (name: keyof Values) => () => {
    if (name !== 'smsUpdates' && !values[name]) return; // don't nag while tabbing through
    setErrors(prev => ({ ...prev, [name]: validate(values)[name] }));
  };

  const fieldProps = (name: TextKey, label: string) => ({
    id: id(name),
    label,
    value: values[name],
    onChange: onText(name),
    onBlur: onBlur(name),
    error: errors[name],
  });

  const onCard = (field: CardField) => (event: CardEvent) =>
    setCard(prev => ({
      ...prev,
      [field]: { complete: event.complete, error: event.error?.message ?? '' },
    }));

  const focusCard = (field: CardField) => {
    if (!elements) return;
    const target =
      field === 'number'
        ? elements.getElement(CardNumberElement)
        : field === 'expiry'
          ? elements.getElement(CardExpiryElement)
          : elements.getElement(CardCvcElement);
    target?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!stripe || !elements) {
      setFormError('The payment form is still loading. Please try again in a moment.');
      return;
    }

    const found = validate(values);
    const firstInvalid = FIELD_ORDER.find(key => found[key]);
    const incomplete = (['number', 'expiry', 'cvc'] as const).filter(f => !card[f].complete);

    if (firstInvalid || incomplete.length > 0) {
      setErrors(found);
      setCard(prev => {
        const next = { ...prev };
        incomplete.forEach(f => {
          next[f] = { ...prev[f], error: prev[f].error || CARD_REQUIRED[f] };
        });
        return next;
      });
      if (firstInvalid) document.getElementById(id(firstInvalid))?.focus();
      else focusCard(incomplete[0]);
      return;
    }

    setLoading(true);
    let redirected = false;
    try {
      // 1. Server holds the dates and creates the payment (once per attempt chain).
      let current = session;
      if (!current) {
        const { data } = await axios.post('/api/bookings', {
          ...booking,
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim(),
          phoneNumber: values.phoneNumber.trim(),
          smsUpdates: values.smsUpdates,
          streetAddress: values.streetAddress.trim(),
          apartment: values.apartment.trim(),
          city: values.city.trim(),
          state: values.state.trim(),
          zipCode: values.zipCode.trim(),
          country: values.country,
        });
        current = { reference: data.booking.id, clientSecret: data.booking.clientSecret };
        setSession(current);
      }

      // 2. The card goes from Stripe's iframe straight to Stripe, never to us.
      const cardElement = elements.getElement(CardNumberElement);
      if (!cardElement) throw new Error('Card field is missing.');

      const { error, paymentIntent } = await stripe.confirmCardPayment(current.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${values.firstName.trim()} ${values.lastName.trim()}`,
            email: values.email.trim(),
            phone: values.phoneNumber.trim(),
            address: {
              line1: values.streetAddress.trim(),
              line2: values.apartment.trim() || undefined,
              city: values.city.trim(),
              state: values.state.trim(),
              postal_code: values.zipCode.trim(),
            },
          },
        },
      });

      if (error) {
        setFormError(error.message ?? 'Your payment could not be completed.');
        return;
      }

      if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'processing') {
        redirected = true;
        await router.push(
          `/booking/confirmation?reference=${encodeURIComponent(current.reference)}`
        );
        return;
      }
      setFormError('Your payment was not completed. Please try again.');
    } catch (err) {
      if (
        axios.isAxiosError(err) &&
        err.response?.data &&
        typeof err.response.data.message === 'string'
      ) {
        const serverErrors = (err.response.data.errors ?? {}) as Record<string, string>;
        const fieldErrors: Errors = {};
        (Object.keys(initialValues) as (keyof Values)[]).forEach(key => {
          if (serverErrors[key]) fieldErrors[key] = serverErrors[key];
        });
        setErrors(fieldErrors);
        setFormError(
          Object.keys(fieldErrors).length > 0
            ? 'Please fix the highlighted fields.'
            : err.response.data.message
        );
      } else {
        setFormError('We couldn’t submit your booking. Please check your details and try again.');
      }
    } finally {
      if (!redirected) setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* ---------------------------- Contact ---------------------------- */}
      <fieldset>
        <legend className="mb-4 text-2xl font-semibold text-gray-900">Contact Detail</legend>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <TextField {...fieldProps('firstName', 'First Name')} autoComplete="given-name" />
          <TextField {...fieldProps('lastName', 'Last Name')} autoComplete="family-name" />
          <TextField {...fieldProps('email', 'Email')} type="email" autoComplete="email" />
          <TextField
            {...fieldProps('phoneNumber', 'Phone number')}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
          />
        </div>
        <label className="flex items-start gap-3 mt-5 text-gray-900">
          <input
            type="checkbox"
            checked={values.smsUpdates}
            onChange={e => setValues(prev => ({ ...prev, smsUpdates: e.target.checked }))}
            className="w-5 h-5 mt-0.5 accent-brand-dark shrink-0"
          />
          <span>Receive text message updates about your booking. Message rates may apply.</span>
        </label>
      </fieldset>

      {/* ----------------------------- Payment --------------------------- */}
      <fieldset className={sectionClasses}>
        <legend className="mb-1 text-2xl font-semibold text-gray-900">Pay with</legend>
        <p className="mb-4 text-sm text-gray-600">
          Test mode: no real money moves. Use card{' '}
          <span className="font-mono">4242 4242 4242 4242</span>, any future expiry and any 3-digit
          code.
        </p>

        <div className="relative mb-4">
          <label htmlFor={id('method')} className="sr-only">
            Payment method
          </label>
          <select
            id={id('method')}
            defaultValue="card"
            className="w-full pl-4 pr-12 text-lg text-gray-700 bg-white border border-gray-300 rounded-lg appearance-none h-14 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark"
          >
            <option value="card">Credit or debit card</option>
          </select>
          {chevron}
        </div>

        <div className={groupClasses}>
          <CardCell
            id={id('cardNumber')}
            label="Card number"
            error={card.number.error}
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                focusable="false"
                className="w-3.5 h-3.5 text-gray-900"
              >
                <path d="M17 9V7a5 5 0 00-10 0v2H5v12h14V9h-2zm-8-2a3 3 0 016 0v2H9V7z" />
              </svg>
            }
          >
            <CardNumberElement
              id={id('cardNumber')}
              options={{ ...elementStyle, showIcon: true, placeholder: '1234 1234 1234 1234' }}
              onChange={onCard('number')}
            />
          </CardCell>
          <div className="grid grid-cols-2 divide-x divide-gray-300">
            <CardCell id={id('cardExpiry')} label="Expiration date" error={card.expiry.error}>
              <CardExpiryElement
                id={id('cardExpiry')}
                options={{ ...elementStyle, placeholder: 'MM / YY' }}
                onChange={onCard('expiry')}
              />
            </CardCell>
            <CardCell id={id('cardCvc')} label="CVV" error={card.cvc.error}>
              <CardCvcElement
                id={id('cardCvc')}
                options={{ ...elementStyle, placeholder: 'CVC' }}
                onChange={onCard('cvc')}
              />
            </CardCell>
          </div>
        </div>
      </fieldset>

      {/* ------------------------- Billing address ----------------------- */}
      <fieldset className="mt-8">
        <legend className="mb-3 text-sm font-semibold text-gray-900">Billing Address</legend>
        <div className={groupClasses}>
          <TextField
            {...fieldProps('streetAddress', 'Street Address')}
            variant="cell"
            autoComplete="billing address-line1"
          />
          <TextField
            {...fieldProps('apartment', 'Apt or suite number')}
            variant="cell"
            optional
            autoComplete="billing address-line2"
          />
          <TextField
            {...fieldProps('city', 'City')}
            variant="cell"
            autoComplete="billing address-level2"
          />
          <div className="grid grid-cols-2 divide-x divide-gray-300">
            <TextField
              {...fieldProps('state', 'State')}
              variant="cell"
              autoComplete="billing address-level1"
            />
            <TextField
              {...fieldProps('zipCode', 'Zip Code')}
              variant="cell"
              autoComplete="billing postal-code"
            />
          </div>
        </div>

        <div className="mt-5">
          <div className={`relative ${groupClasses}`}>
            <div className="px-4 py-2.5 bg-white">
              <label htmlFor={id('country')} className="block text-xs text-gray-600">
                Country
              </label>
              <select
                id={id('country')}
                value={values.country}
                onChange={e => {
                  setValues(prev => ({ ...prev, country: e.target.value }));
                  setErrors(prev => ({ ...prev, country: undefined }));
                }}
                aria-invalid={Boolean(errors.country)}
                aria-describedby={errors.country ? `${id('country')}-error` : undefined}
                autoComplete="billing country-name"
                className="w-full p-0 pr-8 text-base text-gray-900 bg-transparent border-0 appearance-none focus:outline-none focus:ring-0"
              >
                <option value="">Select country</option>
                {COUNTRIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.country && (
                <p id={`${id('country')}-error`} className="mt-1 text-xs text-red-700">
                  {errors.country}
                </p>
              )}
            </div>
            {chevron}
          </div>
        </div>
      </fieldset>

      {children}

      <div className="pt-8 mt-8 border-t border-gray-200">
        {formError && (
          <p
            role="alert"
            className="px-3 py-2 mb-4 text-red-700 border border-red-200 rounded-md bg-red-50"
          >
            {formError}
          </p>
        )}
        <button
          type="submit"
          disabled={loading || !stripe}
          aria-busy={loading}
          className="w-full px-8 py-3.5 text-lg font-medium text-white rounded-lg bg-brand-dark sm:w-auto sm:min-w-72 hover:bg-brand-darker focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-darker focus-visible:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Confirm & pay'}
        </button>
      </div>
    </form>
  );
};

const BookingForm: React.FC<BookingFormProps> = props => {
  if (!stripePromise) {
    return (
      <p role="alert" className="px-4 py-3 text-red-700 border border-red-200 rounded-lg bg-red-50">
        Payments aren’t configured: set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env.local and restart
        the dev server.
      </p>
    );
  }
  return (
    <Elements stripe={stripePromise}>
      <BookingFormInner {...props} />
    </Elements>
  );
};

export default BookingForm;
