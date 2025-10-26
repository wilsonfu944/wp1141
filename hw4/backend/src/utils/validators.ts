export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const validateLatitude = (lat: number): boolean => {
  return lat >= -90 && lat <= 90;
};

export const validateLongitude = (lng: number): boolean => {
  return lng >= -180 && lng <= 180;
};

