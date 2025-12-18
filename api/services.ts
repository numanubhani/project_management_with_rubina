import { apiClient } from './client';
import { API_BASE_URL } from './config';
import { User, Project, Workspace, UserRole, ProjectStatus, PaymentStatus, FileData, Comment, ProjectUpdate, Collaborator, CollaboratorInvitation } from '../types';

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
    // Backend expects user creation at /api/users/create (see Django urls.py)
    return apiClient.post<User>('/api/users/create', {
      name,
      email,
      password,
      role,
    });
  },

  getCurrentUser: async (): Promise<User> => {
    // Backend endpoint: /api/users/me
    return apiClient.get<User>('/api/users/me');
  },

  updateProfile: async (name?: string, password?: string): Promise<User> => {
    // Backend endpoint: /api/users/me/update
    return apiClient.put<User>('/api/users/me/update', {
      name,
      password,
    });
  },
};

// Workspace Services
export const workspaceService = {
  getCurrentWorkspace: async (): Promise<Workspace> => {
    // Backend endpoint: /api/workspaces/me
    return apiClient.get<Workspace>('/api/workspaces/me');
  },

  getWorkspaceStats: async () => {
    return apiClient.get('/api/workspaces/me/stats');
  },

  updateWorkspace: async (name: string): Promise<Workspace> => {
    // Backend endpoint: /api/workspaces/me/update
    return apiClient.put<Workspace>('/api/workspaces/me/update', { name });
  },

  exportWorkspaceData: async (): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}/api/workspaces/me/export`, {
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
    
    // No import endpoint implemented on backend; keep placeholder but point to export
    // or remove this in future if not needed. For now, prevent 404 by using existing route.
    return apiClient.uploadFile('/api/workspaces/me/export', formData);
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

    // Backend create endpoint is /api/projects/create
    return apiClient.uploadFile<Project>('/api/projects/create', formData);
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

  markPaymentCleared: async (projectId: string, files?: File[]): Promise<Project> => {
    // If client provides payment proof (screenshots, receipts), send as multipart form-data.
    if (files && files.length > 0) {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      // Uses POST under the hood; backend accepts both PUT and POST for this route.
      return apiClient.uploadFile<Project>(`/api/projects/${projectId}/payment/clear`, formData);
    }
    // Fallback: no files, simple status change
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

// Collaborator Services
export const collaboratorService = {
  getProjectCollaborators: async (projectId: string): Promise<Collaborator[]> => {
    return apiClient.get<Collaborator[]>(`/api/projects/${projectId}/collaborators`);
  },

  inviteCollaborator: async (projectId: string, userId?: string, email?: string): Promise<CollaboratorInvitation> => {
    const payload: any = {};
    if (email) {
      payload.email = email;
    } else if (userId) {
      payload.user_id = userId;
    }
    return apiClient.post<CollaboratorInvitation>(`/api/projects/${projectId}/collaborators/invite`, payload);
  },

  removeCollaborator: async (projectId: string, collaboratorId: string): Promise<void> => {
    return apiClient.delete(`/api/projects/${projectId}/collaborators/${collaboratorId}`);
  },

  getMyInvitations: async (): Promise<CollaboratorInvitation[]> => {
    return apiClient.get<CollaboratorInvitation[]>('/api/collaborators/invitations');
  },

  respondToInvitation: async (invitationId: string, accept: boolean): Promise<CollaboratorInvitation> => {
    return apiClient.post<CollaboratorInvitation>(`/api/collaborators/invitations/${invitationId}/respond`, {
      accept,
    });
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
    const token = apiClient.getToken();
    return `${API_BASE_URL}/api/files/${projectId}/${category}/${filename}?token=${token}`;
  },
};

