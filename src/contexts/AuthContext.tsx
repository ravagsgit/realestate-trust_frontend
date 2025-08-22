import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthResponse, LoginCredentials, RegisterData } from '../types';
import { ApiService } from '../services/api';
import { toast } from 'react-hot-toast';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User };

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
      };
    case 'LOGOUT':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User['profile']>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Проверяем токен при загрузке приложения
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      dispatch({ type: 'AUTH_FAILURE' });
      return;
    }

    try {
      dispatch({ type: 'AUTH_START' });
      const user = await ApiService.getCurrentUser();
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' });
      // Очищаем недействительные токены
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const authResponse: AuthResponse = await ApiService.login(credentials);
      
      // Сохраняем токены
      localStorage.setItem('accessToken', authResponse.tokens.accessToken);
      localStorage.setItem('refreshToken', authResponse.tokens.refreshToken);
      
      dispatch({ type: 'AUTH_SUCCESS', payload: authResponse.user });
      toast.success('Вход выполнен успешно!');
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE' });
      const message = error.response?.data?.error?.message || 'Ошибка входа';
      toast.error(message);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      await ApiService.register(data);
      
      // После регистрации автоматически логинимся
      await login({ email: data.email, password: data.password });
      toast.success('Регистрация прошла успешно!');
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE' });
      const message = error.response?.data?.error?.message || 'Ошибка регистрации';
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await ApiService.logout();
    } catch (error) {
      // Игнорируем ошибки при выходе
    } finally {
      dispatch({ type: 'LOGOUT' });
      toast.success('Выход выполнен успешно');
    }
  };

  const updateUserProfile = async (data: Partial<User['profile']>) => {
    try {
      const updatedProfile = await ApiService.updateProfile(data);
      
      // Обновляем пользователя в состоянии
      if (state.user) {
        const updatedUser = { ...state.user, profile: updatedProfile };
        dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      }
      
      toast.success('Профиль обновлен успешно!');
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Ошибка обновления профиля';
      toast.error(message);
      throw error;
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};