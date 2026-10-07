import React, { useId, useState } from 'react';
import axios from 'axios';

interface BookingFormProps {
  booking: { propertyId: string; checkIn: string; checkOut: string };
  children?: React.ReactNode;
}

const SMS_OPT_IN_DEFAULT = false;

const COUNTRIES = [
  'Australia', 'Austria', 'Belgium', 'Brazil', 'Canada', 'Denmark', 'Egypt', 'France',
  'Germany', 'Ghana', 'Greece', 'India', 'Indonesia', 'Ireland', 'Italy', 'Japan', 'Kenya',
  'Malaysia', 'Mexico', 'Morocco', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway',
  'Portugal', 'Saudi Arabia', 'Singapore', 'South Africa', 'South Korea', 'Spain', 'Sweden',
  'Switzerland', 'Tanzania', 'Thailand', 'Turkey', 'United Arab Emirates', 'United Kingdom',
  'United States',
];

interface Values {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  smsUpdates: boolean;
  cardNumber: string;
  expirationDate: string;
  cvv: string;
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
  cardNumber: '',
  expirationDate: '',
  cvv: '',
  streetAddress: '',
  apartment: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
};

const FIELD_ORDER: (keyof Values)[] = [
  'firstName', 'lastName', 'email', 'phoneNumber',
  'cardNumber', 'expirationDate', 'cvv',
  'streetAddress', 'apartment', 'city', 'state', 'zipCode', 'country',
];

/* ------------------------------ validation ------------------------------ */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[0-9\s().-]{7,20}$/;
const luhn = (digits: string) => {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (double) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    double = !double;
  }
  return sum % 10 === 0;
};

const validate = (v: Values): Errors => {
  const e: Errors = {};
  if (!v.firstName.trim()) e.firstName = 'Enter your first name.';
  if (!v.lastName.trim()) e.lastName = 'Enter your last name.';
  if (!EMAIL.test(v.email.trim())) e.email = 'Enter a valid email address.';
  if (!PHONE.test(v.phoneNumber.trim())) e.phoneNumber = 'Enter a valid phone number.';

  const digits = v.cardNumber.replace(/\s/g, '');
  if (digits.length < 13 || digits.length > 19 || !luhn(digits)) {
    e.cardNumber = 'Enter a valid card number.';
  }

  const exp = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(v.expirationDate);
  if (!exp) e.expirationDate = 'Use MM/YY.';
  else if (new Date(2000 + Number(exp[2]), Number(exp[1]), 1) <= new Date()) {
    e.expirationDate = 'This card has expired.';
  }

  if (!/^\d{3,4}$/.test(v.cvv)) e.cvv = 'Enter the 3 or 4 digit code.';

  if (!v.streetAddress.trim()) e.streetAddress = 'Enter your street address.';
  if (!v.city.trim()) e.city = 'Enter your city.';
  if (!v.state.trim()) e.state = 'Enter your state.';
  if (!v.zipCode.trim()) e.zipCode = 'Enter your zip code.';
  if (!v.country) e.country = 'Select your country.';
  return e;
};

/* ------------------------------ formatting ------------------------------ */

const formatCard = (raw: string) =>
  raw.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim();
const formatExpiry = (raw: string) => {
  const d = raw.replace(/\D/g, '').slice(0, 4);
  return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
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
  labelExtra?: React.ReactNode;
}

