import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Building2, Eye, EyeOff, User, Building } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { RegisterData } from '../types';

interface RegisterFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: 'BUYER' | 'DEVELOPER';
  agreement: boolean;
}

const  registerSchema: yup.ObjectSchema<RegisterFormData> = yup.object({
  email: yup
    .string()
    .email('Неверный формат email')
    .required('Email обязателен'),
  firstName: yup.string().required('Имя обязательно'),
  lastName: yup.string().required('Фамилия обязательна'),
  phone: yup
    .string()
    .matches( 
      /^(\+7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/,
      'Неверный формат номера телефона'
    )
    .required('Телефон обязателен'),
  password: yup
    .string()
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .required('Пароль обязателен'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Пароли должны совпадать')
    .required('Подтверждение пароля обязательно'),
  role: yup.string().oneOf(['BUYER', 'DEVELOPER']).required('Выберите роль'),
  agreement: yup.boolean().oneOf([true], 'Необходимо согласие с условиями'),
}) as yup.ObjectSchema<RegisterFormData>;

export const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      role: 'BUYER',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { confirmPassword, agreement, ...formData } = data;
      
      // Создаем объект RegisterData с правильной типизацией
      const registerData: RegisterData = {
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        firstName: formData.firstName,
        lastName: formData.lastName,
      };
      
      await registerUser(registerData);
    } catch (error) {
      // Ошибки обрабатываются в AuthContext
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <Building2 className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Создать аккаунт
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Присоединитесь к RealEstate Trust
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Выберите роль
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="relative cursor-pointer">
                  <input
                    type="radio"
                    value="BUYER"
                    {...register('role')}
                    className="sr-only"
                  />
                  <div className={`p-4 border rounded-lg text-center transition-colors ${
                    selectedRole === 'BUYER'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}>
                    <User className="h-6 w-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">Покупатель</span>
                  </div>
                </label>
                <label className="relative cursor-pointer">
                  <input
                    type="radio"
                    value="DEVELOPER"
                    {...register('role')}
                    className="sr-only"
                  />
                  <div className={`p-4 border rounded-lg text-center transition-colors ${
                    selectedRole === 'DEVELOPER'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}>
                    <Building className="h-6 w-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">Застройщик</span>
                  </div>
                </label>
              </div>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Имя"
                {...register('firstName')}
                error={errors.firstName?.message}
                placeholder="Иван"
              />
              <Input
                label="Фамилия"
                {...register('lastName')}
                error={errors.lastName?.message}
                placeholder="Иванов"
              />
            </div>

            {/* Contact Info */}
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="your.email@example.com"
            />

            <Input
              label="Телефон"
              type="tel"
              {...register('phone')}
              error={errors.phone?.message}
              placeholder="+7 (999) 123-45-67"
            />

            {/* Passwords */}
            <div className="relative">
              <Input
                label="Пароль"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                {...register('password')}
                error={errors.password?.message}
                placeholder="Минимум 6 символов"
              />
              <button
                type="button"
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Подтвердите пароль"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
                placeholder="Повторите пароль"
              />
              <button
                type="button"
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Agreement */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="agreement"
                  type="checkbox"
                  {...register('agreement')}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="agreement" className="text-gray-700">
                  Я согласен с{' '}
                  <a href="#" className="text-primary-600 hover:text-primary-500">
                    условиями использования
                  </a>{' '}
                  и{' '}
                  <a href="#" className="text-primary-600 hover:text-primary-500">
                    политикой конфиденциальности
                  </a>
                </label>
                {errors.agreement && (
                  <p className="mt-1 text-red-600">{errors.agreement.message}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Создать аккаунт
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Уже есть аккаунт?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Войти
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};