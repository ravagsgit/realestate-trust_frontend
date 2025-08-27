import type { Apartment, UserProfile } from '../types';

export interface Booking {
  id: string;
  apartmentId: string;
  buyerId: string;
  developerId: string;
  status: 'RESERVED' | 'CONTRACT_SIGNED' | 'PAYMENT_IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  bookingDate: string;
  expiryDate?: string;
  price: number;
  paymentTerms?: any;
  notes?: string;
  contractNumber?: string;
  createdAt: string;
  updatedAt: string;
  
  apartment: Apartment;
  buyer: {
    id: string;
    email: string;
    phone: string;
    profile?: UserProfile;
  };
  developer: {
    id: string;
    name: string;
  };
  documents: Array<{
    id: string;
    type: string;
    status: string;
  }>;
  payments: Array<{
    id: string;
    amount: number;
    dueDate: string;
    status: string;
  }>;
  _count?: {
    documents: number;
    payments: number;
  };
}

export interface CreateBookingData {
  apartmentId: string;
  notes?: string;
  expiryHours?: number;
  paymentTerms?: {
    initialPayment?: number;
    installments?: Array<{
      amount: number;
      dueDate: string;
      description: string;
    }>;
  };
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}