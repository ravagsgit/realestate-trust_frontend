// src/services/api.ts
import axios, { AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import { 
  ApiResponse, 
  AuthResponse, 
  LoginCredentials, 
  RegisterData,
  User,
  ResidentialComplex,
  Apartment 
} from '../types';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

// Создаем экземпляр axios
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик запросов для добавления токена
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Перехватчик ответов для обработки ошибок
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as any;

    // Обработка 401 ошибки (истек токен)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await api.post('/auth/refresh', {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          // Повторяем оригинальный запрос с новым токеном
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token тоже недействителен, выходим из системы
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Показываем уведомление об ошибке
    const message = error.response?.data?.error?.message || 'Произошла ошибка';
    if (error.response?.status !== 401) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

// API методы
export class ApiService {
  // Аутентификация
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data.data!;
  }

  static async register(data: RegisterData): Promise<User> {
    const response = await api.post<ApiResponse<User>>('/auth/register', data);
    return response.data.data!;
  }

  static async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  static async getCurrentUser(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data.data!;
  }

  static async updateProfile(data: Partial<User['profile']>): Promise<User['profile']> {
    const response = await api.put<ApiResponse<User['profile']>>('/users/profile', data);
    return response.data.data!;
  }

  // Жилые комплексы
  static async getComplexes(params?: {
    page?: number;
    limit?: number;
    search?: string;
    developerId?: string;
    constructionStatus?: string;
  }): Promise<{ complexes: ResidentialComplex[]; pagination: any }> {
    const response = await api.get<ApiResponse<ResidentialComplex[]>>('/complexes', {
      params,
    });
    return {
      complexes: response.data.data!,
      pagination: response.data.pagination!,
    };
  }

  static async getComplexById(id: string): Promise<ResidentialComplex> {
    const response = await api.get<ApiResponse<ResidentialComplex>>(`/complexes/${id}`);
    return response.data.data!;
  }

  static async createComplex(data: Partial<ResidentialComplex>): Promise<ResidentialComplex> {
    const response = await api.post<ApiResponse<ResidentialComplex>>('/complexes', data);
    return response.data.data!;
  }

  static async updateComplex(id: string, data: Partial<ResidentialComplex>): Promise<ResidentialComplex> {
    const response = await api.put<ApiResponse<ResidentialComplex>>(`/complexes/${id}`, data);
    return response.data.data!;
  }

  static async deleteComplex(id: string): Promise<void> {
    await api.delete(`/complexes/${id}`);
  }

  static async getComplexStats(id: string): Promise<any> {
    const response = await api.get<ApiResponse<any>>(`/complexes/${id}/stats`);
    return response.data.data!;
  }

  // Квартиры
  static async getApartments(params?: {
    page?: number;
    limit?: number;
    complexId?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    rooms?: number[];
    minFloor?: number;
    maxFloor?: number;
  }): Promise<{ apartments: Apartment[]; pagination: any }> {
    // Преобразуем массив rooms в строку для query параметров
    const queryParams = { ...params };
    if (params?.rooms && Array.isArray(params.rooms)) {
      (queryParams as any).rooms = params.rooms.join(',');
    }

    const response = await api.get<ApiResponse<Apartment[]>>('/apartments', {
      params: queryParams,
    });
    return {
      apartments: response.data.data!,
      pagination: response.data.pagination!,
    };
  }

  static async getApartmentById(id: string): Promise<Apartment> {
    const response = await api.get<ApiResponse<Apartment>>(`/apartments/${id}`);
    return response.data.data!;
  }

  static async createApartment(complexId: string, data: Partial<Apartment>): Promise<Apartment> {
    const response = await api.post<ApiResponse<Apartment>>(`/apartments/complex/${complexId}`, data);
    return response.data.data!;
  }

  static async updateApartment(id: string, data: Partial<Apartment>): Promise<Apartment> {
    const response = await api.put<ApiResponse<Apartment>>(`/apartments/${id}`, data);
    return response.data.data!;
  }

  static async deleteApartment(id: string): Promise<void> {
    await api.delete(`/apartments/${id}`);
  }

   static async lockApartment(id: string, reason?: string): Promise<Apartment> {
    const response = await api.post<ApiResponse<Apartment>>(`/apartments/${id}/lock`, {
      reason
    });
    return response.data.data!;
  }

  static async unlockApartment(id: string): Promise<Apartment> {
    const response = await api.post<ApiResponse<Apartment>>(`/apartments/${id}/unlock`);
    return response.data.data!;
  }
};