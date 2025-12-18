
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../store';
import { ProjectStatus, UserRole, FileData } from '../types';
import { Badge } from '../components/ui/Badge';
import { Countdown } from '../components/ui/Countdown';
import { Avatar } from '../components/ui/Avatar';
import { DeliveryModal } from '../components/projects/DeliveryModal';
import { DiscussionArea } from '../components/projects/DiscussionArea';
import { CollaboratorSection } from '../components/projects/CollaboratorSection';
import { formatCurrency, formatDate } from '../utils';
import { API_BASE_URL } from '../api/config';
import { 
  ArrowLeft, FileText, Download, CheckCircle, 
  UploadCloud, Clock, Paperclip, Briefcase, Lock, DollarSign, ShieldCheck,
  Play, Eye
} from 'lucide-react';

export const ProjectDetails: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const { projects, user, updateProjectStatus, markPaymentCleared, approvePayment, loadProjects } = useAppStore();
  const navigate = useNavigate();
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [isPaymentProofModalOpen, setIsPaymentProofModalOpen] = useState(false);
  const [isPaymentReviewModalOpen, setIsPaymentReviewModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'discussion'>('description');
  const [lastSeenDiscussionCount, setLastSeenDiscussionCount] = useState(0);

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

  // Track discussion item count (comments + updates) for unread badge
  const discussionCount = project ? project.comments.length + project.updates.length : 0;

  useEffect(() => {
    // Initialize last seen count when project loads
    if (discussionCount > 0 && lastSeenDiscussionCount === 0) {
      setLastSeenDiscussionCount(discussionCount);
    }
  }, [discussionCount, lastSeenDiscussionCount]);

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

  const handleStartProject = () => {
    if (confirm('Start working on this project? Status will change to "In Progress".')) {
      updateProjectStatus(project.id, ProjectStatus.IN_PROGRESS);
    }
  };

  const handleMarkCompleted = () => {
    if (
      confirm(
        'Mark this project as completed? Files will remain available until payment is completed and 2 days have passed.'
      )
    ) {
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
                               onClick={() => setIsPaymentProofModalOpen(true)}
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
                               onClick={() => setIsPaymentReviewModalOpen(true)}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all"
                             >
                               <Eye size={16} className="mr-1" />
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
        {/* Left Column: Description / Discussion (tabs) */}
         <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200 dark:border-gray-700 min-h-[400px]">
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl mb-4">
                <button 
                onClick={() => setActiveTab('description')}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center ${
                  activeTab === 'description'
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
              >
                <FileText size={16} className="mr-2" />
                Description
                </button>
                <button 
                onClick={() => {
                  setActiveTab('discussion');
                  // Mark discussion as read when tab is opened
                  setLastSeenDiscussionCount(discussionCount);
                }}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center ${
                  activeTab === 'discussion'
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
              >
                Discussion
                {discussionCount > lastSeenDiscussionCount && activeTab !== 'discussion' && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-semibold rounded-full bg-red-500 text-white">
                    {discussionCount - lastSeenDiscussionCount}
                  </span>
                )}
                </button>
            </div>

            {activeTab === 'description' ? (
              <>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Description
                            </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8 whitespace-pre-wrap">
                        {project.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-4 flex items-center">
                                <Paperclip size={14} className="mr-2" /> Original Requirements
                            </h4>
                {isCompleted && (
                  <div className="mb-3 border border-yellow-100 dark:border-yellow-900/40 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl p-3 text-xs text-yellow-800 dark:text-yellow-200 flex items-center">
                    <Lock size={14} className="mr-2" />
                    Files will be permanently deleted 2 days after payment is completed.
                                </div>
                )}
                {project.clientFiles.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No files uploaded.</p>
                            ) : (
                                    <div className="space-y-3">
                    {project.clientFiles.map((file) => (
                                            <FileItem key={file.id} file={file} />
                                        ))}
                                    </div>
                            )}
                        </div>
                        <div>
                            <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-4 flex items-center">
                                <CheckCircle size={14} className="mr-2" /> Deliverables
                            </h4>
                {isCompleted && (
                  <div className="mb-3 border border-yellow-100 dark:border-yellow-900/40 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl p-3 text-xs text-yellow-800 dark:text-yellow-200 flex items-center">
                    <Lock size={14} className="mr-2" />
                    Files will be permanently deleted 2 days after payment is completed.
                                </div>
                )}
                {project.deliveryFiles.length === 0 ? (
                                        <div className="border border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center">
                                            <p className="text-sm text-gray-400 italic">No deliveries yet.</p>
                                        </div>
                ) : (
                                    <div className="space-y-3">
                    {project.deliveryFiles.map((file) => (
                                            <FileItem key={file.id} file={file} isDelivery />
                                        ))}
                                    </div>
                            )}
                        </div>
                    </div>
              </>
            ) : (
              // Embedded discussion inside the same card
              <DiscussionArea projectId={project.id} embedded />
            )}
                     </div>
         </div>

         {/* Right Column: Project Info Sidebar */}
         <div className="space-y-6">
             {/* Collaborators Section */}
             <CollaboratorSection
               projectId={project.id}
               collaborators={project.collaborators || []}
               canManage={isAdmin || project.clientId === user.id}
             />

             <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
              Project Details
            </h3>
                
                <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm text-gray-500">Client</span>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {project.clientId === user.id ? 'You' : 'Client Name'}
                            </span>
                  <Avatar
                    name={project.clientId === user.id ? user.name : 'Client'}
                    size="sm"
                    className="w-6 h-6 text-[10px]"
                  />
                        </div>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm text-gray-500">Deadline Date</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDate(project.deadline).split(' ')[0]}
                </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm text-gray-500">Deadline Time</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDate(project.deadline).split(' ')[1]}
                </span>
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
             
         </div>
      </div>

      {isDeliveryModalOpen && (
        <DeliveryModal 
          projectId={project.id} 
          onClose={() => setIsDeliveryModalOpen(false)} 
        />
      )}
      {isPaymentProofModalOpen && (
        <PaymentProofModal
          projectId={project.id}
          onClose={() => setIsPaymentProofModalOpen(false)}
        />
      )}
      {isPaymentReviewModalOpen && (
        <PaymentReviewModal
          projectId={project.id}
          onClose={() => setIsPaymentReviewModalOpen(false)}
          isAdmin={isAdmin}
        />
      )}
        </div>
    );
};

const PaymentProofModal: React.FC<{ projectId: string; onClose: () => void }> = ({ projectId, onClose }) => {
  const { markPaymentCleared } = useAppStore();
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await markPaymentCleared(projectId, files);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Upload Payment Proof
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Please upload screenshot or receipt of the payment. Admin will verify it before approving.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Payment Screenshot / Receipt
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              className="block w-full text-sm text-gray-900 dark:text-gray-100 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/40 dark:file:text-blue-200"
              required
            />
            <p className="mt-1 text-xs text-gray-400">
              Supported: images and PDFs. You can select multiple files.
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
              disabled={submitting || files.length === 0}
            >
              {submitting ? 'Submitting...' : 'Submit & Mark Cleared'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PaymentReviewModal: React.FC<{ projectId: string; onClose: () => void; isAdmin: boolean }> = ({
  projectId,
  onClose,
  isAdmin,
}) => {
  const { projects, approvePayment } = useAppStore();
  const project = projects.find((p) => p.id === projectId);
  const [submitting, setSubmitting] = useState(false);

  if (!project) return null;

  const handleApprove = async () => {
    try {
      setSubmitting(true);
      await approvePayment(projectId);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
          <ShieldCheck size={18} className="mr-2 text-green-600" />
          Verify Payment
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Review the payment screenshots provided by the client. Once you approve, payment status will be marked as paid.
        </p>

        {project.paymentFiles.length === 0 ? (
          <div className="border border-dashed border-yellow-300 dark:border-yellow-800 rounded-lg p-4 mb-4 text-sm text-yellow-700 dark:text-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
            No payment proof files were uploaded for this project.
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto mb-4 space-y-3">
            {project.paymentFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/40"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100 break-all">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {file.size} • {new Date(file.uploadedAt).toLocaleString()}
                  </span>
                </div>
                <a
                  href={`${API_BASE_URL}${file.url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            disabled={submitting}
          >
            Close
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={handleApprove}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              disabled={submitting || project.paymentFiles.length === 0}
            >
              {submitting ? 'Approving...' : 'Approve Payment'}
            </button>
          )}
        </div>
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
            href={`${API_BASE_URL}${file.url}`}
            download 
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
            <Download size={18} />
        </a>
    </div>
);
