import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Calendar, Clock, CreditCard, FileText, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { formatPrice } from '../../utils/format';

const bookingSchema: yup.ObjectSchema<CreateBookingFormData> = yup.object({
  notes: yup.string().optional(),
  expiryHours: yup.number().min(1).max(72).optional(),
  paymentType: yup.string().oneOf(['full', 'installments']).required(),
  initialPayment: yup.number().when('paymentType', {
    is: 'installments',
    then: (schema) => schema.positive().required('Первоначальный взнос обязателен'),
    otherwise: (schema) => schema.optional()
  }),
  installments: yup.array().when('paymentType', {
    is: 'installments',
    then: (schema) => schema.of(
      yup.object({
        amount: yup.number().positive().required('Сумма обязательна'),
        dueDate: yup.date().min(new Date(), 'Дата не может быть в прошлом').required('Дата обязательна'),
        description: yup.string().required('Описание обязательно')
      })
    ).min(1, 'Добавьте хотя бы один платеж'),
    otherwise: (schema) => schema.optional()
  })
});

interface CreateBookingFormData {
  notes?: string;
  expiryHours?: number;
  paymentType: 'full' | 'installments';
  initialPayment?: number;
  installments?: Array<{
    amount: number;
    dueDate: string;
    description: string;
  }>;
}

interface CreateBookingFormProps {
  apartment: {
    id: string;
    number: string;
    price: number;
    complex: { name: string };
  };
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
  onCancel: () => void;
}

