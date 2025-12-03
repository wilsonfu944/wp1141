import axios from 'axios';

const GOOGLE_MAPS_SERVER_KEY = process.env.GOOGLE_MAPS_SERVER_KEY;
const BASE_URL = 'https://maps.googleapis.com/maps/api';

export interface GeocodeResult {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export interface PlaceSearchResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
}

export interface DirectionResult {
  routes: Array<{
    legs: Array<{
      distance: { text: string; value: number };
      duration: { text: string; value: number };
      steps: any[];
    }>;
  }>;
}

export const geocodeAddress = async (address: string): Promise<GeocodeResult> => {
  if (!GOOGLE_MAPS_SERVER_KEY) {
    throw new Error('Google Maps Server Key is not configured');
  }

  const response = await axios.get(`${BASE_URL}/geocode/json`, {
    params: {
      address,
      key: GOOGLE_MAPS_SERVER_KEY
    }
  });

  if (response.data.status !== 'OK') {
    throw new Error(`Geocoding failed: ${response.data.status}`);
  }

  return response.data.results[0];
};

export const searchPlaces = async (keyword: string, lat?: number, lng?: number, radius = 5000): Promise<PlaceSearchResult[]> => {
  if (!GOOGLE_MAPS_SERVER_KEY) {
    throw new Error('Google Maps Server Key is not configured');
  }

  const params: any = {
    query: keyword,
    key: GOOGLE_MAPS_SERVER_KEY
  };

  if (lat && lng) {
    params.location = `${lat},${lng}`;
    params.radius = radius;
  }

  const response = await axios.get(`${BASE_URL}/place/textsearch/json`, {
    params
  });

  if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
    throw new Error(`Place search failed: ${response.data.status}`);
  }

  return response.data.results || [];
};

export const getDirections = async (origin: string, destination: string): Promise<DirectionResult> => {
  if (!GOOGLE_MAPS_SERVER_KEY) {
    throw new Error('Google Maps Server Key is not configured');
  }

  const response = await axios.get(`${BASE_URL}/directions/json`, {
    params: {
      origin,
      destination,
      key: GOOGLE_MAPS_SERVER_KEY
    }
  });

  if (response.data.status !== 'OK') {
    throw new Error(`Directions failed: ${response.data.status}`);
  }

  return response.data;
};

