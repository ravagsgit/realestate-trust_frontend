import React from 'react';
import { Building2 } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mb-4 text-gray-400">
        {icon || <Building2 className="h-12 w-12" />}
      </div>
      <h3 className="mb-2 text-lg font-medium text-gray-900">{title}</h3>
      {description && (
        <p className="mb-4 text-center text-gray-500 max-w-sm">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};