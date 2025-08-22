// src/utils/format.ts
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatArea = (area: number): string => {
  return `${area.toFixed(1)} м²`;
};

export const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatDateTime = (date: string): string => {
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const getConstructionStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    PLANNING: 'Планируется',
    FOUNDATION: 'Фундамент',
    CONSTRUCTION: 'Строительство',
    FINISHING: 'Отделка',
    COMPLETED: 'Сдан',
  };
  return statusMap[status] || status;
};

export const getApartmentStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    AVAILABLE: 'Доступна',
    RESERVED: 'Забронирована',
    SOLD: 'Продана',
    BLOCKED: 'Заблокирована',
  };
  return statusMap[status] || status;
};

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    AVAILABLE: 'text-green-600 bg-green-100',
    RESERVED: 'text-yellow-600 bg-yellow-100',
    SOLD: 'text-red-600 bg-red-100',
    BLOCKED: 'text-gray-600 bg-gray-100',
    PLANNING: 'text-blue-600 bg-blue-100',
    FOUNDATION: 'text-orange-600 bg-orange-100',
    CONSTRUCTION: 'text-yellow-600 bg-yellow-100',
    FINISHING: 'text-purple-600 bg-purple-100',
    COMPLETED: 'text-green-600 bg-green-100',
  };
  return colorMap[status] || 'text-gray-600 bg-gray-100';
};