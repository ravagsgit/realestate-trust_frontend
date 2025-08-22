import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Building2, Home, Plus } from 'lucide-react';
import { useComplex, useApartments } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { formatPrice, formatArea, formatDate, getConstructionStatusText, getStatusColor, getApartmentStatusText } from '../utils/format';

export const ComplexDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const { data: complex, isLoading: complexLoading } = useComplex(id!);
  const { data: apartmentsData, isLoading: apartmentsLoading } = useApartments({
    complexId: id,
    limit: 50, // Показываем все квартиры комплекса
  });

  const isDeveloper = user?.role === 'DEVELOPER';
  const isOwner = isDeveloper && complex?.developer.id === user?.id; // Упрощенная проверка

  if (complexLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!complex) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">ЖК не найден</h2>
        <Link to="/complexes">
          <Button>Вернуться к каталогу</Button>
        </Link>
      </div>
    );
  }

  const apartments = apartmentsData?.apartments || [];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/complexes" className="inline-flex items-center text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Вернуться к каталогу
      </Link>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{complex.name}</h1>
          <div className="flex items-center mt-2 text-gray-600">
            <MapPin className="w-4 h-4 mr-1" />
            {complex.address}
          </div>
        </div>
        
        {isOwner && (
          <div className="flex space-x-3 mt-4 lg:mt-0">
            <Button variant="outline">
              Редактировать
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Добавить квартиру
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <Card padding="none">
            <div className="h-96 bg-gradient-to-br from-primary-100 to-primary-200 rounded-t-lg flex items-center justify-center">
              {complex.images.length > 0 ? (
                <img 
                  src={complex.images[0]} 
                  alt={complex.name}
                  className="w-full h-full object-cover rounded-t-lg"
                />
              ) : (
                <div className="text-center">
                  <Building2 className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                  <p className="text-primary-600">Фотографии скоро появятся</p>
                </div>
              )}
            </div>
          </Card>

          {/* Description */}
          {complex.description && (
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Описание</h2>
              <p className="text-gray-700 leading-relaxed">{complex.description}</p>
            </Card>
          )}

          {/* Apartments */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Квартиры ({apartments.length})
              </h2>
              {isOwner && (
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить квартиру
                </Button>
              )}
            </div>

            {apartmentsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : apartments.length === 0 ? (
              <EmptyState
                title="Пока нет квартир"
                description={isOwner ? "Добавьте первую квартиру в ваш ЖК" : "Квартиры скоро появятся"}
                icon={<Home className="w-12 h-12" />}
                action={
                  isOwner ? (
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить квартиру
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <div className="space-y-3">
                {apartments.map((apartment) => (
                  <Link
                    key={apartment.id}
                    to={`/apartments/${apartment.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <span className="font-medium text-gray-900">
                            №{apartment.number}
                          </span>
                          <Badge className={getStatusColor(apartment.status)} size="sm">
                            {getApartmentStatusText(apartment.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-6 mt-1 text-sm text-gray-600">
                          <span>{apartment.rooms} комн.</span>
                          <span>{formatArea(apartment.area)}</span>
                          <span>{apartment.floor} этаж</span>
                          {apartment.entrance && <span>{apartment.entrance} подъезд</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-primary-600">
                          {formatPrice(Number(apartment.price))}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatPrice(Number(apartment.price) / apartment.area)} за м²
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Info */}
          <Card>
            <div className="space-y-4">
              <div className="text-center">
                <Badge className={`${getStatusColor(complex.constructionStatus)} mb-3`}>
                  {getConstructionStatusText(complex.constructionStatus)}
                </Badge>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Застройщик:</span>
                  <span className="font-medium">{complex.developer.name}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Квартир:</span>
                  <span className="font-medium">{apartments.length}</span>
                </div>

                {complex.completionDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Сдача:</span>
                    <span className="font-medium">{formatDate(complex.completionDate)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Создан:</span>
                  <span className="font-medium">{formatDate(complex.createdAt)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Price Statistics */}
          {apartments.length > 0 && (
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Цены</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">От:</span>
                  <span className="font-medium text-green-600">
                    {formatPrice(Math.min(...apartments.map(apt => Number(apt.price))))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">До:</span>
                  <span className="font-medium text-red-600">
                    {formatPrice(Math.max(...apartments.map(apt => Number(apt.price))))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Средняя:</span>
                  <span className="font-medium">
                    {formatPrice(apartments.reduce((sum, apt) => sum + Number(apt.price), 0) / apartments.length)}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Contact */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-3">Контакты</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Телефон:</span>
                <span className="font-medium text-primary-600">+7 (495) 123-45-67</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-primary-600">info@developer.ru</span>
              </div>
            </div>
            
            <Button className="w-full mt-4" variant="outline">
              Связаться
            </Button>
          </Card>

          {/* Location */}
          {(complex.latitude && complex.longitude) && (
            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">Расположение</h3>
              <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Карта будет здесь</p>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Координаты: {complex.latitude.toFixed(6)}, {complex.longitude.toFixed(6)}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};