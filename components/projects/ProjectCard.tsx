
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, UserRole, ProjectStatus } from '../../types';
import { Badge } from '../ui/Badge';
import { Countdown } from '../ui/Countdown';
import { formatCurrency, formatDate, formatDateShort } from '../../utils';
import { ArrowRight, CheckCircle, UploadCloud, Play } from 'lucide-react';
import { useAppStore } from '../../store';
import { DeliveryModal } from './DeliveryModal';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { user, updateProjectStatus } = useAppStore();
  const navigate = useNavigate();
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);

  const isAdmin = user?.role === UserRole.ADMIN;

  const handleStartProject = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Start working on this project? Status will change to "In Progress".')) {
      updateProjectStatus(project.id, ProjectStatus.IN_PROGRESS);
    }
  };

  const handleMarkCompleted = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateProjectStatus(project.id, ProjectStatus.COMPLETED);
  };

  const handleDeliveryOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeliveryModalOpen(true);
  };

  const navigateToDetails = () => {
    const routePrefix = isAdmin ? '/admin' : '/client';
    navigate(`${routePrefix}/project/${project.id}`);
  };

  return (
    <>
      <div 
        onClick={navigateToDetails}
        className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer flex flex-col h-full"
      >
        <div className="p-6 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-3">
            <Badge status={project.status} />
            <Countdown deadline={project.deadline} />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {project.title}
          </h3>
          
          <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4 flex-1">
            {project.description}
          </p>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 uppercase font-semibold">Amount</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(project.amount)}</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-xs text-gray-400 uppercase font-semibold">Due Date</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {formatDateShort(project.deadline)}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="bg-gray-50 dark:bg-gray-700/30 px-6 py-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <span className="text-xs font-medium text-gray-500 flex items-center">
                View Details <ArrowRight size={14} className="ml-1 transition-transform group-hover:translate-x-1" />
            </span>

            {/* Admin Quick Actions */}
            <div className="flex items-center space-x-2">
                {isAdmin && project.status === ProjectStatus.PENDING && (
                    <button 
                        onClick={handleStartProject}
                        className="p-2 bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/40 dark:hover:bg-green-900/60 dark:text-green-300 rounded-full transition-colors"
                        title="Start Project"
                    >
                        <Play size={16} />
                    </button>
                )}
                {isAdmin && project.status === ProjectStatus.IN_PROGRESS && (
                    <button 
                        onClick={handleDeliveryOpen}
                        className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 dark:text-blue-300 rounded-full transition-colors"
                        title="Deliver Project"
                    >
                        <UploadCloud size={16} />
                    </button>
                )}
                {isAdmin && project.status === ProjectStatus.DELIVERED && (
                    <button 
                        onClick={handleMarkCompleted}
                        className="p-2 bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/40 dark:hover:bg-green-900/60 dark:text-green-300 rounded-full transition-colors"
                        title="Mark Completed"
                    >
                        <CheckCircle size={16} />
                    </button>
                )}
            </div>
        </div>
      </div>

      {isDeliveryModalOpen && (
        <DeliveryModal 
          projectId={project.id} 
          onClose={() => setIsDeliveryModalOpen(false)} 
        />
      )}
    </>
  );
};
