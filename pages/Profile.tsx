
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { User, Lock, Mail, Save } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';

export const Profile: React.FC = () => {
  const { user, updateUserProfile } = useAppStore();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    try {
      await updateUserProfile(name, password || undefined);
      setIsEditing(false);
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      // Error is handled in store
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account information and preferences.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center space-x-6 mb-8">
          <Avatar name={user.name} size="lg" className="w-20 h-20 text-2xl" />
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
            <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 capitalize">
              {user.role}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Display Name</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-3 text-gray-400" />
              <input 
                type="text" 
                value={name}
                onChange={(e) => { setName(e.target.value); setIsEditing(true); }}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
             <div className="relative opacity-70">
                <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
                <input 
                    type="email" 
                    value={user.email}
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl outline-none dark:text-gray-400 cursor-not-allowed"
                />
             </div>
             <p className="text-xs text-gray-400 mt-1 ml-1">Email cannot be changed manually. Contact support.</p>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
             <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Change Password</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">New Password</label>
                    <div className="relative">
                        <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setIsEditing(true); }}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                            placeholder="Leave blank to keep current"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Confirm Password</label>
                    <div className="relative">
                        <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
                        <input 
                            type="password" 
                            value={confirmPassword}
                            onChange={(e) => { setConfirmPassword(e.target.value); setIsEditing(true); }}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                            placeholder="Confirm new password"
                        />
                    </div>
                </div>
             </div>
          </div>

          <div className="pt-4 flex justify-end">
             <button 
               type="submit" 
               disabled={!isEditing}
               className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:shadow-none flex items-center space-x-2"
             >
                <Save size={18} />
                <span>Save Changes</span>
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};
