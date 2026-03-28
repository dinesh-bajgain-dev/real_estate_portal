import api from './client';
import type { AuthResponse, Property, User, AdminStats, PropertyFormData } from '../types';

// ── Auth ─────────────────────────────────────────────────────────────────────

export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/auth/register', data);
  return res.data;
};

export const loginUser = async (data: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/auth/login', data);
  return res.data;
};

export const fetchMe = async (): Promise<User> => {
  const res = await api.get<{ success: boolean; user: User }>('/auth/me');
  return res.data.user;
};

// ── Properties ───────────────────────────────────────────────────────────────

export const fetchProperties = async (): Promise<Property[]> => {
  const res = await api.get<{ success: boolean; properties: Property[] }>('/properties');
  return res.data.properties;
};

// ── Favourites ────────────────────────────────────────────────────────────────

export const fetchFavourites = async (): Promise<Property[]> => {
  const res = await api.get<{ success: boolean; favourites: Property[] }>('/favourites');
  return res.data.favourites;
};

export const addToFavourites = async (propertyId: string): Promise<void> => {
  await api.post(`/favourites/${propertyId}`);
};

export const removeFromFavourites = async (propertyId: string): Promise<void> => {
  await api.delete(`/favourites/${propertyId}`);
};

// ── Admin ─────────────────────────────────────────────────────────────────────

export const adminFetchStats = async (): Promise<AdminStats> => {
  const res = await api.get<{ success: boolean; stats: AdminStats }>('/admin/stats');
  return res.data.stats;
};

export const adminFetchProperties = async (): Promise<Property[]> => {
  const res = await api.get<{ success: boolean; properties: Property[] }>('/admin/properties');
  return res.data.properties;
};

export const adminCreateProperty = async (data: PropertyFormData): Promise<Property> => {
  const res = await api.post<{ success: boolean; property: Property }>('/admin/properties', {
    ...data,
    price: Number(data.price),
    bedrooms: Number(data.bedrooms),
    bathrooms: Number(data.bathrooms),
    area_sqft: Number(data.area_sqft),
  });
  return res.data.property;
};

export const adminUpdateProperty = async (id: string, data: Partial<PropertyFormData>): Promise<Property> => {
  const payload: Record<string, unknown> = { ...data };
  if (data.price !== undefined) payload.price = Number(data.price);
  if (data.bedrooms !== undefined) payload.bedrooms = Number(data.bedrooms);
  if (data.bathrooms !== undefined) payload.bathrooms = Number(data.bathrooms);
  if (data.area_sqft !== undefined) payload.area_sqft = Number(data.area_sqft);
  const res = await api.put<{ success: boolean; property: Property }>(`/admin/properties/${id}`, payload);
  return res.data.property;
};

export const adminDeleteProperty = async (id: string): Promise<void> => {
  await api.delete(`/admin/properties/${id}`);
};

export const adminFetchUsers = async (): Promise<User[]> => {
  const res = await api.get<{ success: boolean; users: User[] }>('/admin/users');
  return res.data.users;
};

export const adminDeleteUser = async (id: string): Promise<void> => {
  await api.delete(`/admin/users/${id}`);
};
