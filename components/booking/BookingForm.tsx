import React, { useState } from 'react';
import axios from 'axios';

const initialState = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  cardNumber: '',
  expirationDate: '',
  cvv: '',
  streetAddress: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
};

const BookingForm: React.FC = () => {
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await axios.post('/api/bookings', formData);
      setSuccess('Booking confirmed!');
      setFormData(initialState);
    } catch {
      setError('Failed to submit booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold">Contact Detail</h2>
      <form onSubmit={handleSubmit}>
        {/* Contact Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>First Name</label>
            <input
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full p-2 mt-2 border"
              required
            />
          </div>
          <div>
            <label>Last Name</label>
            <input
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-2 mt-2 border"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 mt-2 border"
              required
            />
          </div>
          <div>
            <label>Phone Number</label>
            <input
              name="phoneNumber"
              type="text"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full p-2 mt-2 border"
              required
            />
          </div>
        </div>

        {/* Payment Information */}
        <h2 className="mt-6 text-xl font-semibold">Pay with</h2>
        <div className="mt-4">
          <label>Card Number</label>
          <input
            name="cardNumber"
            type="text"
            value={formData.cardNumber}
            onChange={handleChange}
            className="w-full p-2 mt-2 border"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label>Expiration Date</label>
            <input
              name="expirationDate"
              type="text"
              value={formData.expirationDate}
              onChange={handleChange}
              className="w-full p-2 mt-2 border"
              required
            />
          </div>
          <div>
            <label>CVV</label>
            <input
              name="cvv"
              type="text"
              value={formData.cvv}
              onChange={handleChange}
              className="w-full p-2 mt-2 border"
              required
            />
          </div>
        </div>

        {/* Billing Address */}
        <h2 className="mt-6 text-xl font-semibold">Billing Address</h2>
        <div className="mt-4">
          <label>Street Address</label>
          <input
            name="streetAddress"
            type="text"
            value={formData.streetAddress}
            onChange={handleChange}
            className="w-full p-2 mt-2 border"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label>City</label>
            <input
              name="city"
              type="text"
              value={formData.city}
              onChange={handleChange}
              className="w-full p-2 mt-2 border"
              required
            />
          </div>
          <div>
            <label>State</label>
            <input
              name="state"
              type="text"
              value={formData.state}
              onChange={handleChange}
              className="w-full p-2 mt-2 border"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label>Zip Code</label>
            <input
              name="zipCode"
              type="text"
              value={formData.zipCode}
              onChange={handleChange}
              className="w-full p-2 mt-2 border"
              required
            />
          </div>
          <div>
            <label>Country</label>
            <input
              name="country"
              type="text"
              value={formData.country}
              onChange={handleChange}
              className="w-full p-2 mt-2 border"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full px-4 py-2 mt-6 text-white bg-green-500 rounded-md"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Confirm & Pay'}
        </button>
        {error && <p className="mt-4 text-red-500">{error}</p>}
        {success && <p className="mt-4 text-green-500">{success}</p>}
      </form>
    </div>
  );
};

export default BookingForm;
