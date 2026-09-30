import React, { useState } from 'react';
import { ShoppingBag, MapPin, Tag, ArrowRight, Trash2, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CartCheckoutProps {
  onOrderSuccess: () => void;
}

export const CartCheckout: React.FC<CartCheckoutProps> = ({ onOrderSuccess }) => {
  const {
    cart,
    selectedAddress,
    removeFromCart,
    createOrder,
    couponApplied,
    setCouponApplied
  } = useApp();

  const [couponCode, setCouponCode] = useState('');
  const [instructions, setInstructions] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const subtotal = cart.reduce((acc, item) => acc + item.foodItem.price * item.quantity, 0);
  const discountAmount = couponApplied === 'SAVE20' ? subtotal * 0.2 : 0;
  const deliveryFee = 4.99;
  const totalAmount = subtotal - discountAmount + deliveryFee;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (couponCode.toUpperCase() === 'SAVE20') {
      setCouponApplied('SAVE20');
    } else {
      setErrorMsg('Invalid Coupon Code. Enter "SAVE20" to receive 20% off.');
    }
  };

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      setErrorMsg('You must have a delivery address configured to place an order.');
      return;
    }
    if (cart.length === 0) {
      setErrorMsg('Your cart is empty. Discovery some delicious food first!');
      return;
    }

    createOrder(couponApplied || undefined);
    onOrderSuccess();
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3.5" />
        <h2 className="text-lg font-bold text-gray-800">Your Cart is Empty</h2>
        <p className="text-xs text-gray-500 mt-1">
          Add items from available open restaurants in your radius to begin checking out.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-extrabold text-gray-800 mb-6">Configure & Review Order</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main checkout configuration columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cart item breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-800 mb-4">Selected Food Items</h2>
            <div className="divide-y divide-gray-100">
              {cart.map((item) => (
                <div key={item.foodItem.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.foodItem.image}
                      alt={item.foodItem.name}
                      className="w-14 h-14 rounded-lg object-cover bg-gray-50"
                    />
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm">{item.foodItem.name}</h3>
                      {item.customization && (
                        <p className="text-xs text-orange-600 font-medium">Customization: {item.customization}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-0.5">
                        Qty: {item.quantity} x ${item.foodItem.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-extrabold text-sm text-gray-800">
                      ${(item.foodItem.price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.foodItem.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      aria-label="Delete item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Address & Instructions configuration */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-800 mb-4">Delivery Destination Details</h2>
            {selectedAddress ? (
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-800 text-sm">
                    {selectedAddress.label} (Precise GPS Coordinates)
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">{selectedAddress.addressLine}</p>
                  <p className="text-[10px] text-gray-500 font-mono mt-1">
                    Latitude: {selectedAddress.latitude.toFixed(5)}, Longitude: {selectedAddress.longitude.toFixed(5)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-center text-amber-800 text-sm">
                <ShieldAlert className="w-5 h-5 mr-2.5 flex-shrink-0 text-amber-600" />
                <span>No delivery address saved. Please switch to the Discovery view to save an address.</span>
              </div>
            )}

            <div className="mt-4">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Special Delivery Instructions
              </label>
              <textarea
                rows={2}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-orange-500 focus:border-orange-500"
                placeholder="Gate code, apartment details, dropoff preference..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Pricing & Checkout Summary column */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6 sticky top-24">
            {/* Coupon Code Section */}
            <div>
              <h2 className="text-sm font-bold text-gray-800 mb-2.5">Apply Promo Discount</h2>
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Try 'SAVE20'"
                    className="pl-9 w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs uppercase focus:ring-orange-500 focus:border-orange-500"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="bg-gray-800 text-white font-semibold px-3 py-1.5 rounded-lg text-xs hover:bg-gray-900 transition-all"
                >
                  Apply
                </button>
              </form>
              {couponApplied && (
                <p className="text-xs text-green-600 font-semibold mt-2">
                  ✓ Promo "SAVE20" Applied! (20% Off Subtotal)
                </p>
              )}
              {errorMsg && <p className="text-xs text-red-600 font-semibold mt-2">{errorMsg}</p>}
            </div>

            {/* Fee Breakdown */}
            <div className="pt-4 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-xs text-green-600 font-semibold">
                  <span>Discount (20%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-gray-600">
                <span>Delivery Fee (8km Radius SLA)</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-800 font-extrabold pt-2 border-t border-dashed border-gray-200">
                <span>Grand Total</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
            >
              Confirm & Place Order
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};