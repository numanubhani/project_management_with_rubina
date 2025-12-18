import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Project, Workspace, UserRole, ProjectStatus, FileData, Comment, ProjectUpdate, Collaborator, CollaboratorInvitation } from './types';
import type { PaymentStatus } from './types';
import toast from 'react-hot-toast';
import React from 'react';
import { 
  authService, 
  userService, 
  projectService, 
  workspaceService,
  financeService,
  collaboratorService
} from './api/services';
import { apiClient } from './api/client';

// Helper for System Notifications (currently unused, kept for future enhancements)
// const sendSystemNotification = (title: string, body: string) => {
//     if (!('Notification' in window)) return;
//     
//     if (Notification.permission === 'granted') {
//         new Notification(title, {
//             body,
//             icon: 'https://cdn-icons-png.flaticon.com/512/3043/3043232.png',
//             vibrate: [200, 100, 200]
//         } as any);
//     }
// };

interface AppState {
  user: User | null;
  users: User[];
  theme: 'light' | 'dark';
  workspaces: Workspace[];
  projects: Project[];
  lastCheckTime: string;
  loading: boolean;
  invitations: CollaboratorInvitation[];
  
  // Actions
  toggleTheme: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  registerWorkspace: (workspaceName: string, adminName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUserData: () => Promise<void>;
  loadProjects: () => Promise<void>;
  loadUsers: () => Promise<void>;
  
  // User Management Actions
  createUser: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  updateUserProfile: (name: string, password?: string) => Promise<void>;

  // Project Actions
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'status' | 'clientFiles' | 'deliveryFiles' | 'comments' | 'paymentStatus' | 'updates'>, files: File[]) => Promise<void>;
  updateProjectStatus: (projectId: string, status: ProjectStatus) => Promise<void>;
  uploadDelivery: (projectId: string, files: File[]) => Promise<void>;
  addComment: (projectId: string, text: string) => Promise<void>;
  addProjectUpdate: (projectId: string, text: string, files: File[]) => Promise<void>;
  markPaymentCleared: (projectId: string, files?: File[]) => Promise<void>;
  approvePayment: (projectId: string) => Promise<void>;
  
  // Collaborator Actions
  loadInvitations: () => Promise<void>;
  inviteCollaborator: (projectId: string, userId?: string, email?: string) => Promise<void>;
  respondToInvitation: (invitationId: string, accept: boolean) => Promise<void>;
  removeCollaborator: (projectId: string, collaboratorId: string) => Promise<void>;
  
