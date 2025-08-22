import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Bell, User, LogOut, Settings, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <button
              className="lg:hidden mr-2 p-2 text-gray-600 hover:text-gray-900"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link to="/dashboard" className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                RealEstate Trust
              </span>
            </Link>
          </div>

          {/* Right side - notifications and user menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-600 hover:text-gray-900 relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.profile?.firstName || user?.email}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role?.toLowerCase()}
                  </p>
                </div>
              </button>

              {/* Dropdown menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="mr-3 h-4 w-4" />
                    Профиль
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Выйти
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <nav className="space-y-2">
              <Link
                to="/dashboard"
                className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 rounded-md"
                onClick={() => setShowMobileMenu(false)}
              >
                Дашборд
              </Link>
              <Link
                to="/complexes"
                className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 rounded-md"
                onClick={() => setShowMobileMenu(false)}
              >
                Жилые комплексы
              </Link>
              <Link
                to="/apartments"
                className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 rounded-md"
                onClick={() => setShowMobileMenu(false)}
              >
                Квартиры
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};