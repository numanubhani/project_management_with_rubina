import { apiClient } from './client';
import { User, Project, Workspace, UserRole, ProjectStatus, PaymentStatus, FileData, Comment, ProjectUpdate } from '../types';

// Auth Services
export const authService = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post<{ access_token: string; token_type: string; user: User }>('/api/auth/login', {
      email,
      password,
    });
    apiClient.setToken(response.access_token);
    return response;
  },

  register: async (workspaceName: string, adminName: string, email: string, password: string) => {
    const response = await apiClient.post<{ access_token: string; token_type: string; user: User }>('/api/auth/register', {
      workspace_name: workspaceName,
      admin_name: adminName,
      email,
      password,
    });
    apiClient.setToken(response.access_token);
    return response;
  },
};

// User Services
export const userService = {
  getUsers: async (): Promise<User[]> => {
    return apiClient.get<User[]>('/api/users/');
  },

  createUser: async (name: string, email: string, password: string, role: UserRole): Promise<User> => {
    return apiClient.post<User>('/api/users/', {
      name,
      email,
      password,
      role,
    });
  },

  getCurrentUser: async (): Promise<User> => {
    return apiClient.get<User>('/api/users/me');
  },

  updateProfile: async (name?: string, password?: string): Promise<User> => {
    return apiClient.put<User>('/api/users/me', {
      name,
      password,
    });
  },
};

// Workspace Services
export const workspaceService = {
  getCurrentWorkspace: async (): Promise<Workspace> => {
    return apiClient.get<Workspace>('/api/workspaces/me');
  },

  getWorkspaceStats: async () => {
    return apiClient.get('/api/workspaces/me/stats');
  },

  updateWorkspace: async (name: string): Promise<Workspace> => {
    return apiClient.put<Workspace>('/api/workspaces/me', { name });
  },

  exportWorkspaceData: async (): Promise<Blob> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/workspaces/me/export`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiClient.getToken()}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(error.detail || 'Failed to export workspace data');
    }
    
    return await response.blob();
  },

  importWorkspaceData: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.uploadFile('/api/workspaces/me/import', formData);
  },
};

// Project Services
export const projectService = {
  getProjects: async (): Promise<Project[]> => {
    return apiClient.get<Project[]>('/api/projects/');
  },

  getProject: async (projectId: string): Promise<Project> => {
    return apiClient.get<Project>(`/api/projects/${projectId}`);
  },

  createProject: async (
    title: string,
    description: string,
    amount: number,
    deadline: string,
    files: File[]
  ): Promise<Project> => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('amount', amount.toString());
    formData.append('deadline', deadline);
    
    files.forEach((file) => {
      formData.append('files', file);
    });

    return apiClient.uploadFile<Project>('/api/projects/', formData);
  },

  updateProjectStatus: async (projectId: string, status: ProjectStatus): Promise<Project> => {
    return apiClient.put<Project>(`/api/projects/${projectId}/status`, { status });
  },

  uploadDelivery: async (projectId: string, files: File[]): Promise<Project> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    return apiClient.uploadFile<Project>(`/api/projects/${projectId}/delivery`, formData);
  },

  addComment: async (projectId: string, text: string): Promise<Comment> => {
    return apiClient.post<Comment>(`/api/projects/${projectId}/comments`, { text });
  },

  addProjectUpdate: async (projectId: string, text: string, files: File[]): Promise<ProjectUpdate> => {
    const formData = new FormData();
    formData.append('text', text);
    // Append files - supports all file types (images, PDFs, archives, documents, presentations, etc.)
    files.forEach((file) => {
      formData.append('files', file);
    });
    return apiClient.uploadFile<ProjectUpdate>(`/api/projects/${projectId}/updates`, formData);
  },

  markPaymentCleared: async (projectId: string): Promise<Project> => {
    return apiClient.put<Project>(`/api/projects/${projectId}/payment/clear`, {});
  },

  approvePayment: async (projectId: string): Promise<Project> => {
    return apiClient.put<Project>(`/api/projects/${projectId}/payment/approve`, {});
  },

  getDashboardStats: async () => {
    return apiClient.get('/api/projects/dashboard/stats');
  },

  getUnreadUpdates: async (projectId?: string): Promise<ProjectUpdate[]> => {
    const endpoint = projectId 
      ? `/api/projects/${projectId}/updates/unread`
      : '/api/projects/updates/unread';
    return apiClient.get<ProjectUpdate[]>(endpoint);
  },
};

// Finance Services
export const financeService = {
  getHistory: async (): Promise<Project[]> => {
    return apiClient.get<Project[]>('/api/finance/history');
  },

  getStats: async () => {
    return apiClient.get('/api/finance/stats');
  },
};

// File Services
export const fileService = {
  getFileUrl: (projectId: string, category: string, filename: string): string => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const token = apiClient.getToken();
    return `${baseUrl}/api/files/${projectId}/${category}/${filename}?token=${token}`;
  },
};

