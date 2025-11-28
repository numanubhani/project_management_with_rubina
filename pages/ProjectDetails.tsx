
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../store';
import { ProjectStatus, UserRole } from '../types';
import { Badge } from '../components/ui/Badge';
import { Countdown } from '../components/ui/Countdown';
import { Avatar } from '../components/ui/Avatar';
import { DeliveryModal } from '../components/projects/DeliveryModal';
import { formatCurrency, formatDate } from '../utils';
import { formatDistanceToNow } from 'date-fns';
import { 
  ArrowLeft, FileText, Download, Send, CheckCircle, 
  UploadCloud, Clock, MessageSquare, Paperclip, Briefcase, Lock, DollarSign, ShieldCheck,
  AlertTriangle, Upload, Plus, Bell, Play
} from 'lucide-react';

export const ProjectDetails: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const { projects, user, addComment, updateProjectStatus, markPaymentCleared, approvePayment, addProjectUpdate, loadProjects } = useAppStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'comments'>('overview');
  const [newComment, setNewComment] = useState('');
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const project = projects.find(p => p.id === projectId);

  useEffect(() => {
    if (projectId && user) {
      // If project not in store, try to load it
      if (!project) {
        setLoading(true);
        loadProjects().finally(() => setLoading(false));
      }
    }
  }, [projectId, user, project, loadProjects]);

  useEffect(() => {
    if (activeTab === 'comments' && commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [project?.comments, activeTab]);

  if (!project || !user || !projectId) {
    const dashboardPath = user?.role === UserRole.ADMIN ? '/admin/dashboard' : '/client/dashboard';
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Project Not Found</h2>
        <button onClick={() => navigate(dashboardPath)} className="mt-4 text-blue-600 hover:underline">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const isAdmin = user.role === UserRole.ADMIN;
  const isCompleted = project.status === ProjectStatus.COMPLETED;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addComment(project.id, newComment);
    setNewComment('');
  };

  const handleStartProject = () => {
    if (confirm('Start working on this project? Status will change to "In Progress".')) {
      updateProjectStatus(project.id, ProjectStatus.IN_PROGRESS);
    }
  };

  const handleMarkCompleted = () => {
    if (confirm('Marking this project as completed will delete all files permanently. Are you sure?')) {
        updateProjectStatus(project.id, ProjectStatus.COMPLETED);
    }
  };

  const StatusStep = ({ status, label, currentStatus, index }: any) => {
    const statusOrder = [ProjectStatus.PENDING, ProjectStatus.IN_PROGRESS, ProjectStatus.DELIVERED, ProjectStatus.COMPLETED];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(status);
    
    const isCompletedStep = stepIndex < currentIndex;
    const isCurrent = stepIndex === currentIndex;

    return (
      <div className="flex flex-col items-center relative z-10 w-1/4">
        <div 
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500
            ${isCompletedStep ? 'bg-green-500 text-white' : isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/30' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}
          `}
        >
          {isCompletedStep ? <CheckCircle size={14} /> : index + 1}
        </div>
        <span className={`mt-2 text-xs font-medium ${isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      {/* Navigation */}
      <button 
        onClick={() => navigate(user.role === UserRole.ADMIN ? '/admin/dashboard' : '/client/dashboard')} 
        className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={18} className="mr-1" />
        Back to Dashboard
      </button>

      {/* Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200 dark:border-gray-700 mb-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                    <Badge status={project.status} />
                    <span className="text-gray-400 text-sm">#{project.id.slice(0, 8)}</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{project.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center"><Clock size={16} className="mr-1.5"/> Posted {formatDate(project.createdAt)}</span>
                    <span className="flex items-center"><Briefcase size={16} className="mr-1.5"/> Budget: <span className="text-gray-900 dark:text-white font-semibold ml-1">{formatCurrency(project.amount)}</span></span>
                </div>
            </div>

            <div className="flex flex-col items-end space-y-3 min-w-[200px]">
                {!isCompleted && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-2 border border-gray-100 dark:border-gray-600">
                        <span className="text-xs text-gray-500 uppercase font-semibold mb-1 block text-right">Time Remaining</span>
                        <Countdown deadline={project.deadline} />
                    </div>
                )}
                
                {/* Actions */}
                <div className="flex space-x-2 w-full justify-end">
                    {/* Client Actions */}
                    {!isAdmin && !isCompleted && (
                         <button 
                            onClick={() => setIsUpdateModalOpen(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
                         >
                            <Bell size={16} />
                            <span>Add Update/Info</span>
                        </button>
                    )}

                    {/* Admin Actions */}
                    {isAdmin && project.status !== ProjectStatus.COMPLETED && (
                        <>
                           {project.status === ProjectStatus.PENDING && (
                                <button 
                                    onClick={handleStartProject}
                                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-green-500/20"
                                >
                                    <Play size={16} />
                                    <span>Start Project</span>
                                </button>
                           )}
                           {project.status === ProjectStatus.IN_PROGRESS && (
                                <button 
                                    onClick={() => setIsDeliveryModalOpen(true)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
                                >
                                    <UploadCloud size={16} />
                                    <span>Deliver</span>
                                </button>
                           )}
                           {project.status === ProjectStatus.DELIVERED && (
                                <button 
                                    onClick={handleMarkCompleted}
                                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-green-500/20"
                                >
                                    <CheckCircle size={16} />
                                    <span>Complete</span>
                                </button>
                           )}
                        </>
                    )}
                </div>
            </div>
         </div>

         {/* Timeline */}
         <div className="mt-10 relative">
             <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -z-0"></div>
             <div className="flex justify-between w-full">
                <StatusStep status={ProjectStatus.PENDING} label="Pending" currentStatus={project.status} index={0} />
                <StatusStep status={ProjectStatus.IN_PROGRESS} label="In Progress" currentStatus={project.status} index={1} />
                <StatusStep status={ProjectStatus.DELIVERED} label="Delivered" currentStatus={project.status} index={2} />
                <StatusStep status={ProjectStatus.COMPLETED} label="Completed" currentStatus={project.status} index={3} />
             </div>
         </div>
      </div>

      {/* Payment Section (Visible when Completed) */}
      {isCompleted && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-3xl p-6 mb-8 border border-green-100 dark:border-green-900/30 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-sm text-green-600">
                      <DollarSign size={24} />
                  </div>
                  <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">Payment Status</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {project.paymentStatus === 'paid' ? 'Transaction closed.' : 'Finalize payment to close.'}
                      </p>
                  </div>
              </div>

              <div className="flex items-center gap-4">
                  <div className="text-right mr-4">
                      <span className="block text-xs text-gray-500 uppercase font-semibold">Total Amount</span>
                      <span className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(project.amount)}</span>
                  </div>

                  {project.paymentStatus === 'unpaid' && (
                    <div className="flex items-center gap-3">
                         <span className="text-sm font-medium text-red-500 bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-full">Unpaid</span>
                         {!isAdmin && (
                             <button 
                                onClick={() => markPaymentCleared(project.id)}
                                className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-lg shadow-green-500/30 transition-all"
                             >
                                Mark Payment Cleared
                             </button>
                         )}
                         {isAdmin && <span className="text-sm text-gray-500 italic">Waiting for client...</span>}
                    </div>
                  )}

                  {project.paymentStatus === 'pending_approval' && (
                    <div className="flex items-center gap-3">
                         <span className="text-sm font-medium text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full flex items-center">
                            <Clock size={14} className="mr-1"/> Pending Approval
                         </span>
                         {isAdmin ? (
                             <button 
                                onClick={() => approvePayment(project.id)}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all"
                             >
                                Verify & Approve
                             </button>
                         ) : (
                             <span className="text-sm text-gray-500 italic">Waiting for admin approval...</span>
                         )}
                    </div>
                  )}

                  {project.paymentStatus === 'paid' && (
                      <div className="flex items-center text-green-600 dark:text-green-400 font-bold bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm">
                          <ShieldCheck size={20} className="mr-2" />
                          Payment Verified
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* Left Column: Description & Discussion */}
         <div className="lg:col-span-2 space-y-8">
            
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl">
                <button 
                    onClick={() => setActiveTab('overview')}
                    className={`flex-1 flex items-center justify-center py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'overview' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                >
                    <FileText size={16} className="mr-2" /> Overview & Files
                </button>
                <button 
                    onClick={() => setActiveTab('comments')}
                    className={`flex-1 flex items-center justify-center py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'comments' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                >
                    <MessageSquare size={16} className="mr-2" /> Discussion <span className="ml-2 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full text-xs">{project.comments.length}</span>
                </button>
            </div>

            {activeTab === 'overview' ? (
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 min-h-[400px]">
                    
                    {/* Project Updates Alert Section */}
                    {project.updates && project.updates.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center text-indigo-600 dark:text-indigo-400">
                                <Bell size={16} className="mr-2" /> Recent Updates & Info
                            </h3>
                            <div className="space-y-4">
                                {project.updates.map((update) => (
                                    <div key={update.id} className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">Client Update</span>
                                            <span className="text-xs text-gray-500">{formatDate(update.createdAt)}</span>
                                        </div>
                                        <p className="text-gray-800 dark:text-gray-200 text-sm mb-3">{update.text}</p>
                                        {update.files && update.files.length > 0 && (
                                            <div className="space-y-2 bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-100 dark:border-gray-700">
                                                {update.files.map(f => (
                                                    <FileItem key={f.id} file={f} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Description</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8 whitespace-pre-wrap">
                        {project.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-4 flex items-center">
                                <Paperclip size={14} className="mr-2" /> Original Requirements
                            </h4>
                            {isCompleted ? (
                                <div className="border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 rounded-xl p-4 flex items-center text-red-600 dark:text-red-400 text-sm">
                                    <Lock size={16} className="mr-2" /> Files deleted upon completion.
                                </div>
                            ) : (
                                <>
                                    {project.clientFiles.length === 0 && <p className="text-sm text-gray-400 italic">No files uploaded.</p>}
                                    <div className="space-y-3">
                                        {project.clientFiles.map(file => (
                                            <FileItem key={file.id} file={file} />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        <div>
                            <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-4 flex items-center">
                                <CheckCircle size={14} className="mr-2" /> Deliverables
                            </h4>
                            {isCompleted ? (
                                <div className="border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 rounded-xl p-4 flex items-center text-red-600 dark:text-red-400 text-sm">
                                    <Lock size={16} className="mr-2" /> Files deleted upon completion.
                                </div>
                            ) : (
                                <>
                                    {project.deliveryFiles.length === 0 && (
                                        <div className="border border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center">
                                            <p className="text-sm text-gray-400 italic">No deliveries yet.</p>
                                        </div>
                                    )}
                                    <div className="space-y-3">
                                        {project.deliveryFiles.map(file => (
                                            <FileItem key={file.id} file={file} isDelivery />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-[500px]">
                     <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {project.comments.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <MessageSquare size={40} className="mb-2 opacity-20" />
                                <p>No comments yet. Start the conversation!</p>
                            </div>
                        ) : (
                            project.comments.map(comment => (
                                <div key={comment.id} className={`flex space-x-3 ${comment.userId === user.id ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                    <Avatar name={comment.userName} size="sm" />
                                    <div className={`flex flex-col ${comment.userId === user.id ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-md px-4 py-3 rounded-2xl text-sm ${
                                            comment.userId === user.id 
                                            ? 'bg-blue-600 text-white rounded-tr-none' 
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
                                        }`}>
                                            {comment.text}
                                        </div>
                                        <span className="text-xs text-gray-400 mt-1">
                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={commentsEndRef} />
                     </div>
                     <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-3xl">
                        <form onSubmit={handleCommentSubmit} className="flex gap-2">
                            <input 
                                type="text" 
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                            />
                            <button 
                                type="submit"
                                disabled={!newComment.trim()}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white p-3 rounded-xl transition-colors"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                     </div>
                </div>
            )}
         </div>

         {/* Right Column: Project Info Sidebar */}
         <div className="space-y-6">
             <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Project Details</h3>
                
                <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm text-gray-500">Client</span>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {project.clientId === user.id ? 'You' : 'Client Name'}
                            </span>
                            <Avatar name={project.clientId === user.id ? user.name : 'Client'} size="sm" className="w-6 h-6 text-[10px]" />
                        </div>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm text-gray-500">Deadline Date</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(project.deadline).split(' ')[0]}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm text-gray-500">Deadline Time</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(project.deadline).split(' ')[1]}</span>
                    </div>
                    <div className="pt-2">
                        <span className="text-sm text-gray-500 block mb-2">Workspace</span>
                        <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                            <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                                FS
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">FlowSpace</p>
                                <p className="text-xs text-gray-500">Design Team</p>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
             
             {/* Hint Box */}
             <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg">
                 <h4 className="font-bold mb-2 flex items-center"><Clock size={16} className="mr-2"/> Pro Tip</h4>
                 <p className="text-sm text-indigo-100 leading-relaxed">
                    Keep communication centralized in the discussion tab to maintain a clear audit trail of project changes.
                 </p>
             </div>
         </div>
      </div>

      {isDeliveryModalOpen && (
        <DeliveryModal 
          projectId={project.id} 
          onClose={() => setIsDeliveryModalOpen(false)} 
        />
      )}

      {isUpdateModalOpen && (
          <UpdateModal 
            projectId={project.id} 
            onClose={() => setIsUpdateModalOpen(false)} 
          />
      )}
    </div>
  );
};

const UpdateModal: React.FC<{ projectId: string; onClose: () => void }> = ({ projectId, onClose }) => {
    const { addProjectUpdate } = useAppStore();
    const [text, setText] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        setIsSubmitting(true);

        try {
            await addProjectUpdate(projectId, text, files);
        setIsSubmitting(false);
        onClose();
        } catch (error) {
            setIsSubmitting(false);
            // Error is handled in store
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Project Update</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <ArrowLeft size={24} className="rotate-180" />
                    </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Send new information or files to the Admin. This will trigger a notification.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <textarea 
                        required
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Describe what's new..."
                        rows={4}
                        className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                    />
                    
                    <div>
                        <input 
                            type="file" 
                            multiple
                            accept="*/*"
                            onChange={handleFileChange}
                            className="hidden" 
                            id="update-files"
                        />
                        <label htmlFor="update-files" className="flex items-center justify-center w-full p-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <Upload size={18} className="text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                {files.length > 0 ? `${files.length} files attached` : 'Attach files (optional)'}
                            </span>
                        </label>
                        <p className="text-xs text-gray-400 mt-1 text-center">Supports all file types: Images, PDFs, Archives, Documents, Presentations, etc.</p>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting || !text.trim()}
                            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/30"
                        >
                            {isSubmitting ? 'Sending...' : 'Send Update'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const FileItem: React.FC<{ file: FileData; isDelivery?: boolean }> = ({ file, isDelivery = false }) => (
    <div className={`group flex items-center justify-between p-3 rounded-xl border transition-all hover:shadow-sm ${isDelivery ? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30' : 'bg-gray-50 dark:bg-gray-700/30 border-gray-100 dark:border-gray-700'}`}>
        <div className="flex items-center space-x-3 overflow-hidden">
            <div className={`p-2 rounded-lg ${isDelivery ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'}`}>
                <FileText size={18} />
            </div>
            <div className="min-w-0">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-[150px] sm:max-w-[200px]">{file.name}</p>
                <p className="text-xs text-gray-400">{file.size} • {file.type.split('/')[1]?.toUpperCase() || 'FILE'}</p>
            </div>
        </div>
        <a 
            href={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${file.url}`}
            download 
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
            <Download size={18} />
        </a>
    </div>
);
