import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useComplexes, useCreateComplex } from '../hooks/useApi';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Pagination } from '../components/ui/Pagination';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { formatDate, getConstructionStatusText, getStatusColor } from '../utils/format';
import { CreateComplexForm } from '../components/forms/CreateComplexForm';

export const ComplexesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [showCreateModal, setShowCreateModal] = useState(searchParams.get('action') === 'create');
  
  const { user } = useAuth();
  const isDeveloper = user?.role === 'DEVELOPER';
  
  const page = parseInt(searchParams.get('page') || '1');
  const constructionStatus = searchParams.get('status') || '';
  
  const { data, isLoading, error } = useComplexes({
    page,
    limit: 12,
    search: searchQuery,
    constructionStatus: constructionStatus || undefined,
    ...(isDeveloper && { developerId: user?.id }),
  });

  const createComplexMutation = useCreateComplex();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }
    params.delete('page');
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status && status !== constructionStatus) {
      params.set('status', status);
    } else {
      params.delete('status');
    }
    params.delete('page');
    setSearchParams(params);
  };

  const handleCreateComplex = async (data: any) => {
    try {
      await createComplexMutation.mutateAsync(data);
      setShowCreateModal(false);
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

  const complexes = data?.complexes || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isDeveloper ? 'Мои жилые комплексы' : 'Жилые комплексы'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isDeveloper 
              ? 'Управляйте своими проектами недвижимости'
              : 'Найдите идеальный жилой комплекс'
            }
          </p>
        </div>
        {isDeveloper && (
          <Button onClick={() => setShowCreateModal(true)} className="mt-4 sm:mt-0">
            <Plus className="w-4 h-4 mr-2" />
            Создать ЖК
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      <Card padding="sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Поиск по названию или адресу..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <Button type="submit" size="sm" className="absolute right-1 top-1">
                Найти
              </Button>
            </div>
          </form>

          {/* Status Filters */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <div className="flex space-x-1">
              {['', 'PLANNING', 'CONSTRUCTION', 'FINISHING', 'COMPLETED'].map((status) => (
                <Button
                  key={status}
                  variant={constructionStatus === status ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusFilter(status)}
                >
                  {status ? getConstructionStatusText(status) : 'Все'}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Results */}
      {error ? (
        <Card>
          <div className="text-center py-8 text-red-600">
            Ошибка загрузки данных. Попробуйте обновить страницу.
          </div>
        </Card>
      ) : complexes.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'Комплексы не найдены' : 'Нет жилых комплексов'}
          description={
            searchQuery 
              ? `По запросу "${searchQuery}" ничего не найдено`
              : isDeveloper 
                ? 'Создайте свой первый жилой комплекс'
                : 'Пока нет доступных комплексов'
          }
          action={
            isDeveloper ? (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Создать ЖК
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          {/* Complexes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complexes.map((complex) => (
              <Link key={complex.id} to={`/complexes/${complex.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  {/* Image placeholder */}
                  <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg mb-4 flex items-center justify-center">
                    {complex.images.length > 0 ? (
                      <img 
                        src={complex.images[0]} 
                        alt={complex.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Building2 className="w-16 h-16 text-primary-400" />
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">
                        {complex.name}
                      </h3>
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        {complex.address}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge className={getStatusColor(complex.constructionStatus)}>
                        {getConstructionStatusText(complex.constructionStatus)}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {complex._count?.apartments || 0} квартир
                      </span>
                    </div>

                    {complex.completionDate && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        Сдача: {formatDate(complex.completionDate)}
                      </div>
                    )}

                    <div className="text-sm text-gray-500 line-clamp-2">
                      {complex.description}
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

      {/* Create Complex Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Создать жилой комплекс"
        size="lg"
      >
        <CreateComplexForm
          onSubmit={handleCreateComplex}
          loading={createComplexMutation.isPending}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>
    </div>
  );
};