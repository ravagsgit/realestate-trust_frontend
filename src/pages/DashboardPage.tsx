import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Home, Users, TrendingUp, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useComplexes, useApartments } from '../hooks/useApi';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { formatPrice } from '../utils/format';

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  change?: string;
}> = ({ title, value, icon, color, change }) => (
  <Card className="relative overflow-hidden">
    <div className="flex items-center">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && (
          <p className="text-sm text-green-600 flex items-center mt-1">
            <TrendingUp className="w-4 h-4 mr-1" />
            {change}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        {icon}
      </div>
    </div>
  </Card>
);

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data: complexesData, isLoading: complexesLoading } = useComplexes({ limit: 6 });
  const { data: apartmentsData, isLoading: apartmentsLoading } = useApartments({ 
    limit: 6,
    status: 'AVAILABLE' 
  });

  const isDeveloper = user?.role === 'DEVELOPER';

  if (complexesLoading || apartmentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const complexes = complexesData?.complexes || [];
  const apartments = apartmentsData?.apartments || [];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Добро пожаловать, {user?.profile?.firstName || user?.email}!
        </h1>
        <p className="mt-2 text-gray-600">
          {isDeveloper 
            ? 'Управляйте своими жилыми комплексами и квартирами' 
            : 'Найдите идеальную квартиру для покупки'
          }
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Жилых комплексов"
          value={complexesData?.pagination?.total || 0}
          icon={<Building2 className="w-6 h-6 text-white" />}
          color="bg-blue-500"
          change="+12% за месяц"
        />
        <StatCard
          title="Доступных квартир"
          value={apartmentsData?.pagination?.total || 0}
          icon={<Home className="w-6 h-6 text-white" />}
          color="bg-green-500"
          change="+8% за месяц"
        />
        <StatCard
          title="Средняя цена"
          value={formatPrice(7500000)}
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          color="bg-purple-500"
          change="+5% за месяц"
        />
        <StatCard
          title="Пользователей"
          value="1,234"
          icon={<Users className="w-6 h-6 text-white" />}
          color="bg-orange-500"
          change="+15% за месяц"
        />
      </div>

      {/* Quick Actions */}
      {isDeveloper && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Быстрые действия</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/complexes?action=create">
              <Button className="w-full h-20 flex-col space-y-2" variant="outline">
                <Plus className="w-6 h-6" />
                <span>Создать ЖК</span>
              </Button>
            </Link>
            <Link to="/apartments?action=create">
              <Button className="w-full h-20 flex-col space-y-2" variant="outline">
                <Plus className="w-6 h-6" />
                <span>Добавить квартиру</span>
              </Button>
            </Link>
            <Link to="/analytics">
              <Button className="w-full h-20 flex-col space-y-2" variant="outline">
                <TrendingUp className="w-6 h-6" />
                <span>Аналитика</span>
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Recent Complexes */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {isDeveloper ? 'Мои жилые комплексы' : 'Популярные комплексы'}
          </h2>
          <Link to="/complexes">
            <Button variant="outline" size="sm">
              Все комплексы
            </Button>
          </Link>
        </div>
        
        {complexes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Пока нет жилых комплексов</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {complexes.slice(0, 6).map((complex) => (
              <Link
                key={complex.id}
                to={`/complexes/${complex.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <h3 className="font-medium text-gray-900 mb-1">{complex.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{complex.address}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {complex._count?.apartments || 0} квартир
                  </span>
                  <span className="text-sm font-medium text-primary-600">
                    {complex.constructionStatus}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* Recent Apartments */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Доступные квартиры
          </h2>
          <Link to="/apartments">
            <Button variant="outline" size="sm">
              Все квартиры
            </Button>
          </Link>
        </div>
        
        {apartments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Home className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Пока нет доступных квартир</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {apartments.slice(0, 6).map((apartment) => (
              <Link
                key={apartment.id}
                to={`/apartments/${apartment.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900">
                    Квартира №{apartment.number}
                  </h3>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    {apartment.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{apartment.complex.name}</p>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {apartment.rooms} комн. • {apartment.area} м² • {apartment.floor} этаж
                  </div>
                  <div className="text-sm font-semibold text-primary-600">
                    {formatPrice(Number(apartment.price))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};