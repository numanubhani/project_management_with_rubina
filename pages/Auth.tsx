
import React, { useState } from 'react';
import { useAppStore } from '../store';
import { LayoutGrid, ArrowRight, Lock, Mail, User, Briefcase } from 'lucide-react';

export const Auth: React.FC = () => {
  const { login, registerWorkspace } = useAppStore();
  const [view, setView] = useState<'login' | 'create_workspace'>('login');
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await login(email, password);
    setIsSubmitting(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await registerWorkspace(workspaceName, regName, regEmail, regPassword);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        
        {/* Header */}
        <div className="p-8 pb-0 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
            <LayoutGrid size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FlowSpace</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            {view === 'login' ? 'Sign in to access your workspace' : 'Create a new workspace for your team'}
          </p>
        </div>

        {view === 'login' ? (
          <form onSubmit={handleLogin} className="p-8 pt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  required
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Default Login Hint */}
            <div className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                <p className="font-semibold mb-1">Demo Credentials:</p>
                <div className="flex justify-between">
                    <span>Admin: admin@flowspace.com</span>
                    <span>Pass: password</span>
                </div>
                <div className="flex justify-between mt-1">
                    <span>Client: client@flowspace.com</span>
                    <span>Pass: password</span>
                </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/30"
            >
              <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight size={18} />
            </button>
            
            <div className="text-center pt-2">
                <button type="button" onClick={() => setView('create_workspace')} className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                    New here? <span className="font-semibold text-blue-600">Create a Workspace</span>
                </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="p-8 pt-6 space-y-4">
             <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Workspace Name</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  required
                  type="text" 
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all"
                  placeholder="My Design Studio"
                />
              </div>
            </div>
            
             <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Admin Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  required
                  type="text" 
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all"
                  placeholder="Your Name"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  required
                  type="email" 
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all"
                  placeholder="admin@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  required
                  type="password" 
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all"
                  placeholder="Create a password"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg"
            >
              <span>{isSubmitting ? 'Creating...' : 'Create Workspace'}</span>
              <ArrowRight size={18} />
            </button>
            
            <div className="text-center pt-2">
                <button type="button" onClick={() => setView('login')} className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                    Already have an account? <span className="font-semibold text-blue-600">Login</span>
                </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};