import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { X, Upload } from 'lucide-react';
import { FileData } from '../../types';

interface DeliveryModalProps {
  projectId: string;
  onClose: () => void;
}

export const DeliveryModal: React.FC<DeliveryModalProps> = ({ projectId, onClose }) => {
  const { uploadDelivery } = useAppStore();
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    setIsUploading(true);
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const uploadedFiles: FileData[] = files.map(f => ({
      id: Math.random().toString(36).substr(2, 9),
      name: f.name,
      size: `${(f.size / 1024).toFixed(1)} KB`,
      type: f.type,
      url: 'https://picsum.photos/200', // Mock URL
      uploadedAt: new Date().toISOString()
    }));

    uploadDelivery(projectId, uploadedFiles);
    setIsUploading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Deliver Project</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center transition-colors hover:border-blue-500 dark:hover:border-blue-500">
             <input 
               type="file" 
               multiple 
               onChange={handleFileChange}
               className="hidden" 
               id="delivery-file-input"
             />
             <label htmlFor="delivery-file-input" className="cursor-pointer flex flex-col items-center">
                <Upload size={32} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">Click to upload delivery files</span>
                <span className="text-xs text-gray-400 mt-1">ZIP, PDF, PNG supported</span>
             </label>
          </div>

          {files.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Selected Files</p>
              <ul className="text-sm space-y-1">
                {files.map((f, i) => (
                  <li key={i} className="text-gray-700 dark:text-gray-200 truncate">{f.name}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isUploading || files.length === 0}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/30"
            >
              {isUploading ? 'Uploading...' : 'Send Delivery'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};