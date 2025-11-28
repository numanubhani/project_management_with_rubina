
import React, { useState, useRef } from 'react';
import { useAppStore } from '../store';
import { UserRole } from '../types';
import { Avatar } from '../components/ui/Avatar';
import { UserPlus, Search, Mail, Shield, User as UserIcon, Lock, Download, Upload } from 'lucide-react';
import { workspaceService } from '../api/services';
import toast from 'react-hot-toast';

export const Users: React.FC = () => {
  const { user: currentUser, users, createUser } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CLIENT);
  const [searchTerm, setSearchTerm] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) return null;

  const handleExport = async () => {
    if (currentUser.role !== UserRole.ADMIN) {
      toast.error('Only admins can export workspace data');
      return;
    }

    setIsExporting(true);
    try {
      const blob = await workspaceService.exportWorkspaceData();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workspace_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Workspace data exported successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to export workspace data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentUser.role !== UserRole.ADMIN) {
      toast.error('Only admins can import workspace data');
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast.error('Please select a valid JSON file');
      return;
    }

    if (!confirm('Importing workspace data will add new records. Existing data will not be overwritten. Continue?')) {
      return;
    }

    setIsImporting(true);
    try {
      const result = await workspaceService.importWorkspaceData(file);
      toast.success(
        `Import successful! Added ${result.imported_users} users, ${result.imported_projects} projects, ${result.imported_comments} comments, ${result.imported_updates} updates, and ${result.imported_files} file records.`
      );
      // Reload users and projects
      await useAppStore.getState().loadUsers();
      await useAppStore.getState().loadProjects();
    } catch (error: any) {
      toast.error(error.message || 'Failed to import workspace data');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const workspaceUsers = users.filter(u => u.workspaceId === currentUser.workspaceId);
  const filteredUsers = workspaceUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser(name, email, password, role);
      setShowAddModal(false);
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setRole(UserRole.CLIENT);
    } catch (error) {
      // Error is handled in store
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage access and roles for your workspace.</p>
        </div>
        <div className="flex items-center gap-3">
          {currentUser.role === UserRole.ADMIN && (
            <>
              <button 
                onClick={handleExport}
                disabled={isExporting}
                className="inline-flex items-center justify-center px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={18} className="mr-2" />
                {isExporting ? 'Exporting...' : 'Export Data'}
              </button>
              <label className="inline-flex items-center justify-center px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-purple-500/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                <Upload size={18} className="mr-2" />
                {isImporting ? 'Importing...' : 'Import Data'}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  disabled={isImporting}
                  className="hidden"
                />
              </label>
            </>
          )}
          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/30"
          >
            <UserPlus size={20} className="mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
         <div className="overflow-x-auto">
           <table className="w-full text-left">
             <thead>
               <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                 <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                 <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                 <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                 <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
               {filteredUsers.map((u) => (
                 <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                   <td className="px-6 py-4">
                     <div className="flex items-center space-x-3">
                       <Avatar name={u.name} size="sm" />
                       <span className="font-medium text-gray-900 dark:text-white">{u.name}</span>
                       {u.id === currentUser.id && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">You</span>}
                     </div>
                   </td>
                   <td className="px-6 py-4">
                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                       u.role === UserRole.ADMIN 
                         ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' 
                         : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                     }`}>
                       {u.role}
                     </span>
                   </td>
                   <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{u.email}</td>
                   <td className="px-6 py-4">
                     <span className="inline-flex items-center text-xs text-green-600 dark:text-green-400">
                       <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                       Active
                     </span>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Create New User</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon size={18} className="absolute left-3 top-3 text-gray-400" />
                    <input 
                      required
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
                    <input 
                      required
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
                    <input 
                      required
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                      placeholder="Set initial password"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole(UserRole.CLIENT)}
                      className={`py-2.5 rounded-xl border flex items-center justify-center space-x-2 transition-all ${role === UserRole.CLIENT ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}
                    >
                       <UserIcon size={16} />
                       <span>Client</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole(UserRole.ADMIN)}
                      className={`py-2.5 rounded-xl border flex items-center justify-center space-x-2 transition-all ${role === UserRole.ADMIN ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}
                    >
                       <Shield size={16} />
                       <span>Admin</span>
                    </button>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-colors"
                  >
                    Create User
                  </button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};