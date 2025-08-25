import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
//import { ProfileData } from '../types';


interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone2?: string;
  address?: string;
  birthDate?: string;
}

const profileSchema = yup.object({
  firstName: yup.string().required('Имя обязательно'),
  lastName: yup.string().required('Фамилия обязательна'),
  phone2: yup.string().optional(),
  address: yup.string().optional(),
  birthDate: yup
    .string()
    .optional()
    .test('valid-date', 'Неверный формат даты', (value) => {
      if (!value) return true;
      return /^\d{4}-\d{2}-\d{2}$/.test(value);
    }),
});

export const ProfilePage: React.FC = () => {
  const { user, updateUserProfile } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    // Явное приведение типа resolver
    resolver: yupResolver(profileSchema) as any,
    defaultValues: {
      firstName: user?.profile?.firstName || '',
      lastName: user?.profile?.lastName || '',
      phone2: user?.profile?.phone2 || '',
      address: user?.profile?.address || '',
      birthDate: user?.profile?.birthDate 
        ? user.profile.birthDate.split('T')[0] 
        : '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const filteredData = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== '' && value !== undefined && value !== null) {
          acc[key as keyof ProfileFormData] = value;
        }
        return acc;
      }, {} as Partial<ProfileFormData>);

      await updateUserProfile(filteredData);
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Профиль пользователя</h1>
        <p className="mt-2 text-gray-600">Управляйте своей личной информацией</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Info Card */}
        <Card>
          <div className="text-center">
            <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {user?.profile?.firstName} {user?.profile?.lastName}
            </h3>
            <p className="text-gray-600 mb-4">{user?.email}</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Роль:</span>
                <Badge variant={user?.role === 'DEVELOPER' ? 'info' : 'default'}>
                  {user?.role === 'DEVELOPER' ? 'Застройщик' : 'Покупатель'}
                </Badge>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                {user?.email}
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                {user?.phone}
              </div>
              
              {user?.profile?.address && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {user.profile.address}
                </div>
              )}
              
              {user?.profile?.birthDate && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(user.profile.birthDate).toLocaleDateString('ru-RU')}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Редактировать профиль
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Имя"
                  {...register('firstName')}
                  error={errors.firstName?.message}
                />
                
                <Input
                  label="Фамилия"
                  {...register('lastName')}
                  error={errors.lastName?.message}
                />
              </div>

              <Input
                label="Дополнительный телефон"
                type="tel"
                {...register('phone2')}
                error={errors.phone2?.message}
                placeholder="+7 (999) 123-45-67"
              />

              <Input
                label="Адрес"
                {...register('address')}
                error={errors.address?.message}
                placeholder="г. Москва, ул. Примерная, д. 1, кв. 10"
              />

              <Input
                label="Дата рождения"
                type="date"
                {...register('birthDate')}
                error={errors.birthDate?.message}
              />

              <div className="flex justify-end pt-6 border-t border-gray-200">
                <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
                  Сохранить изменения
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};