import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Home, MapPin, Square, Users } from 'lucide-react';
import { useApartments } from '../hooks/useApi';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Pagination } from '../components/ui/Pagination';
import { Badge } from '../components/ui/Badge';
import { formatPrice, formatArea, getApartmentStatusText, getStatusColor } from '../utils/format';

export const ApartmentsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  
  // Параметры фильтрации из URL
  const page = parseInt(searchParams.get('page') || '1');
  const complexId = searchParams.get('complexId') || '';
  const status = searchParams.get('status') || '';
  const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined;
  const rooms = searchParams.get('rooms')?.split(',').map(Number) || undefined;
  
  const { data, isLoading } = useApartments({
    page,
    limit: 12,
    complexId: complexId || undefined,
    status: status || undefined,
    minPrice,
    maxPrice,
    rooms,
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  const handleFilterChange = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== '') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // Сбрасываем на первую страницу
    setSearchParams(params);
  };

  const handleRoomsFilter = (roomCount: number) => {
    const currentRooms = searchParams.get('rooms')?.split(',').map(Number) || [];
    let newRooms: number[];
    
    if (currentRooms.includes(roomCount)) {
      newRooms = currentRooms.filter(r => r !== roomCount);
    } else {
      newRooms = [...currentRooms, roomCount];
    }
    
    if (newRooms.length > 0) {
      handleFilterChange('rooms', newRooms.join(','));
    } else {
      handleFilterChange('rooms', null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const apartments = data?.apartments || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Квартиры</h1>
        <p className="mt-2 text-gray-600">
          Найдите идеальную квартиру для покупки
        </p>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-700">Фильтры</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Скрыть' : 'Показать'} фильтры
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Статус
                </label>
                <select
                  value={status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="input-field"
                >
                  <option value="">Все</option>
                  <option value="AVAILABLE">Доступна</option>
                  <option value="RESERVED">Забронирована</option>
                  <option value="SOLD">Продана</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Цена от (млн ₽)
                </label>
                <input
                  type="number"
                  placeholder="5"
                  value={minPrice ? minPrice / 1000000 : ''}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value ? (parseFloat(e.target.value) * 1000000).toString() : null)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Цена до (млн ₽)
                </label>
                <input
                  type="number"
                  placeholder="15"
                  value={maxPrice ? maxPrice / 1000000 : ''}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value ? (parseFloat(e.target.value) * 1000000).toString() : null)}
                  className="input-field"
                />
              </div>

              {/* Rooms Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Комнат
                </label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4].map((roomCount) => (
                    <Button
                      key={roomCount}
                      variant={rooms?.includes(roomCount) ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleRoomsFilter(roomCount)}
                    >
                      {roomCount}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Results */}
      {apartments.length === 0 ? (
        <EmptyState
          title="Квартиры не найдены"
          description="Попробуйте изменить параметры поиска"
          icon={<Home className="w-12 h-12" />}
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Найдено {pagination?.total || 0} квартир
            </p>
          </div>

          {/* Apartments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apartments.map((apartment) => (
              <Link key={apartment.id} to={`/apartments/${apartment.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  {/* Image placeholder */}
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-4 flex items-center justify-center">
                    {apartment.images.length > 0 ? (
                      <img 
                        src={apartment.images[0]} 
                        alt={`Квартира ${apartment.number}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Home className="w-16 h-16 text-blue-400" />
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          Квартира №{apartment.number}
                        </h3>
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPin className="w-4 h-4 mr-1" />
                          {apartment.complex.name}
                        </div>
                      </div>
                      <Badge className={getStatusColor(apartment.status)}>
                        {getApartmentStatusText(apartment.status)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {apartment.rooms} комн
                      </div>
                      <div className="flex items-center">
                        <Square className="w-4 h-4 mr-1" />
                        {formatArea(apartment.area)}
                      </div>
                      <div className="text-center">
                        {apartment.floor} этаж
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200">
                      <div className="text-xl font-bold text-primary-600">
                        {formatPrice(Number(apartment.price))}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatPrice(Number(apartment.price) / apartment.area)} за м²
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};