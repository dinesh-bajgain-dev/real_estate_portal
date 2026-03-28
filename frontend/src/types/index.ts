export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at?: string;
  favourites_count?: number;
}

export interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  image_url: string | null;
  property_type: string;
  is_favourited: boolean;
  created_at: string;
  favourited_at?: string;
  favourite_count?: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: { msg: string; path: string }[];
}

export interface AdminStats {
  total_properties: number;
  total_buyers: number;
  total_favourites: number;
}

export type PropertyFormData = {
  title: string;
  address: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  area_sqft: string;
  image_url: string;
  property_type: string;
};
