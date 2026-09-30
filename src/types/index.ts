export interface User {
  email: string;
  phone: string;
  name: string;
  isAuthenticated: boolean;
}

export interface Address {
  id: string;
  label: string;
  addressLine: string;
  latitude: number;
  longitude: number;
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isVegetarian: boolean;
  available: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  priceTier: '$' | '$$' | '$$$';
  latitude: number;
  longitude: number;
  address: string;
  image: string;
  isOpen: boolean;
  isVegetarian: boolean;
  menu: FoodItem[];
}

export interface CartItem {
  foodItem: FoodItem;
  quantity: number;
  customization?: string;
}

export interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
  totalAmount: number;
  deliveryAddress: Address;
  status: 'pending' | 'accepted' | 'preparing' | 'ready_for_pickup' | 'picked_up' | 'delivered' | 'rejected' | 'cancelled';
  createdAt: string;
  merchantTimeoutAt?: number;
  pickupPIN: string;
  deliveryOTP: string;
  customerName: string;
  customerPhone: string;
  riderId?: string;
  riderLatitude?: number;
  riderLongitude?: number;
}

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}