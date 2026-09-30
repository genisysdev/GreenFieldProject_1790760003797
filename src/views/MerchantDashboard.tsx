import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Bell,
  Clock,
  Check,
  X,
  Store,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { playNotificationSound } from '../utils/audio';

export const MerchantDashboard: React.FC = () => {
  const { orders, updateOrderStatus, restaurants, toggleRestaurantStatus } = useApp();
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Find merchant restaurant
  const activeMerchantRestaurant = restaurants[0]; // defaults to Gourmet Burger Kitchen

  // Filter pending active orders for this merchant
  const pendingOrders = orders.filter(
    (o) => o.restaurantId === activeMerchantRestaurant.id && o.status === 'pending'
  );

  const acceptedAndPrepOrders = orders.filter(
    (o) =>
      o.restaurantId === activeMerchantRestaurant.id &&
      ['accepted', 'preparing', 'ready_for_pickup'].includes(o.status)
  );

  // Trigger recurring sound if there are active pending orders
  useEffect(() => {
    if (pendingOrders.length > 0 && soundEnabled) {
      const interval = setInterval(() => {
        playNotificationSound();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [pendingOrders, soundEnabled]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-white shadow">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wide">Merchant Terminal Mode</span>
            <h1 className="text-2xl font-black text-gray-800">{activeMerchantRestaurant.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
          {/* Operational Status Toggle */}
          <button
            onClick={() => toggleRestaurantStatus(activeMerchantRestaurant.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeMerchantRestaurant.isOpen
                ? 'bg-emerald-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            Terminal Status: {activeMerchantRestaurant.isOpen ? 'ONLINE' : 'OFFLINE'}
          </button>

          {/* Sound Notification Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-all"
            title={soundEnabled ? 'Disable notification sounds' : 'Enable notification sounds'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-orange-500" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Incoming Order Panel with Auditory Alarm (SLA window) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-red-500 animate-bounce" />
                <h2 className="text-base font-extrabold text-gray-800">Live Incoming Orders Queue</h2>
              </div>
              <span className="bg-red-100 text-red-700 font-bold text-xs px-2.5 py-1 rounded-full">
                SLA Window Active
              </span>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <p className="font-medium text-sm">No incoming orders in current queue.</p>
                <p className="text-xs text-gray-400 mt-1">
                  Simulate a customer order to test the countdown timer & sound chime.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingOrders.map((order) => {
                  const secondsLeft = order.merchantTimeoutAt
                    ? Math.max(0, Math.floor((order.merchantTimeoutAt - Date.now()) / 1000))
                    : 180;

                  return (
                    <div
                      key={order.id}
                      className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-5 border border-red-100 space-y-4 pulse-danger"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-gray-800 text-sm">Order Ref: {order.id}</h3>
                          <p className="text-xs text-gray-600 mt-0.5">Customer: {order.customerName}</p>
                        </div>
                        <div className="flex items-center space-x-1 bg-red-600 text-white font-mono font-bold text-xs px-3 py-1.5 rounded-lg">
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          <span>{secondsLeft}s SLA Limit</span>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl p-4 border border-red-100">
                        <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Ordered Items</p>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.foodItem.id} className="flex justify-between text-xs text-gray-700">
                              <span>
                                {item.quantity} x {item.foodItem.name}
                              </span>
                              <span className="font-semibold">${(item.foodItem.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => updateOrderStatus(order.id, 'accepted')}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-4 h-4" /> Accept & Prep
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'rejected')}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                        >
                          <X className="w-4 h-4" /> Reject Order
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Preparing & Active Orders tracking sidebar */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-800 mb-4">Active Preparation List</h2>

            {acceptedAndPrepOrders.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">
                No orders currently in food prep lifecycle.
              </p>
            ) : (
              <div className="space-y-3">
                {acceptedAndPrepOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-gray-800">Order ID: {order.id}</h4>
                        <p className="text-[10px] text-gray-500 mt-0.5">Amount: ${order.totalAmount.toFixed(2)}</p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-orange-100 text-orange-700">
                        {order.status}
                      </span>
                    </div>

                    <div className="flex gap-2 mt-3.5">
                      {order.status === 'accepted' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-1.5 rounded-lg text-[10px] transition-all"
                        >
                          Move to Kitchen Prep
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'ready_for_pickup')}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-1.5 rounded-lg text-[10px] transition-all"
                        >
                          Ready for Driver Collection
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};