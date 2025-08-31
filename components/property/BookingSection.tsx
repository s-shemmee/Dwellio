import React from 'react';
import BookingForm from '../booking/BookingForm';

interface BookingSectionProps {
  price: number;
}

const BookingSection: React.FC<BookingSectionProps> = ({ price }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="mb-4 text-lg font-semibold">Book this property</h3>
      <p className="mb-2 text-xl font-bold">${price}</p>
      <BookingForm />
    </div>
  );
};

export default BookingSection;
