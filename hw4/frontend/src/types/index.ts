export interface User {
  id: number;
  email: string;
  name?: string;
  createdAt: string;
}

export interface Place {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string;
  notes?: string;
  category?: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  days?: TripDay[];
}

export interface TripDay {
  id: number;
  tripId: number;
  date: string;
  order: number;
  placeId: number;
  place?: Place;
  notes?: string;
  startTime?: string;
  endTime?: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types?: string[];
}

declare global {
  interface Window {
    google: typeof google;
  }
}

