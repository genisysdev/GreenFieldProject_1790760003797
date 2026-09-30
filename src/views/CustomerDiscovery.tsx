import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Star,
  Navigation,
  MapPin,
  Plus,
  Info,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateDistance } from '../utils/haversine';
import { FoodItem, Restaurant } from '../types';

interface CustomerDiscoveryProps {
  onOpenFoodCustomization: (item: FoodItem) => void;
}

export const CustomerDiscovery: React.FC<CustomerDiscoveryProps> = ({
  onOpenFoodCustomization,
}) => {
  const {
    restaurants,
    gpsCoords,
    setGpsCoords,
    addresses,
    addAddress,
    setSelectedAddress,
    selectedAddress,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [minRating, setMinRating] = useState<number>(0);
  const [vegOnly, setVegOnly] = useState<boolean>(false);
  const [priceTiers, setPriceTiers] = useState<string[]>([]);
  const [selectedRestId, setSelectedRestId] = useState<string | null>(null);

  // State for new address form
  const [newLabel, setNewLabel] = useState('My Custom Address');
  const [newStreet, setNewStreet] = useState('1600 Amphitheatre Pkwy, Mountain View, CA');
  const [newLat, setNewLat] = useState(37.7850);
  const [newLng, setNewLng] = useState(-122.4080);
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Simulated GPS Coordinates Retrieval
  const fetchCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const fetched = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          setGpsCoords(fetched);
        },
        () => {
          // Fallback to SF downtown core coordinates
          setGpsCoords({ latitude: 37.7749, longitude: -122.4194 });
        }
      );
    } else {
      setGpsCoords({ latitude: 37.7749, longitude: -122.4194 });
    }
  };

  // Calculate distance for all restaurants dynamically and apply rules
  const enhancedRestaurants = useMemo(() => {
    return restaurants.map((r) => {
      const distance = calculateDistance(
        { latitude: gpsCoords.latitude, longitude: gpsCoords.longitude },
        { latitude: r.latitude, longitude: r.longitude }
      );
      return { ...r, distance };
    });
  }, [restaurants, gpsCoords]);

  // Filter and sort restaurants
  const filteredRestaurants = useMemo(() => {
    return enhancedRestaurants
      .filter((r) => {
        // Filter by 8-kilometer radius rule
        if (r.distance > 8.0) return false;

        // Cuisine filter
        if (selectedCuisine && r.cuisine.toLowerCase() !== selectedCuisine.toLowerCase()) {
          return false;
        }

        // Rating filter
        if (r.rating < minRating) return false;

        // Veg option filter
        if (vegOnly && !r.isVegetarian) return false;

        // Price filter
        if (priceTiers.length > 0 && !priceTiers.includes(r.priceTier)) return false;

        // Search query
        if (
          searchQuery &&
          !r.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !r.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Demote closed or suspended restaurants to bottom of feed
        if (a.isOpen && !b.isOpen) return -1;
        if (!a.isOpen && b.isOpen) return 1;
        return 0;
      });
  }, [enhancedRestaurants, selectedCuisine, minRating, vegOnly, priceTiers, searchQuery]);

  const handlePriceTierToggle = (tier: string) => {
    setPriceTiers((prev) =>
      prev.includes(tier) ? prev.filter((p) => p !== tier) : [...prev, tier]
    );
  };

  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAddress({
      label: newLabel,
      addressLine: newStreet,
      latitude: Number(newLat),
      longitude: Number(newLng),
    });
    setShowAddressForm(false);
  };

  const activeRestaurant = restaurants.find((r) => r.id === selectedRestId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Coordinates status alert and quick toggle */}
      <div className="mb-6 bg-orange-50 border border-orange-100 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Navigation className="w-6 h-6 text-orange-500 animate-pulse" />
          <div>
            <p className="text-xs text-orange-700 font-bold tracking-wide uppercase">Current Location Core</p>
            <p className="text-sm text-gray-700">
              Lat: <span className="font-mono font-semibold">{gpsCoords.latitude.toFixed(5)}</span> | Lng:{' '}
              <span className="font-mono font-semibold">{gpsCoords.longitude.toFixed(5)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCurrentLocation}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-md transition-all"
          >
            Update GPS Coordinates
          </button>
          <button
            onClick={() => setShowAddressForm(!showAddressForm)}
            className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-xl text-xs transition-all flex items-center"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Delivery Address
          </button>
        </div>
      </div>

      {/* Address configuration form */} 
      {showAddressForm && (
        <div className="mb-8 bg-white border border-gray-100 rounded-2xl p-6 shadow-md">
          <h3 className="text-base font-bold text-gray-800 mb-4">Save Delivery Address with Geolocation Tags</h3>
          <form onSubmit={handleAddAddressSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Address Label</label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Street Address</label>
              <input
                type="text"
                value={newStreet}
                onChange={(e) => setNewStreet(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Latitude Coordinate</label>
              <input
                type="number"
                step="0.00001"
                value={newLat}
                onChange={(e) => setNewLat(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Longitude Coordinate</label>
              <input
                type="number"
                step="0.00001"
                value={newLng}
                onChange={(e) => setNewLng(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>
            <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setShowAddressForm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-all shadow-md"
              >
                Save Secure Coordinate Address
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Available Saved Addresses Selection */}
      <div className="mb-6">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">Select Saved Address</p>
        <div className="flex flex-wrap gap-2">
          {addresses.map((addr) => (
            <button
              key={addr.id}
              onClick={() => {
                setSelectedAddress(addr);
                setGpsCoords({ latitude: addr.latitude, longitude: addr.longitude });
              }}
              className={`flex items-center px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                selectedAddress?.id === addr.id
                  ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-orange-200'
              }`}
            >
              <MapPin className="w-4 h-4 mr-1.5" />
              {addr.label} ({addr.latitude.toFixed(2)}, {addr.longitude.toFixed(2)})
            </button>
          ))}
        </div>
      </div>

      {!selectedRestId ? (
        <>
          {/* Filter Overlays and Controls Section */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-8 space-y-4">
            <div className="flex flex-col lg:flex-row gap-4 justify-between">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3.5 text-gray-400 w-4.5 h-4.5" />
                <input
                  type="text"
                  placeholder="Search restaurants, cuisines, meals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                />
              </div>

              {/* Cuisine Quick Tags */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {['American', 'Asian', 'Italian', 'Middle Eastern'].map((cuisine) => (
                  <button
                    key={cuisine}
                    onClick={() => setSelectedCuisine(selectedCuisine === cuisine ? null : cuisine)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCuisine === cuisine
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Overlays Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-100">
              {/* Price Tier Toggle */}
              <div>
                <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Price Tiers
                </span>
                <div className="flex gap-2">
                  {['$', '$$', '$$$'].map((tier) => (
                    <button
                      key={tier}
                      onClick={() => handlePriceTierToggle(tier)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        priceTiers.includes(tier)
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-orange-200'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Minimum Rating
                </span>
                <div className="flex gap-1">
                  {[0, 4.0, 4.5, 4.8].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        minRating === rating
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-orange-200'
                      }`}
                    >
                      {rating === 0 ? 'Any' : `${rating}★`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Diet Options */}
              <div className="flex flex-col justify-end">
                <label className="flex items-center space-x-2.5 p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vegOnly}
                    onChange={(e) => setVegOnly(e.target.checked)}
                    className="rounded text-orange-500 focus:ring-orange-500 h-4 w-4"
                  />
                  <span className="text-xs font-bold text-gray-700 uppercase">Vegetarian Options Only</span>
                </label>
              </div>
            </div>
          </div>

          {/* Discovery Results Feed */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                Open Restaurants within 8km Radius ({filteredRestaurants.length})
              </h2>
              <p className="text-xs text-gray-500">
                *Any outlet further than 8.0 kilometers is automatically filtered
              </p>
            </div>

            {filteredRestaurants.length === 0 ? (
              <div className="bg-white rounded-2xl py-12 text-center border border-gray-100 shadow-sm">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium text-sm">No active restaurants match your filter constraints.</p>
                <p className="text-xs text-gray-400 mt-1">
                  Try setting your coordinate closer, clearing filters, or resetting prices.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRestaurants.map((rest) => (
                  <div
                    key={rest.id}
                    onClick={() => rest.isOpen && setSelectedRestId(rest.id)}
                    className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                      !rest.isOpen ? 'opacity-60 saturate-50' : 'hover:-translate-y-0.5'
                    }`}
                  >
                    <div className="relative h-44 bg-gray-100">
                      <img
                        src={rest.image}
                        alt={rest.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-lg text-[10px] font-bold text-gray-800 shadow">
                        {rest.distance.toFixed(1)} km away
                      </div>
                      {!rest.isOpen && (
                        <div className="absolute inset-0 bg-gray-900 bg-opacity-65 flex items-center justify-center">
                          <span className="bg-red-600 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-widest">
                            Closed / Out of Hours
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-800 text-base truncate">{rest.name}</h3>
                        <div className="flex items-center text-xs font-bold text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                          {rest.rating.toFixed(1)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                        <span>
                          {rest.cuisine} • {rest.priceTier}
                        </span>
                        {rest.isVegetarian && (
                          <span className="bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded">
                            VEG
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div>
          {/* Selected Restaurant Menu Details view */}
          {activeRestaurant && (
            <div className="space-y-6">
              <button
                onClick={() => setSelectedRestId(null)}
                className="text-orange-600 hover:text-orange-700 font-bold text-sm flex items-center mb-2"
              >
                ← Return to Restaurant Listing
              </button>

              <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <div className="relative h-60 bg-gray-100">
                  <img
                    src={activeRestaurant.image}
                    alt={activeRestaurant.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black to-transparent p-6 text-white">
                    <h1 className="text-2xl font-bold">{activeRestaurant.name}</h1>
                    <p className="text-sm text-gray-200 mt-1">{activeRestaurant.address}</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    Cuisine: {activeRestaurant.cuisine} | Rating: {activeRestaurant.rating} ★
                  </span>
                  {activeRestaurant.isVegetarian && (
                    <span className="bg-green-500 text-white font-bold text-xs px-2.5 py-1 rounded-full">
                      100% Vegetarian Certified
                    </span>
                  )}
                </div>
              </div>

              <h2 className="text-xl font-extrabold text-gray-800">Explore the Menu</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeRestaurant.menu.map((food) => (
                  <div
                    key={food.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-4 flex gap-4"
                  >
                    <img
                      src={food.image}
                      alt={food.name}
                      className="w-24 h-24 rounded-xl object-cover flex-shrink-0 bg-gray-100"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-gray-800 text-sm">{food.name}</h3>
                          <span className="font-extrabold text-orange-600 text-sm">
                            ${food.price.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">{food.description}</p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {food.isVegetarian ? (
                          <span className="text-[10px] text-green-600 border border-green-500 px-1.5 py-0.5 rounded font-bold">
                            VEG
                          </span>
                        ) : (
                          <span />
                        )}

                        <button
                          onClick={() => onOpenFoodCustomization(food)}
                          className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-sm transition-all"
                        >
                          Customize & Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};