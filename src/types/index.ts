// src/types/index.ts
export interface User {
  id: string;
  email: string;
  phone: string;
  role: 'BUYER' | 'DEVELOPER' | 'ADMIN';
  isActive: boolean;
  profile?: UserProfile;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone2?: string;
  address?: string;
  birthDate?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface ResidentialComplex {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  constructionStatus: 'PLANNING' | 'FOUNDATION' | 'CONSTRUCTION' | 'FINISHING' | 'COMPLETED';
  completionDate?: string;
  images: string[];
  metadata?: any;
  totalApartments: number;
  createdAt: string;
  updatedAt: string;
  developer: {
    id: string;
    name: string;
  };
  apartments?: Apartment[];
  _count?: {
    apartments: number;
  };
}

export interface Apartment {
  id: string;
  number: string;
  floor: number;
  entrance?: number;
  area: number;
  rooms: number;
  price: number;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'BLOCKED';
  features?: any;
  images: string[];
  createdAt: string;
  updatedAt: string;
  complex: ResidentialComplex;
  bookings?: any[];
  locks?: any[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  timestamp: string;
}

export interface LoginCredentials {
  email?: string;
  phone?: string;
  password: string;
}

export interface RegisterData {
  email: string;
  phone: string;
  password: string;
  role?: 'BUYER' | 'DEVELOPER';
  firstName?: string;
  lastName?: string;
}