export const CreateBookingForm: React.FC<CreateBookingFormProps> = ({
  apartment,
  onSubmit,
  loading = false,
  onCancel,
}) => {
  const [paymentType, setPaymentType] = useState<'full' | 'installments'>('full');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateBookingFormData>({
    resolver: yupResolver(bookingSchema),
    defaultValues: {
      expiryHours: 24,
      paymentType: 'full',
      installments: []
    },
  });

  const watchedInstallments = watch('installments') || [];
  const watchedInitialPayment = watch('initialPayment') || 0;

  const addInstallment = () => {
    const currentInstallments = watchedInstallments || [];
    const newInstallment = {
      amount: 0,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // через месяц
      description: `Платеж ${currentInstallments.length + 1}`
    };
    setValue('installments', [...currentInstallments, newInstallment]);
  };

  const removeInstallment = (index: number) => {
    const currentInstallments = watchedInstallments || [];
    setValue('installments', currentInstallments.filter((_, i) => i !== index));
  };

  const updateInstallment = (index: number, field: string, value: any) => {
    const currentInstallments = [...(watchedInstallments || [])];
    currentInstallments[index] = { ...currentInstallments[index], [field]: value };
    setValue('installments', currentInstallments);
  };

  const totalInstallmentsAmount = watchedInstallments.reduce((sum, inst) => sum + (inst.amount || 0), 0);
  const remainingAmount = apartment.price - watchedInitialPayment - totalInstallmentsAmount;

  const handleFormSubmit = async (data: CreateBookingFormData) => {
    const bookingData = {
      apartmentId: apartment.id,
      notes: data.notes,
      expiryHours: data.expiryHours,
      ...(data.paymentType === 'installments' && {
        paymentTerms: {
          initialPayment: data.initialPayment,
          installments: data.installments
        }
      })
    };

    await onSubmit(bookingData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Информация о квартире */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-3">Квартира для бронирования</h3>
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900">
            №{apartment.number} в ЖК "{apartment.complex.name}"
          </h4>
          <div className="text-2xl font-bold text-primary-600 mt-2">
            {formatPrice(apartment.price)}
          </div>
        </div>
      </Card>

      {/* Основные параметры */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Параметры бронирования</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Срок бронирования (часов)
            </label>
            <select {...register('expiryHours')} className="input-field">
              <option value={1}>1 час</option>
              <option value={6}>6 часов</option>
              <option value={12}>12 часов</option>
              <option value={24}>24 часа (по умолчанию)</option>
              <option value={48}>48 часов</option>
              <option value={72}>72 часа</option>
            </select>
            {errors.expiryHours && (
              <p className="text-sm text-red-600 mt-1">{errors.expiryHours.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Примечания (опционально)
          </label>
          <textarea
            id="notes"
            {...register('notes')}
            rows={3}
            className="input-field resize-none"
            placeholder="Укажите дополнительную информацию о бронировании..."
          />
          {errors.notes && (
            <p className="text-sm text-red-600 mt-1">{errors.notes.message}</p>
          )}
        </div>
      </Card>

      {/* Условия оплаты */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Условия оплаты
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                value="full"
                {...register('paymentType')}
                onChange={(e) => setPaymentType(e.target.value as 'full' | 'installments')}
                className="mr-3"
              />
              <div>
                <div className="font-medium">Полная оплата</div>
                <div className="text-sm text-gray-600">
                  Единовременная оплата полной стоимости
                </div>
              </div>
            </label>

            <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                value="installments"
                {...register('paymentType')}
                onChange={(e) => setPaymentType(e.target.value as 'full' | 'installments')}
                className="mr-3"
              />
              <div>
                <div className="font-medium">Рассрочка</div>
                <div className="text-sm text-gray-600">
                  Поэтапная оплата частями
                </div>
              </div>
            </label>
          </div>

          {paymentType === 'installments' && (
            <div className="space-y-4 pt-4 border-t">
              {/* Первоначальный взнос */}
              <Input
                label="Первоначальный взнос (₽)"
                type="number"
                min={0}
                max={apartment.price}
                {...register('initialPayment')}
                error={errors.initialPayment?.message}
                placeholder="1000000"
              />

              {/* Платежи по рассрочке */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">
                    Платежи по рассрочке
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addInstallment}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Добавить платеж
                  </Button>
                </div>

                <div className="space-y-3">
                  {watchedInstallments.map((installment, index) => (
                    <Card key={index} padding="sm" className="relative">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input
                          label="Сумма (₽)"
                          type="number"
                          min={0}
                          value={installment.amount || ''}
                          onChange={(e) => updateInstallment(index, 'amount', parseFloat(e.target.value) || 0)}
                          placeholder="500000"
                        />
                        <Input
                          label="Дата платежа"
                          type="date"
                          value={installment.dueDate || ''}
                          onChange={(e) => updateInstallment(index, 'dueDate', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                        <Input
                          label="Описание"
                          value={installment.description || ''}
                          onChange={(e) => updateInstallment(index, 'description', e.target.value)}
                          placeholder="Промежуточный платеж"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInstallment(index)}
                        className="absolute top-2 right-2"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </Card>
                  ))}
                </div>

                {errors.installments && (
                  <p className="text-sm text-red-600">{errors.installments.message}</p>
                )}

                {/* Сводка по платежам */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Первоначальный взнос:</span>
                    <span className="font-medium">{formatPrice(watchedInitialPayment)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Рассрочка ({watchedInstallments.length} платежей):</span>
                    <span className="font-medium">{formatPrice(totalInstallmentsAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span>Остается к доплате:</span>
                    <span className={`font-medium ${remainingAmount !== 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatPrice(Math.abs(remainingAmount))}
                      {remainingAmount > 0 && ' (недоплата)'}
                      {remainingAmount < 0 && ' (переплата)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Кнопки */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button 
          type="submit" 
          loading={loading} 
          disabled={loading || (paymentType === 'installments' && remainingAmount !== 0)}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Забронировать квартиру
        </Button>
      </div>

      {paymentType === 'installments' && remainingAmount !== 0 && (
        <div className="text-sm text-red-600 text-center">
          ⚠️ Сумма всех платежей должна равняться стоимости квартиры
        </div>
      )}
    </form>
  );
};