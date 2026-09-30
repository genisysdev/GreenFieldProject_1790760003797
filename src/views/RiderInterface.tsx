import React, { useState, useEffect } from 'react';
import {
  Truck,
  Navigation,
  CheckCircle,
  ShieldAlert,
  RefreshCw,
  Unlock,
  Phone
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';

export const RiderInterface: React.FC = () => {
  const { orders, updateOrderStatus, activeRiderOrder, setActiveRiderOrder } = useApp();
  const [merchantPIN, setMerchantPIN] = useState('');
  const [customerOTP, setCustomerOTP] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Simulated dynamic GPS telemetry coordinates streaming state
  const [simulatedGPS, setSimulatedGPS] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
  });

  // Filter out orders that need rider assistance
  const availableDeliveries = orders.filter(
    (o) => o.status === 'ready_for_pickup' && !o.riderId
  );

  // Simulates telemetry updates streaming to coordinates tracking server
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeRiderOrder && activeRiderOrder.status === 'picked_up') {
      interval = setInterval(() => {
        // Randomly drift coordinates closer to user
        setSimulatedGPS((prev) => {
          const offsetLat = (Math.random() - 0.5) * 0.001;
          const offsetLng = (Math.random() - 0.5) * 0.001;
          const newCoords = {
            latitude: prev.latitude + offsetLat,
            longitude: prev.longitude + offsetLng,
          };
          console.log('Telemetry coordinate broadcasted via GPS channel:', newCoords);
          return newCoords;
        });
      }, 10000); // 10 seconds tracking stream as specified in the rules
    }
    return () => clearInterval(interval);
  }, [activeRiderOrder]);

  const handleAcceptAssignment = (order: Order) => {
    setActiveRiderOrder(order);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleVerifyPickup = () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!activeRiderOrder) return;

    if (merchantPIN === activeRiderOrder.pickupPIN) {
      updateOrderStatus(activeRiderOrder.id, 'picked_up');
      setSuccessMsg('PIN Confirmed! Order state changed successfully to transit status.');
    } else {
      setErrorMsg('Incorrect merchant 4-digit PIN bypass. Verify using the simulated code.');
    }
  };

  const handleVerifyDropoff = () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!activeRiderOrder) return;

    if (customerOTP === activeRiderOrder.deliveryOTP) {
      updateOrderStatus(activeRiderOrder.id, 'delivered');
      setSuccessMsg('Delivery Handshake Complete! Security OTP validated successfully.');
      setActiveRiderOrder(null); // Release active track
    } else {
      setErrorMsg('Incorrect 6-digit customer OTP. Please request the exact key from the client screen.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center space-x-3.5 mb-8">
        <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow">
          <Truck className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Secure Rider Pipeline</span>
          <h1 className="text-2xl font-black text-gray-800">Delivery Partner Hub</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Telemetry map details & active track details */}
        <div className="lg:col-span-2 space-y-6">
          {activeRiderOrder ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-orange-600 uppercase tracking-wide">Active Order Assignment</span>
                  <h2 className="text-lg font-bold text-gray-800">{activeRiderOrder.id}</h2>
                  <p className="text-xs text-gray-500">Deliver to: {activeRiderOrder.deliveryAddress.addressLine}</p>
                </div>
                <span className="bg-orange-100 text-orange-800 font-bold text-xs px-3 py-1.5 rounded-full">
                  SLA Stage: {activeRiderOrder.status.toUpperCase()}
                </span>
              </div>

              {/* Simulated GPS Telemetry Widget */}
              <div className="bg-gray-900 text-green-400 font-mono text-xs rounded-xl p-4 space-y-2 relative overflow-hidden">
                <div className="absolute top-3 right-3 animate-ping h-2.5 w-2.5 rounded-full bg-green-500" />
                <div className="flex items-center text-[10px] uppercase font-bold text-green-500 mb-1">
                  <RefreshCw className="w-3 h-3 mr-1.5 animate-spin" />
                  Active Telemetry Node Tracking
                </div>
                <p>Lat: {simulatedGPS.latitude.toFixed(6)}</p>
                <p>Lng: {simulatedGPS.longitude.toFixed(6)}</p>
                <p className="text-gray-400">*Streams coordinate telemetry update package every 10 seconds to database.</p>
              </div>

              {errorMsg && (
                <div className="p-3.5 bg-red-50 rounded-xl flex items-start text-red-700 text-sm border border-red-100">
                  <ShieldAlert className="w-4 h-4 mr-2.5 mt-0.5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3.5 bg-emerald-50 rounded-xl flex items-start text-emerald-800 text-sm border border-emerald-100">
                  <CheckCircle className="w-4 h-4 mr-2.5 mt-0.5 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Pickup Handshake Form verification (Requires Merchant PIN) */} 
              {activeRiderOrder.status === 'ready_for_pickup' && (
                <div className="border-t border-gray-100 pt-5 space-y-4">
                  <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl">
                    <h3 className="text-sm font-bold text-orange-800 mb-1.5 flex items-center">
                      <Unlock className="w-4 h-4 mr-2" />
                      Step 1: Verify Merchant Pickup PIN
                    </h3>
                    <p className="text-xs text-orange-700">
                      Collect the items and input the 4-digit code generated on the merchant terminal.<br />
                      Code for simulation is:{' '}
                      <strong className="underline font-mono font-extrabold">{activeRiderOrder.pickupPIN}</strong>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="Enter 4-Digit Merchant PIN"
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-center text-base tracking-widest font-bold focus:ring-orange-500 focus:border-orange-500"
                      value={merchantPIN}
                      onChange={(e) => setMerchantPIN(e.target.value.replace(/\D/g, ''))}
                    />
                    <button
                      onClick={handleVerifyPickup}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-xl text-xs transition-all shadow-md"
                    >
                      Confirm Pickup Handshake
                    </button>
                  </div>
                </div>
              )}

              {/* Drop-off Handshake Form verification (Requires Customer OTP) */} 
              {activeRiderOrder.status === 'picked_up' && (
                <div className="border-t border-gray-100 pt-5 space-y-4">
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                    <h3 className="text-sm font-bold text-emerald-800 mb-1.5 flex items-center">
                      <Unlock className="w-4 h-4 mr-2" />
                      Step 2: Confirm Customer Doorstep OTP
                    </h3>
                    <p className="text-xs text-emerald-700">
                      Ask the customer for their secure 6-digit passcode. Order transit locks prevent manual bypass without exact value match.<br />
                      Code for simulation is:{' '}
                      <strong className="underline font-mono font-extrabold">{activeRiderOrder.deliveryOTP}</strong>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-Digit Customer OTP"
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-center text-base tracking-widest font-bold focus:ring-orange-500 focus:border-orange-500"
                      value={customerOTP}
                      onChange={(e) => setCustomerOTP(e.target.value.replace(/\D/g, ''))}
                    />
                    <button
                      onClick={handleVerifyDropoff}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-2.5 rounded-xl text-xs transition-all shadow-md"
                    >
                      Validate Handshake Delivery
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <Navigation className="w-12 h-12 text-gray-300 mx-auto mb-3.5" />
              <p className="text-gray-500 font-medium text-sm">No active order assignment currently claimed.</p>
              <p className="text-xs text-gray-400 mt-1">
                Accept an available delivery from the pipeline sidebar list on the right to proceed.
              </p>
            </div>
          )}
        </div>

        {/* Available Pool of Deliveries Ready for Pickup */} 
        <div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-extrabold text-gray-800 mb-4">Available Dispatch Hub</h2>

            {availableDeliveries.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">
                No parcels waiting at merchant outlets inside radius.
              </p>
            ) : (
              <div className="space-y-3">
                {availableDeliveries.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm transition-all space-y-3"
                  >
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-800">Order: {order.id}</span>
                        <span className="text-[10px] font-bold text-green-600">Ready</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1 truncate">Origin: {order.restaurantName}</p>
                      <p className="text-[10px] text-gray-500 truncate">Dest: {order.deliveryAddress.addressLine}</p>
                    </div>
                    <button
                      onClick={() => handleAcceptAssignment(order)}
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold py-2 rounded-xl shadow-sm transition-all"
                    >
                      Accept Order Route
                    </button>
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