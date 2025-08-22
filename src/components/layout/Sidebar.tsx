import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, Home, Users, FileText, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  end?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, children, end }) => {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
          isActive
            ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
            : 'text-gray-700 hover:bg-gray-100'
        )
      }
    >
      <span className="mr-3">{icon}</span>
      {children}
    </NavLink>
  );
};

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const isDeveloper = user?.role === 'DEVELOPER';

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:block lg:bg-white lg:border-r lg:border-gray-200">
      <div className="flex flex-col h-full pt-20">
        <div className="flex-1 px-4 pb-4 overflow-y-auto">
          <nav className="space-y-2">
            <NavItem to="/dashboard" icon={<LayoutDashboard size={20} />} end>
              Дашборд
            </NavItem>
            
            <NavItem to="/complexes" icon={<Building2 size={20} />}>
              Жилые комплексы
            </NavItem>
            
            <NavItem to="/apartments" icon={<Home size={20} />}>
              Квартиры
            </NavItem>

            {isDeveloper && (
              <>
                <div className="pt-4 pb-2">
                  <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Застройщик
                  </p>
                </div>
                
                <NavItem to="/bookings" icon={<FileText size={20} />}>
                  Бронирования
                </NavItem>
                
                <NavItem to="/analytics" icon={<BarChart3 size={20} />}>
                  Аналитика
                </NavItem>
              </>
            )}

            {user?.role === 'BUYER' && (
              <>
                <div className="pt-4 pb-2">
                  <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Покупатель
                  </p>
                </div>
                
                <NavItem to="/favorites" icon={<Users size={20} />}>
                  Избранное
                </NavItem>
                
                <NavItem to="/my-bookings" icon={<FileText size={20} />}>
                  Мои бронирования
                </NavItem>
              </>
            )}
          </nav>
        </div>

        {/* User info at bottom */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.profile?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.profile?.firstName} {user?.profile?.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};