import { format, formatDistanceToNow, differenceInSeconds } from 'date-fns';

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
};

export const getTimeRemaining = (deadline: string) => {
  const diff = differenceInSeconds(new Date(deadline), new Date());
  if (diff <= 0) return 'Overdue';
  
  const days = Math.floor(diff / (3600 * 24));
  const hours = Math.floor((diff % (3600 * 24)) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h ${minutes}m`;
};

export const isOverdue = (deadline: string) => {
  return new Date(deadline) < new Date();
};