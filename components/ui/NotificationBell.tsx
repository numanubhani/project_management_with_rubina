import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store';
import { CollaboratorInvitation } from '../../types';
import { Bell, Check, X, UserPlus, Briefcase } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const NotificationBell: React.FC = () => {
  const { invitations, loadInvitations, respondToInvitation } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadInvitations();
    // Refresh invitations every 30 seconds
    const interval = setInterval(() => {
      loadInvitations();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadInvitations]);

  const pendingInvitations = invitations.filter((inv) => inv.status === 'pending');

  const handleRespond = async (invitationId: string, accept: boolean) => {
    try {
      await respondToInvitation(invitationId, accept);
    } catch (error) {
      // Error handled by toast in store
    }
  };

  if (pendingInvitations.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
      >
        <Bell size={20} className={isOpen ? 'text-blue-600 dark:text-blue-400' : ''} />
        {pendingInvitations.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-800 animate-pulse">
            {pendingInvitations.length > 9 ? '9+' : pendingInvitations.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed sm:absolute right-2 sm:right-0 top-16 sm:top-full sm:mt-2 w-[calc(100vw-1rem)] sm:w-96 max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-[calc(100vh-6rem)] sm:max-h-[500px] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                    <UserPlus size={18} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Collaboration Invitations
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {pendingInvitations.length} {pendingInvitations.length === 1 ? 'invitation' : 'invitations'} pending
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              {pendingInvitations.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700/50 mb-3">
                    <Bell size={24} className="text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    No pending invitations
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {pendingInvitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="p-5 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg mt-0.5">
                          <Briefcase size={16} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {invitation.projectTitle}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              Invited by <span className="font-medium">{invitation.invitedByName}</span>
                            </p>
                            <span className="text-gray-300 dark:text-gray-600 hidden sm:inline">•</span>
                            <p className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                              {formatDistanceToNow(new Date(invitation.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleRespond(invitation.id, true)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all shadow-sm shadow-green-500/20 hover:shadow-md hover:shadow-green-500/30"
                        >
                          <Check size={16} />
                          Accept
                        </button>
                        <button
                          onClick={() => handleRespond(invitation.id, false)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-colors"
                        >
                          <X size={16} />
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

