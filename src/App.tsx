import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { CustomerAuth } from './views/CustomerAuth';
import { CustomerDiscovery } from './views/CustomerDiscovery';
import { CartCheckout } from './views/CartCheckout';
import { OrderTracking } from './views/OrderTracking';
import { MerchantDashboard } from './views/MerchantDashboard';
import { RiderInterface } from './views/RiderInterface';
import { TestSuiteUI } from './views/TestSuiteUI';
import { FoodItem, CartItem } from './types';
import { AlertCircle, Terminal, Truck, Sparkles, Check, ShoppingCart } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, addToCart, cart } = useApp();
  const [activeView, setActiveView] = useState<'customer' | 'merchant' | 'rider' | 'tests'>('customer');
  const [customerSubView, setCustomerSubView] = useState<'auth' | 'discovery' | 'checkout' | 'tracking'>('discovery');
  
  // Modal customization states
  const [customizingFoodItem, setCustomizingFoodItem] = useState<FoodItem | null>(null);
  const [customizationNote, setCustomizationNote] = useState('');
  const [qty, setQty] = useState(1);

  const handleOpenFoodCustomization = (item: FoodItem) => {
    setCustomizingFoodItem(item);
    setQty(1);
    setCustomizationNote('');
  };

  const handleAddToCartSubmit = () => {
    if (customizingFoodItem) {
      addToCart(customizingFoodItem, qty, customizationNote);
      setCustomizingFoodItem(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        setCustomerSubView={setCustomerSubView}
      />

      <main className="flex-grow pb-24">
        {activeView === 'customer' && (
          <>
            {!user.isAuthenticated && customerSubView !== 'discovery' ? (
              <CustomerAuth onAuthSuccess={() => setCustomerSubView('discovery')} />
            ) : (
              <>
                {customerSubView === 'auth' && (
                  <CustomerAuth onAuthSuccess={() => setCustomerSubView('discovery')} />
                )}
                {customerSubView === 'discovery' && (
                  <CustomerDiscovery onOpenFoodCustomization={handleOpenFoodCustomization} />
                )}
                {customerSubView === 'checkout' && (
                  <CartCheckout onOrderSuccess={() => setCustomerSubView('tracking')} />
                )}
                {customerSubView === 'tracking' && <OrderTracking />}
              </>
            )}
          </>
        )}

        {activeView === 'merchant' && <MerchantDashboard />}
        {activeView === 'rider' && <RiderInterface />}
        {activeView === 'tests' && <TestSuiteUI />}
      </main>

      {/* Food Customization Modal popup */}
      {customizingFoodItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
            <img
              src={customizingFoodItem.image}
              alt={customizingFoodItem.name}
              className="w-full h-56 object-cover bg-gray-100"
            />
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-gray-800">{customizingFoodItem.name}</h3>
                <span className="text-orange-500 font-extrabold text-base">
                  ${customizingFoodItem.price.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-500">{customizingFoodItem.description}</p>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                  Special Customization Request
                </label>
                <input
                  type="text"
                  placeholder="e.g. Extra sauce, no onions, gluten free bun..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-orange-500 focus:border-orange-500"
                  value={customizationNote}
                  onChange={(e) => setCustomizationNote(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-3.5">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="font-bold text-sm text-gray-800">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCustomizingFoodItem(null)}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddToCartSubmit}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 rounded-xl text-sm transition-all shadow-md flex items-center gap-1.5"
                  >
                    <ShoppingCart className="w-4 h-4" /> Add To Basket
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Demonstration Panel at screen bottom (Simulates full lifecycle) */}
      <div className="fixed bottom-0 inset-x-0 bg-gray-900 text-white border-t border-gray-800 py-3 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[10px] text-gray-400">SOCKET: ACTIVE</span>
            <span className="text-gray-600">|</span>
            <span className="font-mono text-[10px] text-gray-400">DB: MONGODB_MOCK_CONNECTED</span>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 text-gray-300">
            <span className="text-[10px] bg-gray-800 text-orange-400 font-bold px-2 py-0.5 rounded">
              Customer Flow:
            </span>
            <button
              onClick={() => {
                setActiveView('customer');
                setCustomerSubView('discovery');
              }}
              className="hover:text-white transition-colors underline decoration-orange-500"
            >
              1. Discovery / Distance Filter
            </button>
            <button
              onClick={() => {
                setActiveView('customer');
                setCustomerSubView('checkout');
              }}
              className="hover:text-white transition-colors underline decoration-orange-500"
            >
              2. Cart & Checkout
            </button>
            <button
              onClick={() => {
                setActiveView('customer');
                setCustomerSubView('tracking');
              }}
              className="hover:text-white transition-colors underline decoration-orange-500"
            >
              3. SLA Tracking
            </button>
            <span className="text-gray-700">|</span>
            <button
              onClick={() => setActiveView('merchant')}
              className="text-orange-400 hover:text-orange-300 transition-colors font-bold flex items-center"
            >
              <Terminal className="w-3 h-3 mr-1" /> Merchant Mode
            </button>
            <button
              onClick={() => setActiveView('rider')}
              className="text-sky-400 hover:text-sky-300 transition-colors font-bold flex items-center"
            >
              <Truck className="w-3 h-3 mr-1" /> Rider Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}