
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store';
import { LogOut, Moon, Sun, LayoutGrid, PlusCircle, Users, Wallet, User as UserIcon, Menu, X } from 'lucide-react';
import { UserRole } from '../../types';
import { NotificationBell } from './NotificationBell';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, theme, toggleTheme, checkUnreadUpdates } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load data on mount
  useEffect(() => {
    if (user) {
      // Load initial data
      const store = useAppStore.getState();
      store.loadProjects();
      store.loadUsers();
    }
  }, [user]);

  // Check for updates periodically
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      // Check for Client updates (Live Fetching)
      checkUnreadUpdates();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [user, checkUnreadUpdates]);

  if (!user) return <>{children}</>;

  const handleNavigate = (to: string) => {
    navigate(to);
    setIsMobileMenuOpen(false); // Close menu on mobile after click
  };

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
    const isActive = location.pathname === to;
    return (
      <button
        onClick={() => handleNavigate(to)}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left font-medium ${
          isActive 
            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50'
        }`}
      >
        <Icon size={20} className={isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'} />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors relative overflow-hidden">
      
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Responsive Drawer) */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-full
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              FlowSpace
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate max-w-[150px]">
              WS: {user.workspaceId}
            </p>
          </div>
          {/* Close Button Mobile */}
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem to={user.role === UserRole.ADMIN ? "/admin/dashboard" : "/client/dashboard"} icon={LayoutGrid} label="Dashboard" />
          
          {user.role === UserRole.CLIENT && (
            <NavItem to="/client/new-project" icon={PlusCircle} label="New Project" />
          )}

          <NavItem to={user.role === UserRole.ADMIN ? "/admin/finance" : "/client/finance"} icon={Wallet} label={user.role === UserRole.ADMIN ? 'Finance' : 'History'} />

          {user.role === UserRole.ADMIN && (
            <NavItem to="/admin/users" icon={Users} label="Users" />
          )}
           
          <NavItem to={user.role === UserRole.ADMIN ? "/admin/profile" : "/client/profile"} icon={UserIcon} label="Profile" />
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3 bg-gray-50 dark:bg-gray-800/50 shrink-0">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold">
                {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={toggleTheme}
                className="flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all"
              >
                 {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                 <span>Theme</span>
              </button>

              <button 
                onClick={logout}
                className="flex items-center justify-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-transparent hover:border-red-100 dark:hover:border-red-900/30 transition-all"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
         {/* Mobile Header */}
         <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between md:hidden sticky top-0 z-10 shrink-0">
            <div className="flex items-center space-x-3">
                <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <Menu size={24} />
                </button>
                <span className="font-bold text-lg text-gray-900 dark:text-white">FlowSpace</span>
            </div>
            <div className="flex items-center space-x-2">
                <NotificationBell />
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0)}
                </div>
            </div>
         </header>

         {/* Desktop Header */}
         <header className="hidden md:flex bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 items-center justify-end sticky top-0 z-10 shrink-0">
            <div className="flex items-center space-x-3">
                <NotificationBell />
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0)}
                </div>
            </div>
         </header>

         {/* Page Content */}
         <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 relative">
            <div className="max-w-7xl mx-auto">
                {children}
            </div>
         </main>
      </div>
    </div>
  );
};
