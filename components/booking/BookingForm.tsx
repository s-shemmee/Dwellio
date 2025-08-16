import React from "react";

const BookingForm: React.FC = () => (
  <div className="p-6 bg-white rounded-lg shadow-md">
    <h2 className="text-xl font-semibold">Contact Detail</h2>
    <form>
      {/* Contact Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>First Name</label>
          <input type="text" className="w-full p-2 mt-2 border" />
        </div>
        <div>
          <label>Last Name</label>
          <input type="text" className="w-full p-2 mt-2 border" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label>Email</label>
          <input type="email" className="w-full p-2 mt-2 border" />
        </div>
        <div>
          <label>Phone Number</label>
          <input type="text" className="w-full p-2 mt-2 border" />
        </div>
      </div>

      {/* Payment Information */}
      <h2 className="mt-6 text-xl font-semibold">Pay with</h2>
      <div className="mt-4">
        <label>Card Number</label>
        <input type="text" className="w-full p-2 mt-2 border" />
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label>Expiration Date</label>
          <input type="text" className="w-full p-2 mt-2 border" />
        </div>
        <div>
          <label>CVV</label>
          <input type="text" className="w-full p-2 mt-2 border" />
        </div>
      </div>

      {/* Billing Address */}
      <h2 className="mt-6 text-xl font-semibold">Billing Address</h2>
      <div className="mt-4">
        <label>Street Address</label>
        <input type="text" className="w-full p-2 mt-2 border" />
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label>City</label>
          <input type="text" className="w-full p-2 mt-2 border" />
        </div>
        <div>
          <label>State</label>
          <input type="text" className="w-full p-2 mt-2 border" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label>Zip Code</label>
          <input type="text" className="w-full p-2 mt-2 border" />
        </div>
        <div>
          <label>Country</label>
          <input type="text" className="w-full p-2 mt-2 border" />
        </div>
      </div>

      {/* Submit Button */}
      <button className="w-full px-4 py-2 mt-6 text-white bg-green-500 rounded-md">
        Confirm & Pay
      </button>
    </form>
  </div>
);

export default BookingForm;
