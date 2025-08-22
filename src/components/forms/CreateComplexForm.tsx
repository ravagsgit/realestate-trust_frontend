import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const complexSchema = yup.object({
  name: yup
    .string()
    .min(3, 'Название должно содержать минимум 3 символа')
    .required('Название обязательно'),
  address: yup
    .string()
    .min(5, 'Адрес должен содержать минимум 5 символов')
    .required('Адрес обязателен'),
  description: yup.string().optional(),
  constructionStatus: yup
    .string()
    .oneOf(['PLANNING', 'FOUNDATION', 'CONSTRUCTION', 'FINISHING', 'COMPLETED'])
    .required('Выберите статус строительства'),
  completionDate: yup.date().optional(),
  latitude: yup.number().optional(),
  longitude: yup.number().optional(),
});

interface CreateComplexFormData {
  name: string;
  address: string;
  description?: string;
  constructionStatus: string;
  completionDate?: string;
  latitude?: number;
  longitude?: number;
}

interface CreateComplexFormProps {
  onSubmit: (data: CreateComplexFormData) => Promise<void>;
  loading?: boolean;
  onCancel: () => void;
}

export const CreateComplexForm: React.FC<CreateComplexFormProps> = ({
  onSubmit,
  loading = false,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateComplexFormData>({
    resolver: yupResolver(complexSchema),
    defaultValues: {
      constructionStatus: 'PLANNING',
    },
  });

  const handleFormSubmit = async (data: CreateComplexFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // Ошибки обрабатываются в родительском компоненте
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <Input
          label="Название ЖК"
          {...register('name')}
          error={errors.name?.message}
          placeholder="Например: Солнечный квартал"
        />

        <Input
          label="Адрес"
          {...register('address')}
          error={errors.address?.message}
          placeholder="г. Москва, ул. Примерная, д. 1"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Статус строительства
          </label>
          <select
            {...register('constructionStatus')}
            className="input-field"
          >
            <option value="PLANNING">Планируется</option>
            <option value="FOUNDATION">Фундамент</option>
            <option value="CONSTRUCTION">Строительство</option>
            <option value="FINISHING">Отделка</option>
            <option value="COMPLETED">Сдан</option>
          </select>
          {errors.constructionStatus && (
            <p className="mt-1 text-sm text-red-600">{errors.constructionStatus.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Описание
          </label>
          <textarea
            id="description"
            {...register('description')}
            rows={4}
            className="input-field resize-none"
            placeholder="Расскажите о преимуществах вашего ЖК..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <Input
          label="Планируемая дата сдачи"
          type="date"
          {...register('completionDate')}
          error={errors.completionDate?.message}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Широта (опционально)"
            type="number"
            step="any"
            {...register('latitude')}
            error={errors.latitude?.message}
            placeholder="55.7558"
          />
          <Input
            label="Долгота (опционально)"
            type="number"
            step="any"
            {...register('longitude')}
            error={errors.longitude?.message}
            placeholder="37.6173"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" loading={loading} disabled={loading}>
          Создать ЖК
        </Button>
      </div>
    </form>
  );
};
