
import React from 'react';
import { useAppStore } from '../store';
import { UserRole, ProjectStatus } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { DollarSign, CheckCircle, Clock, PieChart } from 'lucide-react';

export const Finance: React.FC = () => {
  const { user, projects } = useAppStore();

  if (!user) return null;

  // Filter for completed or paid projects in the user's workspace
  // Admins see all, Clients see only theirs
  const historyProjects = projects.filter(p => {
    if (p.workspaceId !== user.workspaceId) return false;
    const isRelevant = user.role === UserRole.ADMIN || p.clientId === user.id;
    // Show projects that are completed OR have some payment activity
    return isRelevant && (p.status === ProjectStatus.COMPLETED || p.paymentStatus !== 'unpaid');
  });

  const totalAmount = historyProjects.reduce((acc, curr) => {
    if (curr.paymentStatus === 'paid') return acc + curr.amount;
    return acc;
  }, 0);

  const pendingAmount = historyProjects.reduce((acc, curr) => {
    if (curr.paymentStatus === 'pending_approval' || (curr.status === ProjectStatus.COMPLETED && curr.paymentStatus === 'unpaid')) {
      return acc + curr.amount;
    }
    return acc;
  }, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {user.role === UserRole.ADMIN ? 'Financial Overview' : 'Billing History'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track your {user.role === UserRole.ADMIN ? 'earnings' : 'expenses'} and payment status.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4 mb-2">
                <div className="p-3 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-xl">
                    <DollarSign size={24} />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Total {user.role === UserRole.ADMIN ? 'Earned' : 'Spent'}
                </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalAmount)}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4 mb-2">
                <div className="p-3 bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-xl">
                    <Clock size={24} />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Pending Clearance</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(pendingAmount)}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4 mb-2">
                <div className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl">
                    <PieChart size={24} />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Projects Billed</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{historyProjects.length}</p>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white">Transaction History</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/50">
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Project</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Date Completed</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Payment Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {historyProjects.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                No payment history found.
                            </td>
                        </tr>
                    ) : (
                        historyProjects.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900 dark:text-white">{p.title}</div>
                                    <div className="text-xs text-gray-500">#{p.id.slice(0,6)}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    {p.status === ProjectStatus.COMPLETED ? formatDate(p.deadline) : '-'}
                                </td>
                                <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(p.amount)}
                                </td>
                                <td className="px-6 py-4">
                                    <PaymentBadge status={p.paymentStatus} />
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

const PaymentBadge: React.FC<{ status: string }> = ({ status }) => {
    switch(status) {
        case 'paid':
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    <CheckCircle size={12} className="mr-1" /> Paid
                </span>
            );
        case 'pending_approval':
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                    <Clock size={12} className="mr-1" /> Pending Approval
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    Unpaid
                </span>
            );
    }
};
