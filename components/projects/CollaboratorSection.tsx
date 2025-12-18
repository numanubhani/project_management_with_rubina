import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { UserRole, Collaborator } from '../../types';
import { Avatar } from '../ui/Avatar';
import { UserPlus, X, Mail, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CollaboratorSectionProps {
  projectId: string;
  collaborators: Collaborator[];
  canManage: boolean; // Whether current user can add/remove collaborators
}

export const CollaboratorSection: React.FC<CollaboratorSectionProps> = ({
  projectId,
  collaborators,
  canManage,
}) => {
  const { user, inviteCollaborator, removeCollaborator } = useAppStore();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setInviting(true);
      await inviteCollaborator(projectId, undefined, email.trim());
      setEmail('');
      setIsInviteModalOpen(false);
    } catch (error) {
      // Error is handled by toast in store
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (collaboratorId: string) => {
    if (!confirm('Remove this collaborator from the project?')) return;
    try {
      await removeCollaborator(projectId, collaboratorId);
    } catch (error) {
      // Error is handled by toast in store
    }
  };

  if (!canManage && collaborators.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg shrink-0">
              <Users size={18} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider truncate">
                Collaborators
              </h3>
              {collaborators.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                  {collaborators.length} {collaborators.length === 1 ? 'member' : 'members'}
                </p>
              )}
            </div>
          </div>
          {canManage && (
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 shrink-0 w-full sm:w-auto"
            >
              <UserPlus size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Add Collaborator</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}
        </div>

        {collaborators.length === 0 ? (
          <div className="py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700/50 mb-3">
              <Users size={24} className="text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              No collaborators yet
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {canManage 
                ? 'Invite team members to collaborate on this project' 
                : 'No collaborators have been added to this project'}
            </p>
          </div>
        ) : (
          <div className="space-y-2 overflow-hidden">
            {collaborators.map((collab) => (
              <div
                key={collab.id}
                className="group flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all overflow-hidden"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar name={collab.userName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {collab.userName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px] sm:max-w-none">
                        {collab.userEmail}
                      </p>
                      <span className="text-gray-300 dark:text-gray-600 hidden sm:inline">•</span>
                      <p className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                        {formatDistanceToNow(new Date(collab.addedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
                {canManage && (
                  <button
                    onClick={() => handleRemove(collab.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    title="Remove collaborator"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isInviteModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsInviteModalOpen(false);
              setEmail('');
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-3 mb-2">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg shrink-0">
                  <Mail size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Invite Collaborator
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Enter the email address of a workspace member to invite them as a collaborator.
                  </p>
                </div>
              </div>
            </div>
            <form onSubmit={handleInvite} className="p-4 sm:p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white transition-all"
                    required
                    autoFocus
                  />
                </div>
                <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                  The user must already be a member of your workspace.
                </p>
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsInviteModalOpen(false);
                    setEmail('');
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  disabled={inviting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 flex items-center justify-center gap-2"
                  disabled={inviting || !email.trim()}
                >
                  {inviting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      Send Invitation
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

