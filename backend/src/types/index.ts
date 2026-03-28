export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: Date;
  updated_at: Date;
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
  created_at: Date;
  is_favourited?: boolean; // added dynamically in responses
}

export interface Favourite {
  id: string;
  user_id: string;
  property_id: string;
  created_at: Date;
}

// Extends Express Request to include the authenticated user payload
export interface AuthRequest extends Express.Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}
