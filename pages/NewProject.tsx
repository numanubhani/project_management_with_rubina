import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { Upload, Calendar, DollarSign, Type, ArrowLeft } from 'lucide-react';
import { FileData } from '../types';

export const NewProject: React.FC = () => {
  const { addProject, user, loadProjects } = useAppStore();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    deadlineDate: '',
    deadlineTime: '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
    // Combine date and time
    const deadlineISO = new Date(`${formData.deadlineDate}T${formData.deadlineTime}`).toISOString();

      await addProject({
      title: formData.title,
      description: formData.description,
      amount: parseFloat(formData.amount),
      deadline: deadlineISO,
      workspaceId: '', // Filled by store
      clientId: '', // Filled by store
      }, files);

      // Reload projects to ensure dashboard shows the new project
      await loadProjects();
      setIsSubmitting(false);
      navigate('/client/dashboard');
    } catch (error) {
    setIsSubmitting(false);
      // Error is handled in store
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button 
        onClick={() => navigate('/client/dashboard')} 
        className="flex items-center text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Dashboard
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create New Project</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Fill in the details to start a new request.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Title</label>
            <div className="relative">
              <Type className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                type="text" 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                placeholder="e.g. E-commerce Website Redesign"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea 
              required
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
              placeholder="Describe the requirements..."
            />
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total Amount ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  required
                  name="amount"
                  type="number"
                  min="0"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Deadline Date</label>
                    <input 
                        required
                        name="deadlineDate"
                        type="date"
                        value={formData.deadlineDate}
                        onChange={handleChange}
                        className="w-full px-3 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time</label>
                    <input 
                        required
                        name="deadlineTime"
                        type="time"
                        value={formData.deadlineTime}
                        onChange={handleChange}
                        className="w-full px-3 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm"
                    />
                </div>
            </div>
          </div>

          {/* File Upload */}
          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Attachments</label>
             <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <input 
                    type="file" 
                    multiple
                    accept="*/*"
                    onChange={handleFileChange}
                    className="hidden" 
                    id="project-files"
                />
                <label htmlFor="project-files" className="cursor-pointer flex flex-col items-center">
                    <Upload size={24} className="text-gray-400 mb-2" />
                    <span className="text-sm text-blue-500 font-medium">Upload files</span>
                    <span className="text-xs text-gray-400 mt-1">
                        {files.length > 0 ? `${files.length} files selected` : "Drag and drop or click"}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">Supports: Images, PDFs, Archives (ZIP, RAR), Documents (DOCX), Presentations (PPTX), and more</span>
                </label>
             </div>
          </div>

          <div className="pt-4">
             <button 
               type="submit" 
               disabled={isSubmitting}
               className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
             >
                {isSubmitting ? 'Creating Project...' : 'Submit Project'}
             </button>
          </div>

        </form>
      </div>
    </div>
  );
};