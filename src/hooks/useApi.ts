// src/hooks/useApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import { toast } from 'react-hot-toast';

// Хук для получения комплексов
export const useComplexes = (params?: any) => {
  return useQuery({
    queryKey: ['complexes', params],
    queryFn: () => ApiService.getComplexes(params),
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};

// Хук для получения конкретного комплекса
export const useComplex = (id: string) => {
  return useQuery({
    queryKey: ['complex', id],
    queryFn: () => ApiService.getComplexById(id),
    enabled: !!id,
  });
};

// Хук для создания комплекса
export const useCreateComplex = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ApiService.createComplex,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complexes'] });
      toast.success('Жилой комплекс успешно создан!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Ошибка создания комплекса';
      toast.error(message);
    },
  });
};

// Хук для обновления комплекса
export const useUpdateComplex = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      ApiService.updateComplex(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['complexes'] });
      queryClient.invalidateQueries({ queryKey: ['complex', variables.id] });
      toast.success('Комплекс успешно обновлен!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Ошибка обновления комплекса';
      toast.error(message);
    },
  });
};

// Хук для удаления комплекса
export const useDeleteComplex = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ApiService.deleteComplex,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complexes'] });
      toast.success('Комплекс успешно удален!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Ошибка удаления комплекса';
      toast.error(message);
    },
  });
};

// Хуки для квартир
export const useApartments = (params?: any) => {
  return useQuery({
    queryKey: ['apartments', params],
    queryFn: () => ApiService.getApartments(params),
    staleTime: 2 * 60 * 1000, // 2 минуты
  });
};

export const useApartment = (id: string) => {
  return useQuery({
    queryKey: ['apartment', id],
    queryFn: () => ApiService.getApartmentById(id),
    enabled: !!id,
  });
};

export const useCreateApartment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ complexId, data }: { complexId: string; data: any }) => 
      ApiService.createApartment(complexId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apartments'] });
      queryClient.invalidateQueries({ queryKey: ['complexes'] });
      toast.success('Квартира успешно создана!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Ошибка создания квартиры';
      toast.error(message);
    },
  });
};

export const useUpdateApartment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      ApiService.updateApartment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['apartments'] });
      queryClient.invalidateQueries({ queryKey: ['apartment', variables.id] });
      toast.success('Квартира успешно обновлена!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Ошибка обновления квартиры';
      toast.error(message);
    },
  });
};

export const useDeleteApartment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ApiService.deleteApartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apartments'] });
      queryClient.invalidateQueries({ queryKey: ['complexes'] });
      toast.success('Квартира успешно удалена!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Ошибка удаления квартиры';
      toast.error(message);
    },
  });
};

// Хуки для блокировок
export const useLockApartment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      ApiService.lockApartment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['apartment', variables.id] });
      toast.success('Квартира заблокирована!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Ошибка блокировки квартиры';
      toast.error(message);
    },
  });
};

export const useUnlockApartment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ApiService.unlockApartment,
    onSuccess: (_, apartmentId) => {
      queryClient.invalidateQueries({ queryKey: ['apartment', apartmentId] });
      toast.success('Блокировка снята!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Ошибка снятия блокировки';
      toast.error(message);
    },
  });
};