  // Simulation (for demo purposes - can be removed in production)
  simulateIncomingProject: () => void;
  simulateIncomingComment: () => void;
  checkUnreadUpdates: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      users: [],
      theme: 'light',
      workspaces: [],
      projects: [],
      lastCheckTime: new Date().toISOString(),
      loading: false,
      invitations: [],

      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { theme: newTheme };
        });
      },

      login: async (email, password) => {
        try {
          set({ loading: true });
          const response = await authService.login(email, password);
          
          set({ 
            user: response.user, 
            lastCheckTime: new Date().toISOString(),
            loading: false
          });
          
          // Request notification permission on login
          if ('Notification' in window && Notification.permission !== 'granted') {
             Notification.requestPermission();
          }

          // Load user data after login
          await get().loadProjects();
          await get().loadUsers();
          await get().loadInvitations();
          
          toast.success(`Welcome back, ${response.user.name}!`);
          return true;
        } catch (error: any) {
          set({ loading: false });
          toast.error(error.message || "Invalid email or password");
          return false;
        }
      },

      registerWorkspace: async (workspaceName, adminName, email, password) => {
        try {
          set({ loading: true });
          const response = await authService.register(workspaceName, adminName, email, password);
          
          set({ 
            user: response.user,
            lastCheckTime: new Date().toISOString(),
            loading: false
          });
          
          // Request notification permission
          if ('Notification' in window && Notification.permission !== 'granted') {
             Notification.requestPermission();
          }

          // Load initial data
          await get().loadProjects();
          await get().loadUsers();
          await get().loadInvitations();
          
          toast.success('Workspace created successfully!');
        } catch (error: any) {
          set({ loading: false });
          toast.error(error.message || 'Failed to create workspace');
          throw error;
        }
      },

      logout: () => {
        apiClient.setToken(null);
        set({ 
          user: null, 
          users: [],
          projects: [],
          workspaces: []
        });
      },

      loadUserData: async () => {
        try {
          const user = await userService.getCurrentUser();
          set({ user });
        } catch (error) {
          console.error('Failed to load user data:', error);
        }
      },

      loadProjects: async () => {
        try {
          const projects = await projectService.getProjects();
          console.log('Loaded projects from backend:', projects);
          set({ projects });
        } catch (error: any) {
          console.error('Failed to load projects:', error);
          toast.error(error.message || 'Failed to load projects');
          set({ projects: [] });
        }
      },

      loadUsers: async () => {
        try {
          const users = await userService.getUsers();
          set({ users });
        } catch (error) {
          console.error('Failed to load users:', error);
          set({ users: [] });
        }
      },

      createUser: async (name, email, password, role) => {
        try {
          set({ loading: true });
          const newUser = await userService.createUser(name, email, password, role);
          set((state) => ({ 
            users: [...state.users, newUser],
            loading: false
          }));
          toast.success(`${role === UserRole.CLIENT ? 'Client' : 'Admin'} created successfully!`);
        } catch (error: any) {
          set({ loading: false });
          toast.error(error.message || "Failed to create user");
          throw error;
        }
      },

      updateUserProfile: async (name, password) => {
        try {
          set({ loading: true });
          const updatedUser = await userService.updateProfile(name, password);
          set((state) => ({
            user: updatedUser,
            users: state.users.map(u => u.id === updatedUser.id ? updatedUser : u),
            loading: false
          }));
          toast.success('Profile updated successfully');
        } catch (error: any) {
          set({ loading: false });
          toast.error(error.message || 'Failed to update profile');
          throw error;
        }
      },

      addProject: async (projectData, files) => {
        try {
          set({ loading: true });
          const deadlineISO = new Date(projectData.deadline).toISOString();
          const newProject = await projectService.createProject(
            projectData.title,
            projectData.description,
            projectData.amount,
            deadlineISO,
            files
          );
          
          // Add new project to the list and reload all projects to ensure consistency
          set((state) => ({ 
            projects: [...state.projects, newProject],
            loading: false
          }));
          
          // Reload projects from backend to ensure we have the latest data
          setTimeout(async () => {
            try {
              const allProjects = await projectService.getProjects();
              set({ projects: allProjects });
            } catch (err) {
              console.error('Failed to reload projects:', err);
            }
          }, 500);
          
          toast.success('Project submitted successfully!');
        } catch (error: any) {
          set({ loading: false });
          toast.error(error.message || 'Failed to create project');
          throw error;
        }
      },

      updateProjectStatus: async (projectId, status) => {
        try {
          set({ loading: true });
          const updatedProject = await projectService.updateProjectStatus(projectId, status);
          
          set((state) => ({
            projects: state.projects.map(p => 
              p.id === projectId ? updatedProject : p
            ),
            loading: false
          }));
          
          // Reload projects to ensure consistency
          setTimeout(async () => {
            try {
              const allProjects = await projectService.getProjects();
              set({ projects: allProjects });
            } catch (err) {
              console.error('Failed to reload projects:', err);
            }
          }, 300);
          
          const statusText = status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
          toast.success(`Project status updated to ${statusText}`);
        } catch (error: any) {
          set({ loading: false });
          toast.error(error.message || 'Failed to update project status');
          throw error;
        }
      },

      uploadDelivery: async (projectId, files) => {
        try {
          set({ loading: true });
          const updatedProject = await projectService.uploadDelivery(projectId, files);
          
          set((state) => ({
            projects: state.projects.map(p => 
              p.id === projectId ? updatedProject : p
            ),
            loading: false
          }));
          
          toast.success('Delivery files uploaded & project updated!');
        } catch (error: any) {
          set({ loading: false });
          toast.error(error.message || 'Failed to upload delivery');
          throw error;
        }
      },

      addComment: async (projectId, text) => {
        try {
          const newComment = await projectService.addComment(projectId, text);
          
          set((state) => ({
            projects: state.projects.map(p => 
              p.id === projectId ? { 
                ...p, 
                comments: [...p.comments, {
                  id: newComment.id,
                  userId: newComment.userId,
                  userName: newComment.userName,
                  text: newComment.text,
                  createdAt: newComment.createdAt
                }]
              } : p
            )
          }));
          
          toast.success('Comment added');
        } catch (error: any) {
          toast.error(error.message || 'Failed to add comment');
          throw error;
        }
      },

      addProjectUpdate: async (projectId, text, files) => {
        try {
          set({ loading: true });
          // Get current project status before update
          const currentProject = get().projects.find(p => p.id === projectId);
          const wasDelivered = currentProject?.status === ProjectStatus.DELIVERED;
          
          const newUpdate = await projectService.addProjectUpdate(projectId, text, files);
          
          // Reload the project to get updated status (in case it changed from DELIVERED to IN_PROGRESS)
          const updatedProject = await projectService.getProject(projectId);
          
          set((state) => ({
            projects: state.projects.map(p => 
              p.id === projectId ? updatedProject : p
            ),
            loading: false
          }));
          
          // Check if status changed from DELIVERED to IN_PROGRESS
          if (wasDelivered && updatedProject.status === ProjectStatus.IN_PROGRESS) {
            toast.success('Update added! Project status changed to In Progress.');
          } else {
            toast.success('Update sent to Admin successfully');
          }
        } catch (error: any) {
          set({ loading: false });
          toast.error(error.message || 'Failed to add update');
          throw error;
        }
      },

      markPaymentCleared: async (projectId, files) => {
        try {
          set({ loading: true });
          const updatedProject = await projectService.markPaymentCleared(projectId, files);
          
          set((state) => ({
            projects: state.projects.map(p => 
              p.id === projectId ? updatedProject : p
            ),
            loading: false
          }));
          
          toast.success('Payment marked as cleared. Waiting for Admin approval.');
        } catch (error: any) {
          set({ loading: false });
          toast.error(error.message || 'Failed to mark payment');
          throw error;
        }
      },

      approvePayment: async (projectId) => {
        try {
          set({ loading: true });
          const updatedProject = await projectService.approvePayment(projectId);
          
          set((state) => ({
            projects: state.projects.map(p => 
              p.id === projectId ? updatedProject : p
            ),
            loading: false
          }));
          
          const isClosed =
            updatedProject.status === ProjectStatus.COMPLETED &&
            updatedProject.paymentStatus === PaymentStatus.PAID;

          if (isClosed) {
            toast.success('Payment approved! Project closed. Files will be deleted after 2 days.');
          } else {
            toast.success('Payment approved!');
          }
        } catch (error: any) {
          set({ loading: false });
          toast.error(error.message || 'Failed to approve payment');
          throw error;
        }
      },

      simulateIncomingProject: () => {
        // This is a demo feature - can be removed in production
        const { user } = get();
        if (!user || user.role !== UserRole.ADMIN) return;
        
        toast('Simulation feature - use real projects in production', { icon: 'ℹ️' });
      },

      simulateIncomingComment: () => {
        // This is a demo feature - can be removed in production
        toast('Simulation feature - use real comments in production', { icon: 'ℹ️' });
      },

      checkUnreadUpdates: async () => {
        const { user } = get();
        if (!user || user.role !== UserRole.ADMIN) return;

        try {
          const updates = await projectService.getUnreadUpdates();
          // We still update the last check time for potential future use,
          // but no longer show pop-up toasts or browser notifications.
          if (updates.length > 0) {
            set({ lastCheckTime: new Date().toISOString() });
          }
        } catch (error) {
          console.error('Failed to check updates:', error);
        }
      },

      loadInvitations: async () => {
        try {
          const invitations = await collaboratorService.getMyInvitations();
          set({ invitations });
        } catch (error: any) {
          console.error('Failed to load invitations:', error);
          set({ invitations: [] });
        }
      },

      inviteCollaborator: async (projectId, userId, email) => {
        try {
          set({ loading: true });
          const invitation = await collaboratorService.inviteCollaborator(projectId, userId, email);
          
          // Reload projects to get updated collaborator list
          await get().loadProjects();
          
          set({ loading: false });
          toast.success('Collaborator invitation sent!');
        } catch (error: any) {
          set({ loading: false });
          toast.error(error.message || 'Failed to invite collaborator');
          throw error;
        }
      },

      respondToInvitation: async (invitationId, accept) => {
        try {
          set({ loading: true });
          await collaboratorService.respondToInvitation(invitationId, accept);
          
          // Reload invitations and projects
          await get().loadInvitations();
          await get().loadProjects();
          
          set({ loading: false });
          toast.success(accept ? 'Invitation accepted! You are now a collaborator.' : 'Invitation rejected.');
        } catch (error: any) {
          set({ loading: false });
          toast.error(error.message || 'Failed to respond to invitation');
          throw error;
        }
      },

      removeCollaborator: async (projectId, collaboratorId) => {
        try {
          set({ loading: true });
          await collaboratorService.removeCollaborator(projectId, collaboratorId);
          
          // Reload projects to get updated collaborator list
          await get().loadProjects();
          
          set({ loading: false });
          toast.success('Collaborator removed successfully');
        } catch (error: any) {
          set({ loading: false });
          toast.error(error.message || 'Failed to remove collaborator');
          throw error;
        }
      }
    }),
    {
      name: 'flowspace-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user,
        theme: state.theme,
        lastCheckTime: state.lastCheckTime
      }),
    }
  )
);
