
import React from 'react';
import { Toaster } from 'react-hot-toast';
import { useAppStore } from './store';
import { Layout } from './components/ui/Layout';
import { Dashboard } from './pages/Dashboard';
import { NewProject } from './pages/NewProject';
import { ProjectDetails } from './pages/ProjectDetails';
import { Users } from './pages/Users';
import { Auth } from './pages/Auth';
import { Finance } from './pages/Finance';
import { Profile } from './pages/Profile';
import { UserRole } from './types';

function App() {
  const { user, currentPath } = useAppStore();

  const renderContent = () => {
    if (currentPath === '/new-project' && user?.role === UserRole.CLIENT) {
        return <NewProject />;
    }
    
    if (currentPath.startsWith('/project/')) {
        const projectId = currentPath.split('/')[2];
        return <ProjectDetails projectId={projectId} />;
    }

    if (currentPath === '/users' && user?.role === UserRole.ADMIN) {
      return <Users />;
    }

    if (currentPath === '/finance') {
        return <Finance />;
    }

    if (currentPath === '/profile') {
        return <Profile />;
    }

    return <Dashboard />;
  };

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white',
          style: {
            padding: '16px',
            borderRadius: '12px',
          },
        }}
      />
      
      {!user ? (
        <Auth />
      ) : (
        <Layout>
            {renderContent()}
        </Layout>
      )}
    </>
  );
}

export default App;
