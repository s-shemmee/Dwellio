import React from 'react';
import Image from 'next/image';

type BookingDetails = {
  propertyName: string;
  startDate: string;
  totalNights: number;
  bookingFee: number;
  price: number;
};

const OrderSummary: React.FC<{ bookingDetails: BookingDetails }> = ({ bookingDetails }) => (
  <div className="p-6 bg-white rounded-lg shadow-md">
    <h2 className="text-xl font-semibold">Review Order Details</h2>
    <div className="flex items-center mt-4">
      <Image
        src="https://example.com/property.jpg"
        alt="Property"
        width={128}
        height={128}
        className="object-cover w-32 h-32 rounded-md"
      />
      <div className="ml-4">
        <h3 className="text-lg font-semibold">{bookingDetails.propertyName}</h3>
        <p className="text-sm text-gray-500">4.76 (345 reviews)</p>
        <p className="text-sm text-gray-500">
          {bookingDetails.startDate} • {bookingDetails.totalNights} Nights
        </p>
      </div>
    </div>

    {/* Price Breakdown */}
    <div className="mt-6">
      <div className="flex justify-between">
        <p>Booking Fee</p>
        <p>${bookingDetails.bookingFee}</p>
      </div>
      <div className="flex justify-between mt-2">
        <p>Subtotal</p>
        <p>${bookingDetails.price}</p>
      </div>
      <div className="flex justify-between mt-2 font-semibold">
        <p>Grand Total</p>
        <p>${bookingDetails.bookingFee + bookingDetails.price}</p>
      </div>
    </div>
  </div>
);

export default OrderSummary;
