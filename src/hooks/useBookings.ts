import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import { toast } from 'react-hot-toast';
import type { Booking, CreateBookingData } from '../types/booking';

// Расширяем ApiService
declare module '../services/api' {
  namespace ApiService {
    function getBookings(params?: any): Promise<{ bookings: Booking[]; pagination: any }>;
    function getBookingById(id: string): Promise<Booking>;
    function createBooking(data: CreateBookingData): Promise<Booking>;
    function updateBookingStatus(id: string, status: string): Promise<Booking>;
    function cancelBooking(id: string, reason?: string): Promise<Booking>;
    function extendBooking(id: string, hours: number): Promise<Booking>;
    function getBookingStats(): Promise<any>;
    function getNotifications(params?: any): Promise<{ notifications: Notification[]; pagination: any }>;
    function markNotificationAsRead(id: string): Promise<Notification>;
    function markAllNotificationsAsRead(): Promise<{ count: number }>;
    function getUnreadNotificationsCount(): Promise<{ unreadCount: number }>;
  }
}

// Хуки для бронирований
export const useBookings = (params?: any) => {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: () => ApiService.getBookings(params),
    staleTime: 2 * 60 * 1000, // 2 минуты
  });
};

export const useBooking = (id: string) => {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => ApiService.getBookingById(id),
    enabled: !!id,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ApiService.createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['apartments'] });
      toast.success('Бронирование успешно создано!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Ошибка создания бронирования';
      toast.error(message);
    },
  });
};

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      ApiService.updateBookingStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', variables.id] });
      toast.success('Статус бронирования обновлен!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Ошибка обновления статуса';
      toast.error(message);
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => 
      ApiService.cancelBooking(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['apartments'] });
      toast.success('Бронирование отменено!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Ошибка отмены бронирования';
      toast.error(message);
    },
  });
};

export const useExtendBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, hours }: { id: string; hours: number }) => 
      ApiService.extendBooking(id, hours),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['booking', variables.id] });
      toast.success('Срок бронирования продлен!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Ошибка продления бронирования';
      toast.error(message);
    },
  });
};

// Хуки для уведомлений
export const useNotifications = (params?: any) => {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => ApiService.getNotifications(params),
    staleTime: 30 * 1000, // 30 секунд
  });
};

export const useUnreadNotificationsCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => ApiService.getUnreadNotificationsCount(),
    staleTime: 10 * 1000, // 10 секунд
    refetchInterval: 30 * 1000, // обновляем каждые 30 секунд
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ApiService.markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};