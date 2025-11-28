import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { getTimeRemaining, isOverdue } from '../../utils';

export const Countdown: React.FC<{ deadline: string }> = ({ deadline }) => {
  const [timeStr, setTimeStr] = useState('');
  const [overdue, setOverdue] = useState(false);

  useEffect(() => {
    const update = () => {
      setTimeStr(getTimeRemaining(deadline));
      setOverdue(isOverdue(deadline));
    };
    update();
    const interval = setInterval(update, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [deadline]);

  if (overdue) {
    return (
      <div className="flex items-center space-x-1 text-sm font-medium text-red-500">
        <Clock size={14} />
        <span>Overdue</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1 text-sm font-medium text-gray-500 dark:text-gray-400">
      <Clock size={14} />
      <span>{timeStr}</span>
    </div>
  );
};