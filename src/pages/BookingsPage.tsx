import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, FileText, CreditCard, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBookings } from '../hooks/useBookings';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Pagination } from '../components/ui/Pagination';
import { formatPrice, formatDateTime } from '../utils/format';
import { ReactElement } from 'react';

const getStatusColor = (status: string): string => {
  const colors: { [key: string]: string } = {
    RESERVED: 'text-blue-700 bg-blue-100',
    CONTRACT_SIGNED: 'text-purple-700 bg-purple-100',
    PAYMENT_IN_PROGRESS: 'text-orange-700 bg-orange-100',
    COMPLETED: 'text-green-700 bg-green-100',
    CANCELLED: 'text-red-700 bg-red-100',
  };
  return colors[status] || 'text-gray-700 bg-gray-100';
};

const getStatusText = (status: string): string => {
  const labels: { [key: string]: string } = {
    RESERVED: 'Забронировано',
    CONTRACT_SIGNED: 'Контракт подписан',
    PAYMENT_IN_PROGRESS: 'Идет оплата',
    COMPLETED: 'Завершено',
    CANCELLED: 'Отменено'
  };
  
  return labels[status] || 'Неизвестный статус';
};

const getStatusIcon = (status: string): ReactElement => {
  const icons: Record<string, ReactElement> = {
    RESERVED: <Clock className="w-4 h-4" />,
    CONTRACT_SIGNED: <FileText className="w-4 h-4" />,
    PAYMENT_IN_PROGRESS: <CreditCard className="w-4 h-4" />,
    COMPLETED: <CheckCircle className="w-4 h-4" />,
    CANCELLED: <XCircle className="w-4 h-4" />,
  };
  return icons[status] || <AlertCircle className="w-4 h-4" />;
};

export const BookingsPage: React.FC = () => {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useBookings({
    page: currentPage,
    limit: 10,
    ...(statusFilter && { status: statusFilter }),
  });

  const isDeveloper = user?.role === 'DEVELOPER';
  const bookings = data?.bookings || [];
  const pagination = data?.pagination;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {isDeveloper ? 'Бронирования' : 'Мои бронирования'}
        </h1>
        <p className="mt-2 text-gray-600">
          {isDeveloper 
            ? 'Управляйте бронированиями в ваших ЖК'
            : 'Отслеживайте статус ваших бронирований'
          }
        </p>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex items-center space-x-4">
          <span className="font-medium text-gray-700">Фильтр по статусу:</span>
          <div className="flex space-x-2">
            {[
              { value: '', label: 'Все' },
              { value: 'RESERVED', label: 'Забронировано' },
              { value: 'CONTRACT_SIGNED', label: 'Договор подписан' },
              { value: 'PAYMENT_IN_PROGRESS', label: 'Ожидается оплата' },
              { value: 'COMPLETED', label: 'Завершено' },
              { value: 'CANCELLED', label: 'Отменено' },
            ].map(({ value, label }) => (
              <Button
                key={value}
                variant={statusFilter === value ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(value)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <EmptyState
          title="Бронирований пока нет"
          description={isDeveloper 
            ? "Как только покупатели начнут бронировать ваши квартиры, они появятся здесь"
            : "У вас пока нет активных бронирований"
          }
          icon={<Calendar className="w-12 h-12" />}
        />
      ) : (
        <>
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Link key={booking.id} to={`/bookings/${booking.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.contractNumber || `Бронирование #${booking.id.slice(0, 8)}`}
                        </h3>
                        <Badge className={getStatusColor(booking.status)}>
                          <span className="flex items-center space-x-1">
                            {getStatusIcon(booking.status)}
                            <span>{getStatusText(booking.status)}</span>
                          </span>
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Квартира</p>
                          <p className="font-medium">
                            №{booking.apartment.number}, {booking.apartment.complex.name}
                          </p>
                        </div>
                        
                        {isDeveloper && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Покупатель</p>
                            <p className="font-medium">
                              {booking.buyer.profile?.firstName} {booking.buyer.profile?.lastName} 
                              ({booking.buyer.email})
                            </p>
                          </div>
                        )}
                        
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Дата бронирования</p>
                          <p className="font-medium">{formatDateTime(booking.bookingDate)}</p>
                        </div>
                        
                        {booking.expiryDate && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              {booking.status === 'RESERVED' ? 'Истекает' : 'Истекло'}
                            </p>
                            <p className={`font-medium ${
                              booking.status === 'RESERVED' && new Date(booking.expiryDate) < new Date()
                                ? 'text-red-600' 
                                : ''
                            }`}>
                              {formatDateTime(booking.expiryDate)}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {booking.notes && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600">Примечания:</p>
                          <p className="text-sm text-gray-800">{booking.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary-600 mb-1">
                        {formatPrice(Number(booking.price))}
                      </div>
                      <div className="text-sm text-gray-500 space-y-1">
                        <div>📄 {booking._count?.documents || 0} документов</div>
                        <div>💳 {booking._count?.payments || 0} платежей</div>
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
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};