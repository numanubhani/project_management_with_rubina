
import React from 'react';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 'md', className = '' }) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const colors = [
    'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300',
    'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
    'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300',
    'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300',
    'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300',
  ];

  // Simple hashing for consistent color
  const colorIndex = name.length % colors.length;
  const colorClass = colors[colorIndex];

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold ${sizeClasses[size]} ${colorClass} ${className}`}
    >
      {initials}
    </div>
  );
};
