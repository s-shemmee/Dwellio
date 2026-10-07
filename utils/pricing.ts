export const SERVICE_FEE_RATE = 0.1;
export const WEEKLY_DISCOUNT_MIN_NIGHTS = 7;
export const MAX_NIGHTS = 30;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const countNights = (checkIn: string, checkOut: string): number | null => {
  if (!ISO_DATE.test(checkIn) || !ISO_DATE.test(checkOut)) return null;
  const toUTC = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    const ts = Date.UTC(y, m - 1, d);
    return new Date(ts).toISOString().slice(0, 10) === iso ? ts : NaN;
  };
  const a = toUTC(checkIn);
  const b = toUTC(checkOut);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return Math.round((b - a) / 86_400_000);
};

export interface Quote {
  nights: number;
  subtotal: number;
  discountPercent: number;
  discount: number;
  serviceFee: number;
  total: number;
}

export const calculateQuote = ({
  price,
  nights,
  discountPercent = 0,
}: {
  price: number;
  nights: number;
  discountPercent?: number;
}): Quote => {
  const validPercent =
    Number.isFinite(discountPercent) && discountPercent > 0 && discountPercent <= 100
      ? discountPercent
      : 0;

  const subtotal = Math.round(price * nights);
  const discount =
    nights >= WEEKLY_DISCOUNT_MIN_NIGHTS ? Math.round((subtotal * validPercent) / 100) : 0;
  const serviceFee = Math.round((subtotal - discount) * SERVICE_FEE_RATE);

  return {
    nights,
    subtotal,
    discountPercent: discount > 0 ? validPercent : 0,
    discount,
    serviceFee,
    total: subtotal - discount + serviceFee,
  };
};

export const formatMoney = (amount: number) => `$${amount.toLocaleString('en-US')}`;
