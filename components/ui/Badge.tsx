import React from 'react';
import { ProjectStatus } from '../../types';

const statusConfig = {
  [ProjectStatus.PENDING]: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', label: 'Pending' },
  [ProjectStatus.IN_PROGRESS]: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300', label: 'In Progress' },
  [ProjectStatus.DELIVERED]: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-300', label: 'Delivered' },
  [ProjectStatus.COMPLETED]: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', label: 'Completed' },
};

export const Badge: React.FC<{ status: ProjectStatus }> = ({ status }) => {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};