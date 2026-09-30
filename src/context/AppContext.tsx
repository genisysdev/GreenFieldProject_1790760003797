import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Address, Restaurant, CartItem, Order, FoodItem } from '../types';
import { calculateDistance } from '../utils/haversine';
import { playNotificationSound } from '../utils/audio';

interface AppContextType {
  user: User;
  setUser: (user: User) => void;
  addresses: Address[];
  addAddress: (address: Omit<Address, 'id'>) => void;
  selectedAddress: Address | null;
  setSelectedAddress: (address: Address | null) => void;
  restaurants: Restaurant[];
  toggleRestaurantStatus: (id: string) => void;
  cart: CartItem[];
  addToCart: (item: FoodItem, qty: number, customization?: string) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  orders: Order[];
  createOrder: (coupon?: string) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  gpsCoords: { latitude: number; longitude: number };
  setGpsCoords: (coords: { latitude: number; longitude: number }) => void;
  activeRiderOrder: Order | null;
  setActiveRiderOrder: (order: Order | null) => void;
  couponApplied: string | null;
  setCouponApplied: (coupon: string | null) => void;
}

const defaultRestaurants: Restaurant[] = [
  {
    id: 'rest-1',
    name: 'Gourmet Burger Kitchen',
    cuisine: 'American',
    rating: 4.8,
    priceTier: '$$',
    latitude: 37.7749,
    longitude: -122.4194, // 0 km distance if user is at default SF coordinate
    address: '101 Market St, San Francisco, CA',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60',
    isOpen: true,
    isVegetarian: false,
    menu: [
      { id: 'm1', name: 'Truffle Cheeseburger', description: 'Angus beef patty, black truffle aioli, aged cheddar, wild mushrooms', price: 16.99, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60', category: 'Burgers', isVegetarian: false, available: true },
      { id: 'm2', name: 'Spicy Avocado Burger', description: 'Fresh avocado, pepper jack, grilled jalapeños, spicy chipotle spread', price: 15.50, image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=60', category: 'Burgers', isVegetarian: false, available: true },
      { id: 'm3', name: 'Sweet Potato Fries', description: 'Crisp seasoned sweet potato fries served with garlic dip', price: 5.99, image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=500&auto=format&fit=crop&q=60', category: 'Sides', isVegetarian: true, available: true }
    ]
  },
  {
    id: 'rest-2',
    name: 'Lotus Blossom Thai',
    cuisine: 'Asian',
    rating: 4.6,
    priceTier: '$$',
    latitude: 37.7950,
    longitude: -122.4080, // ~2.4 km away
    address: '890 Chinatown Ave, San Francisco, CA',
    image: 'https://images.unsplash.com/photo-1559311648-d46f4d8593d6?w=500&auto=format&fit=crop&q=60',
    isOpen: true,
    isVegetarian: true,
    menu: [
      { id: 'm4', name: 'Classic Pad Thai', description: 'Stir-fried rice noodles, egg, tofu, bean sprouts, crushed peanuts, tamarind glaze', price: 14.50, image: 'https://images.unsplash.com/photo-1559311648-d46f4d8593d6?w=500&auto=format&fit=crop&q=60', category: 'Noodles', isVegetarian: true, available: true },
      { id: 'm5', name: 'Green Curry Bowl', description: 'Creamy coconut milk, green chili paste, bamboo shoots, eggplant, fresh basil', price: 15.00, image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=500&auto=format&fit=crop&q=60', category: 'Curry', isVegetarian: true, available: true }
    ]
  },
  {
    id: 'rest-3',
    name: 'Pizzeria Deliziosa',
    cuisine: 'Italian',
    rating: 4.9,
    priceTier: '$$$',
    latitude: 37.7599,
    longitude: -122.4350, // ~2.2 km away
    address: '456 Mission St, San Francisco, CA',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60',
    isOpen: true,
    isVegetarian: true,
    menu: [
      { id: 'm6', name: 'Margherita DOC', description: 'San Marzano tomatoes, fresh buffalo mozzarella, fragrant basil, EVOO', price: 18.00, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60', category: 'Pizza', isVegetarian: true, available: true },
      { id: 'm7', name: 'Diavola Pizza', description: 'Spicy Calabrian salami, red pepper flakes, fresh mozzarella, tomato base', price: 21.00, image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&auto=format&fit=crop&q=60', category: 'Pizza', isVegetarian: false, available: true }
    ]
  },
  {
    id: 'rest-4',
    name: 'Faraway Oasis Cafe',
    cuisine: 'Middle Eastern',
    rating: 4.2,
    priceTier: '$',
    latitude: 37.8500,
    longitude: -122.4900, // ~10.4 km away (out of default 8km radius)
    address: '12 Cliff Dr, Marin County, CA',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60',
    isOpen: true,
    isVegetarian: true,
    menu: [
      { id: 'm8', name: 'Hummus & Falafel Plate', description: 'Creamy artisanal hummus with golden falafel fritters and fresh baked pita', price: 9.99, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60', category: 'Appetizers', isVegetarian: true, available: true }
    ]
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>({
    email: 'test@example.com',
    phone: '+15551234567',
    name: 'Alex Johnson',
    isAuthenticated: false,
  });

  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: 'addr-1',
      label: 'Home',
      addressLine: '123 Pine St, San Francisco, CA',
      latitude: 37.7749,
      longitude: -122.4194,
    },
    {
      id: 'addr-2',
      label: 'Work',
      addressLine: '555 California St, San Francisco, CA',
      latitude: 37.7915,
      longitude: -122.4032,
    }
  ]);

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(addresses[0]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>(defaultRestaurants);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [gpsCoords, setGpsCoords] = useState({ latitude: 37.7749, longitude: -122.4194 });
  const [activeRiderOrder, setActiveRiderOrder] = useState<Order | null>(null);
  const [couponApplied, setCouponApplied] = useState<string | null>(null);

  // Background timeout system to reject active merchant SLA timeout orders
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order.status === 'pending' && order.merchantTimeoutAt && now > order.merchantTimeoutAt) {
            return { ...order, status: 'rejected' };
          }
          return order;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addAddress = (addr: Omit<Address, 'id'>) => {
    const newAddr: Address = {
      ...addr,
      id: `addr-${Date.now()}`,
    };
    setAddresses((prev) => [...prev, newAddr]);
    if (!selectedAddress) setSelectedAddress(newAddr);
  };

  const toggleRestaurantStatus = (id: string) => {
    setRestaurants((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isOpen: !r.isOpen } : r))
    );
  };

  const addToCart = (item: FoodItem, qty: number, customization?: string) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (ci) => ci.foodItem.id === item.id && ci.customization === customization
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += qty;
        return updated;
      }
      return [...prev, { foodItem: item, quantity: qty, customization }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.foodItem.id !== id));
  };

  const clearCart = () => setCart([]);

  const createOrder = (coupon?: string) => {
    if (cart.length === 0 || !selectedAddress) return;
    const orderId = `order-${Math.floor(1000 + Math.random() * 9000)}`;
    const restaurant = restaurants.find((r) => r.menu.some((item) => item.id === cart[0].foodItem.id));
    if (!restaurant) return;

    const discountMultiplier = coupon === 'SAVE20' ? 0.8 : 1.0;
    const subtotal = cart.reduce((acc, item) => acc + item.foodItem.price * item.quantity, 0);
    const total = subtotal * discountMultiplier + 4.99; // 4.99 flat delivery fee

    const pickupPIN = Math.floor(1000 + Math.random() * 9000).toString();
    const deliveryOTP = Math.floor(100000 + Math.random() * 900000).toString();

    const newOrder: Order = {
      id: orderId,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      items: [...cart],
      totalAmount: parseFloat(total.toFixed(2)),
      deliveryAddress: selectedAddress,
      status: 'pending',
      createdAt: new Date().toISOString(),
      merchantTimeoutAt: Date.now() + 180000, // 180 seconds countdown
      pickupPIN,
      deliveryOTP,
      customerName: user.name,
      customerPhone: user.phone,
      riderLatitude: restaurant.latitude,
      riderLongitude: restaurant.longitude,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setCouponApplied(null);
    playNotificationSound(); // Play simulated live Webhook Audio alarm for order receipt
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === id) {
          const updatedOrder: Order = { ...order, status };
          // Synchronize with active rider terminal
          if (activeRiderOrder && activeRiderOrder.id === id) {
            setActiveRiderOrder(updatedOrder);
          }
          return updatedOrder;
        }
        return order;
      })
    );
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        addresses,
        addAddress,
        selectedAddress,
        setSelectedAddress,
        restaurants,
        toggleRestaurantStatus,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        orders,
        createOrder,
        updateOrderStatus,
        gpsCoords,
        setGpsCoords,
        activeRiderOrder,
        setActiveRiderOrder,
        couponApplied,
        setCouponApplied,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};