const TextField: React.FC<FieldProps> = ({
  id, label, value, onChange, onBlur, error, type = 'text', autoComplete, inputMode,
  maxLength, placeholder, optional, variant = 'stacked', labelExtra,
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
        <label htmlFor={id} className="flex items-center gap-1.5 text-xs text-gray-600">
          {text}
          {labelExtra}
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
        className={`w-full h-12 px-3 text-gray-900 bg-white border rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:border-teal-700 ${
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

const groupClasses =
  'overflow-hidden border border-gray-300 divide-y divide-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-teal-700 focus-within:border-teal-700';

const sectionClasses = 'pt-8 mt-8 border-t border-gray-200';

/* -------------------------------- form ---------------------------------- */

const BookingForm: React.FC<BookingFormProps> = ({ booking, children }) => {
  const idPrefix = useId();
  const id = (name: string) => `${idPrefix}-${name}`;

  const [values, setValues] = useState<Values>(initialValues);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{ id: string; total: number } | null>(null);

  const setField = (name: TextKey, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  };

  const onText =
    (name: TextKey, format?: (raw: string) => string) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setField(name, format ? format(e.target.value) : e.target.value);

  const onBlur = (name: keyof Values) => () => {
    if (name !== 'smsUpdates' && !values[name]) return;
    setErrors((prev) => ({ ...prev, [name]: validate(values)[name] }));
  };

  const fieldProps = (name: TextKey, label: string, format?: (raw: string) => string) => ({
    id: id(name),
    label,
    value: values[name],
    onChange: onText(name, format),
    onBlur: onBlur(name),
    error: errors[name],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const found = validate(values);
    const firstInvalid = FIELD_ORDER.find((key) => found[key]);
    if (firstInvalid) {
      setErrors(found);
      document.getElementById(id(firstInvalid))?.focus();
      return;
    }

    setLoading(true);
    try {
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
      setConfirmation({ id: data.booking.id, total: data.booking.quote.total });
      setValues(initialValues);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 400 && err.response.data) {
        const serverErrors = (err.response.data.errors ?? {}) as Record<string, string>;
        const fieldErrors: Errors = {};
        (Object.keys(initialValues) as (keyof Values)[]).forEach((key) => {
          if (serverErrors[key]) fieldErrors[key] = serverErrors[key];
        });
        setErrors(fieldErrors);
        setFormError(
          Object.keys(fieldErrors).length === 0 ? err.response.data.message : 'Please fix the highlighted fields.',
        );
      } else {
        setFormError('We couldn’t submit your booking. Please check your details and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (confirmation) {
    return (
      <div role="status" className="p-6 border border-green-200 rounded-lg bg-green-50">
        <h2 className="text-xl font-semibold text-green-900">Booking confirmed!</h2>
        <p className="mt-2 text-green-900">
          Your total is ${confirmation.total.toLocaleString('en-US')}. A confirmation will be sent to
          your email.
        </p>
        <p className="mt-2 text-sm text-green-900">
          Reference: <span className="font-mono">{confirmation.id}</span>
        </p>
      </div>
    );
  }

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
            onChange={(e) => setValues((prev) => ({ ...prev, smsUpdates: e.target.checked }))}
            className="w-5 h-5 mt-0.5 accent-teal-700 shrink-0"
          />
          <span>Receive text message updates about your booking. Message rates may apply.</span>
        </label>
      </fieldset>

      {/* ----------------------------- Payment --------------------------- */}
      <fieldset className={sectionClasses}>
        <legend className="mb-1 text-2xl font-semibold text-gray-900">Pay with</legend>
        <p className="mb-4 text-sm text-gray-600">
          Demo project: no real payment is processed, and card details are never sent or stored.
        </p>

        <div className="relative mb-4">
          <label htmlFor={id('method')} className="sr-only">
            Payment method
          </label>
          <select
            id={id('method')}
            defaultValue="card"
            className="w-full pl-4 pr-12 text-lg text-gray-700 bg-white border border-gray-300 rounded-lg appearance-none h-14 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
          >
            <option value="card">Credit or debit card</option>
          </select>
          {chevron}
        </div>

        <div className={groupClasses}>
          <TextField
            {...fieldProps('cardNumber', 'Card number', formatCard)}
            variant="cell"
            inputMode="numeric"
            autoComplete="cc-number"
            maxLength={23}
            placeholder="1234 5678 9012 3456"
            labelExtra={
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
          />
          <div className="grid grid-cols-2 divide-x divide-gray-300">
            <TextField
              {...fieldProps('expirationDate', 'Expiration date', formatExpiry)}
              variant="cell"
              inputMode="numeric"
              autoComplete="cc-exp"
              maxLength={5}
              placeholder="MM/YY"
            />
            <TextField
              {...fieldProps('cvv', 'CVV', (raw) => raw.replace(/\D/g, '').slice(0, 4))}
              variant="cell"
              inputMode="numeric"
              autoComplete="cc-csc"
              maxLength={4}
            />
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
          <TextField {...fieldProps('city', 'City')} variant="cell" autoComplete="billing address-level2" />
          <div className="grid grid-cols-2 divide-x divide-gray-300">
            <TextField {...fieldProps('state', 'State')} variant="cell" autoComplete="billing address-level1" />
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
                onChange={(e) => {
                  setValues((prev) => ({ ...prev, country: e.target.value }));
                  setErrors((prev) => ({ ...prev, country: undefined }));
                }}
                aria-invalid={Boolean(errors.country)}
                aria-describedby={errors.country ? `${id('country')}-error` : undefined}
                autoComplete="billing country-name"
                className="w-full p-0 pr-8 text-base text-gray-900 bg-transparent border-0 appearance-none focus:outline-none focus:ring-0"
              >
                <option value="">Select country</option>
                {COUNTRIES.map((c) => (
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

      {/* Cancellation policy */}
      {children}

      <div className="pt-8 mt-8 border-t border-gray-200">
        {formError && (
          <p role="alert" className="px-3 py-2 mb-4 text-red-700 border border-red-200 rounded-md bg-red-50">
            {formError}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="w-full px-8 py-3.5 text-lg font-medium text-white bg-teal-700 rounded-lg sm:w-auto sm:min-w-72 hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-800 focus-visible:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Confirm & pay'}
        </button>
      </div>
    </form>
  );
};

export default BookingForm;
