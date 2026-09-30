import React from 'react';
import {
  ShoppingBag,
  MapPin,
  User as UserIcon,
  Terminal,
  Truck,
  Activity,
  Code
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavbarProps {
  activeView: 'customer' | 'merchant' | 'rider' | 'tests';
  setActiveView: (view: 'customer' | 'merchant' | 'rider' | 'tests') => void;
  setCustomerSubView: (view: 'auth' | 'discovery' | 'checkout' | 'tracking') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  setCustomerSubView
}) => {
  const { cart, selectedAddress } = useApp();
  const cartCount = cart.reduce((acc, c) => acc + c.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 bg-orange-500 rounded-xl text-white font-bold text-xl shadow-md">
              F
            </div>
            <span
              onClick={() => {
                setActiveView('customer');
                setCustomerSubView('discovery');
              }}
              className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent cursor-pointer"
            >
              FoodDash
            </span>
          </div>

          {/* Simulator Portal Control Bar */}
          <div className="hidden md:flex items-center space-x-1 bg-gray-100 p-1.5 rounded-xl border border-gray-200">
            <button
              onClick={() => {
                setActiveView('customer');
                setCustomerSubView('discovery');
              }}
              className={`flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'customer'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5 mr-1.5" />
              Customer
            </button>

            <button
              onClick={() => setActiveView('merchant')}
              className={`flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'merchant'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 mr-1.5" />
              Merchant Terminal
            </button>

            <button
              onClick={() => setActiveView('rider')}
              className={`flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'rider'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Truck className="w-3.5 h-3.5 mr-1.5" />
              Rider Portal
            </button>

            <button
              onClick={() => setActiveView('tests')}
              className={`flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'tests'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Code className="w-3.5 h-3.5 mr-1.5" />
              Test Suite
            </button>
          </div>

          {/* Right section - Location & Cart Status */}
          <div className="flex items-center space-x-4">
            {selectedAddress && (
              <div className="hidden lg:flex items-center space-x-1 text-gray-700 bg-orange-50 px-3 py-1.5 rounded-lg text-sm border border-orange-100">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span className="font-medium truncate max-w-[140px]">
                  {selectedAddress.label}: {selectedAddress.addressLine}
                </span>
              </div>
            )}

            <button
              onClick={() => {
                setActiveView('customer');
                setCustomerSubView('checkout');
              }}
              className="relative p-2.5 text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white font-bold rounded-full h-5 w-5 text-[10px] flex items-center justify-center shadow-md animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};