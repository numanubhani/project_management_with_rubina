import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { UserRole } from '../types';
import { ProjectCard } from '../components/projects/ProjectCard';
import { Layers, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { projectService } from '../api/services';

interface DashboardStats {
  total: number;
  pending: number;
  active: number;
  completed: number;
}

export const Dashboard: React.FC = () => {
  const { user, projects, loadProjects } = useAppStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({ total: 0, pending: 0, active: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (user) {
      setLoading(true);
      try {
        // Load projects from backend
        await loadProjects();
        
        // Get stats from backend API
        try {
          const statsData = await projectService.getDashboardStats();
          setStats({
            total: statsData.total || 0,
            pending: statsData.pending || 0,
            active: statsData.active || 0,
            completed: statsData.completed || 0,
          });
        } catch (statsError) {
          console.error('Failed to load stats, calculating from projects:', statsError);
          // Fallback to calculating from projects in store
          const currentProjects = useAppStore.getState().projects;
          const myProjects = currentProjects.filter(p => {
            if (p.workspaceId !== user.workspaceId) return false;
            if (user.role === UserRole.CLIENT) {
              return p.clientId === user.id;
            }
            return true;
          });
          setStats({
            total: myProjects.length,
            pending: myProjects.filter(p => p.status === 'pending').length,
            active: myProjects.filter(p => p.status === 'in_progress').length,
            completed: myProjects.filter(p => p.status === 'completed' || p.status === 'delivered').length,
          });
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Refresh when page becomes visible (e.g., navigating back from another page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        fetchDashboardData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);
  
  // Refresh when projects change (e.g., after creating a new project)
  useEffect(() => {
    if (user && projects.length >= 0) {
      // Recalculate stats when projects change
      const myProjects = projects.filter(p => {
        if (p.workspaceId !== user.workspaceId) return false;
        if (user.role === UserRole.CLIENT) {
          return p.clientId === user.id;
        }
        return true;
      });
      
      // Update stats when projects change
      setStats({
        total: myProjects.length,
        pending: myProjects.filter(p => p.status === 'pending').length,
        active: myProjects.filter(p => p.status === 'in_progress').length,
        completed: myProjects.filter(p => p.status === 'completed' || p.status === 'delivered').length,
      });
    }
  }, [projects, user]);

  if (!user) return null;

  // Filter projects based on role and workspace (from backend)
  const myProjects = projects.filter(p => {
    if (p.workspaceId !== user.workspaceId) return false;
    if (user.role === UserRole.CLIENT) {
      return p.clientId === user.id;
    }
    return true; // Admin sees all in workspace
  });

  // Sort by deadline (nearest first)
  const sortedProjects = [...myProjects].sort((a, b) => 
    new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  );

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-20`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
             {user.role === UserRole.ADMIN ? 'Workspace Board' : 'My Projects'}
           </h1>
           <p className="text-gray-500 dark:text-gray-400 mt-1">
             Manage and track your project progress
           </p>
        </div>
        {user.role === UserRole.CLIENT && (
          <button 
            onClick={() => navigate('/client/new-project')}
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/30"
          >
            + New Project
          </button>
        )}
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Layers} label="Total Projects" value={stats.total} color="bg-gray-500 text-gray-600" />
        <StatCard icon={AlertCircle} label="Pending" value={stats.pending} color="bg-yellow-500 text-yellow-600" />
        <StatCard icon={Clock} label="In Progress" value={stats.active} color="bg-blue-500 text-blue-600" />
        <StatCard icon={CheckCircle} label="Completed" value={stats.completed} color="bg-green-500 text-green-600" />
      </div>
      )}

      {/* Project List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Active Priorities</h2>
          <span className="text-sm text-gray-500">Sorted by deadline</span>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : sortedProjects.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
            <Layers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No projects found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-2">
              {user.role === UserRole.CLIENT 
                ? "Get started by creating a new project request."
                : "Waiting for clients to submit new projects."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};