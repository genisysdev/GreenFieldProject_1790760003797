import React from 'react';
import {
  ShoppingBag,
  Clock,
  MapPin,
  CheckCircle,
  ShieldAlert,
  RefreshCw,
  User
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OrderTracking: React.FC = () => {
  const { orders, updateOrderStatus } = useApp();

  const handleCancelOrder = (orderId: string) => {
    // SLA cancellation policy - allow cancel if still pending validation
    updateOrderStatus(orderId, 'cancelled');
  };

  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3.5" />
        <h2 className="text-lg font-bold text-gray-800">No Active Orders</h2>
        <p className="text-xs text-gray-500 mt-1">
          Once you place an order, you can monitor live telemetry changes here.
        </p>
      </div>
    );
  }

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'pending':
        return 1;
      case 'accepted':
      case 'preparing':
        return 2;
      case 'ready_for_pickup':
        return 3;
      case 'picked_up':
        return 4;
      case 'delivered':
        return 5;
      default:
        return 0;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-gray-800">Order Pipeline Status</h1>
        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full flex items-center">
          <RefreshCw className="w-3 h-3 mr-1.5 animate-spin" />
          Auto-Sync Active
        </span>
      </div>

      <div className="space-y-6">
        {orders.map((order) => {
          const step = getStatusStep(order.status);
          const isTerminated = order.status === 'cancelled' || order.status === 'rejected' || order.status === 'delivered';

          return (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                  <span className="text-xs font-bold text-orange-600 uppercase tracking-wide">Order Reference</span>
                  <h2 className="text-lg font-bold text-gray-800">{order.id} ({order.restaurantName})</h2>
                  <p className="text-xs text-gray-500">Created: {new Date(order.createdAt).toLocaleTimeString()}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase px-3.5 py-1.5 rounded-full bg-orange-100 text-orange-800">
                    Status: {order.status.replace(/_/g, ' ')}
                  </span>
                  
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="text-xs text-red-600 hover:underline font-bold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

              {/* Delivery progress stepper UI */}
              {!isTerminated && (
                <div className="relative py-4">
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -translate-y-1/2 z-0" />
                  <div
                    className="absolute top-1/2 left-0 h-1 bg-orange-500 -translate-y-1/2 z-0 transition-all duration-500"
                    style={{ width: `${((step - 1) / 4) * 100}%` }}
                  />
                  <div className="relative z-10 flex justify-between">
                    {[
                      { label: 'Received', s: 1 },
                      { label: 'Merchant Prep', s: 2 },
                      { label: 'Ready', s: 3 },
                      { label: 'Dispatched', s: 4 },
                      { label: 'Arrived', s: 5 },
                    ].map((stepObj) => (
                      <div key={stepObj.label} className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                            step >= stepObj.s
                              ? 'bg-orange-500 text-white shadow-md'
                              : 'bg-white text-gray-400 border border-gray-200'
                          }`}
                        >
                          {stepObj.s}
                        </div>
                        <span className="text-[10px] font-bold text-gray-600 mt-2 whitespace-nowrap">
                          {stepObj.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verification PIN Code Board */} 
              {!isTerminated && (
                <div className="bg-orange-50 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4 border border-orange-100">
                  <div>
                    <p className="text-xs text-orange-700 font-bold uppercase tracking-wider mb-1">Delivery Passcode (OTP)</p>
                    <p className="text-xs text-gray-600 mb-2">
                      Provide this to the delivery driver at your doorstep to verify drop-off.
                    </p>
                    <div className="inline-block bg-white text-gray-800 font-mono font-extrabold tracking-widest text-lg px-4 py-1.5 rounded-xl border border-orange-100">
                      {order.deliveryOTP}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-orange-700 font-bold uppercase tracking-wider mb-1">Simulated Live Handshake Telemetry</p>
                    <p className="text-[10px] text-gray-500 font-mono">
                      Expected Transit SLA: ~15 mins<br />
                      Merchant Security Pin: <span className="font-bold text-orange-700">{order.pickupPIN}</span> (for rider pickup verification)
                    </p>
                  </div>
                </div>
              )}

              {/* Terminated/History Status Message */}
              {isTerminated && (
                <div className="p-4 rounded-xl bg-gray-50 flex items-start space-x-3 text-sm text-gray-600">
                  {order.status === 'delivered' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-red-500 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold text-gray-800">
                      Order is finished with status: {order.status.toUpperCase()}
                    </p>
                    <p className="text-xs mt-0.5">
                      {order.status === 'delivered'
                        ? 'Your order was successfully delivered and verified with secure OTP.'
                        : 'This order was either canceled or rejected.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Itemized Order list */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Order Summary</p>
                <div className="space-y-1">
                  {order.items.map((item) => (
                    <div key={item.foodItem.id} className="flex justify-between text-xs text-gray-600">
                      <span>
                        {item.quantity} x {item.foodItem.name}
                      </span>
                      <span>${(item.foodItem.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-xs font-extrabold text-gray-800 pt-2 border-t border-gray-100">
                    <span>Total Amount Charged</span>
                    <span>${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};