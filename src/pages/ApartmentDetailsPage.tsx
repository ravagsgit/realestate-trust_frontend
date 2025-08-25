import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Square, Users, Calendar, Lock, Unlock, Eye } from 'lucide-react';
import { useApartment, useLockApartment, useUnlockApartment } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { formatPrice, formatArea, formatDateTime, getApartmentStatusText, getStatusColor } from '../utils/format';

export const ApartmentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockReason, setLockReason] = useState('Просмотр квартиры');
  const [lockDuration, setLockDuration] = useState(15);

  const { data: apartment, isLoading } = useApartment(id!);
  const lockMutation = useLockApartment();
  const unlockMutation = useUnlockApartment();

  const handleLockApartment = async () => {
    try {
      await lockMutation.mutateAsync({
        id: id!,
        data: { reason: lockReason, duration: lockDuration }
      });
      setShowLockModal(false);
    } catch (error) {
      // Ошибка обрабатывается в хуке
    }
  };

  const handleUnlockApartment = async () => {
    try {
      await unlockMutation.mutateAsync(id!);
    } catch (error) {
      // Ошибка обрабатывается в хуке
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!apartment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Квартира не найдена</h2>
        <Link to="/apartments">
          <Button>Вернуться к каталогу</Button>
        </Link>
      </div>
    );
  }

  const isLocked = apartment.locks && apartment.locks.length > 0;
  const userCanLock = user?.role === 'BUYER' && apartment.status === 'AVAILABLE';
  const canUnlock = isLocked && apartment.locks?.[0]?.lockedBy === user?.id;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/apartments" className="inline-flex items-center text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Вернуться к каталогу
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <Card padding="none">
            <div className="h-96 bg-gradient-to-br from-blue-100 to-blue-200 rounded-t-lg flex items-center justify-center">
              {apartment.images.length > 0 ? (
                <img 
                  src={apartment.images[0]} 
                  alt={`Квартира ${apartment.number}`}
                  className="w-full h-full object-cover rounded-t-lg"
                />
              ) : (
                <div className="text-center">
                  <Eye className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <p className="text-blue-600">Фотографии скоро появятся</p>
                </div>
              )}
            </div>
            {apartment.images.length > 1 && (
              <div className="p-4 flex space-x-2 overflow-x-auto">
                {apartment.images.slice(1).map((image, index) => (
                  <img 
                    key={index}
                    src={image}
                    alt={`Фото ${index + 2}`}
                    className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                  />
                ))}
              </div>
            )}
          </Card>

          {/* Details */}
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Описание квартиры
            </h2>
            
            {apartment.features ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(apartment.features as Record<string, any>).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600 capitalize">{key}:</span>
                      <span className="font-medium">
                        {typeof value === 'boolean' ? (value ? 'Да' : 'Нет') : value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-600">Дополнительная информация будет добавлена позже.</p>
            )}
          </Card>

          {/* Complex Info */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              О жилом комплексе
            </h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                <div>
                  <p className="font-medium">{apartment.complex.name}</p>
                  <p className="text-gray-600 text-sm">{apartment.complex.address}</p>
                </div>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                Застройщик: {apartment.complex.developer.name}
              </div>
              
              {apartment.complex.description && (
                <p className="text-gray-600 mt-4">
                  {apartment.complex.description}
                </p>
              )}
              
              <Link to={`/complexes/${apartment.complex.id}`} className="inline-block mt-4">
                <Button variant="outline" size="sm">
                  Подробнее о ЖК
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Card */}
          <Card>
            <div className="text-center space-y-4">
              <div>
                <div className="text-3xl font-bold text-primary-600">
                  {formatPrice(Number(apartment.price))}
                </div>
                <div className="text-gray-500">
                  {formatPrice(Number(apartment.price) / apartment.area)} за м²
                </div>
              </div>
              
              <Badge className={`${getStatusColor(apartment.status)} text-center`} size="md">
                {getApartmentStatusText(apartment.status)}
              </Badge>
            </div>
          </Card>

          {/* Apartment Info */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Характеристики</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Номер:</span>
                <span className="font-medium">{apartment.number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Этаж:</span>
                <span className="font-medium">{apartment.floor}</span>
              </div>
              {apartment.entrance && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Подъезд:</span>
                  <span className="font-medium">{apartment.entrance}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Площадь:</span>
                <span className="font-medium">{formatArea(apartment.area)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Комнат:</span>
                <span className="font-medium">{apartment.rooms}</span>
              </div>
            </div>
          </Card>

          {/* Lock Status */}
          {isLocked && (
            <Card>
              <div className="flex items-center mb-3">
                <Lock className="w-5 h-5 mr-2 text-orange-500" />
                <span className="font-medium text-orange-700">Квартира заблокирована</span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Причина: {apartment.locks?.[0]?.lockReason}</p>
                <p>Заблокирована: {formatDateTime(apartment.locks?.[0]?.lockedAt || '')}</p>
                <p>Действительна до: {formatDateTime(apartment.locks?.[0]?.expiresAt || '')}</p>
              </div>
              {canUnlock && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={handleUnlockApartment}
                  loading={unlockMutation.isPending}
                >
                  <Unlock className="w-4 h-4 mr-2" />
                  Снять блокировку
                </Button>
              )}
            </Card>
          )}

          {/* Actions */}
          <Card>
            <div className="space-y-3">
              {userCanLock && !isLocked && (
                <Button
                  className="w-full"
                  onClick={() => setShowLockModal(true)}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Забронировать просмотр
                </Button>
              )}
              
              {apartment.status === 'AVAILABLE' && !isLocked && (
                <Button variant="outline" className="w-full">
                  Связаться с менеджером
                </Button>
              )}
              
              <Button variant="ghost" className="w-full">
                Добавить в избранное
              </Button>
            </div>
          </Card>

          {/* Contact Info */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-3">Контакты</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Застройщик:</span>
                <span className="font-medium">{apartment.complex.developer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Телефон:</span>
                <span className="font-medium text-primary-600">+7 (495) 123-45-67</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-primary-600">info@developer.ru</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Lock Apartment Modal */}
      <Modal
        isOpen={showLockModal}
        onClose={() => setShowLockModal(false)}
        title="Забронировать просмотр"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Временная блокировка квартиры для просмотра и принятия решения
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Причина блокировки
            </label>
            <input
              type="text"
              value={lockReason}
              onChange={(e) => setLockReason(e.target.value)}
              className="input-field"
              placeholder="Просмотр квартиры"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Длительность (минут)
            </label>
            <select
              value={lockDuration}
              onChange={(e) => setLockDuration(parseInt(e.target.value))}
              className="input-field"
            >
              <option value={5}>5 минут</option>
              <option value={15}>15 минут</option>
              <option value={30}>30 минут</option>
              <option value={60}>1 час</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowLockModal(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleLockApartment}
              loading={lockMutation.isPending}
            >
              Забронировать
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};