import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Project, Workspace, UserRole, ProjectStatus, FileData, Comment, PaymentStatus, ProjectUpdate } from './types';
import toast from 'react-hot-toast';
import React from 'react'; // Required for JSX in toast

// Simple ID generator
const generateId = () => Math.random().toString(36).substring(2, 9);

// Helper for System Notifications (Mobile Status Bar)
const sendSystemNotification = (title: string, body: string) => {
    if (!('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
        new Notification(title, {
            body,
            icon: 'https://cdn-icons-png.flaticon.com/512/3043/3043232.png',
            vibrate: [200, 100, 200]
        } as any);
    }
};

interface AppState {
  user: User | null;
  users: User[]; // Mock database of all users
  theme: 'light' | 'dark';
  workspaces: Workspace[];
  projects: Project[];
  currentPath: string;
  lastCheckTime: string; // Timestamp of the last update check
  
  // Actions
  toggleTheme: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  registerWorkspace: (workspaceName: string, adminName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  navigate: (path: string) => void;
  
  // User Management Actions
  createUser: (name: string, email: string, password: string, role: UserRole) => void;
  updateUserProfile: (name: string, password?: string) => void;

  // Project Actions
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'status' | 'clientFiles' | 'deliveryFiles' | 'comments' | 'paymentStatus' | 'updates'>, files: FileData[]) => void;
  updateProjectStatus: (projectId: string, status: ProjectStatus) => void;
  uploadDelivery: (projectId: string, files: FileData[]) => void;
  addComment: (projectId: string, text: string) => void;
  addProjectUpdate: (projectId: string, text: string, files: FileData[]) => void;
  markPaymentCleared: (projectId: string) => void;
  approvePayment: (projectId: string) => void;
  
  // Simulation
  simulateIncomingProject: () => void;
  simulateIncomingComment: () => void;
  checkUnreadUpdates: () => void;
}

// Mock Data
const MOCK_WORKSPACE_ID = 'ws-123';

const MOCK_USERS: User[] = [
  { id: 'admin-1', name: 'Admin User', email: 'admin@flowspace.com', role: UserRole.ADMIN, workspaceId: MOCK_WORKSPACE_ID, password: 'password' },
  { id: 'c-1', name: 'Alice Client', email: 'client@flowspace.com', role: UserRole.CLIENT, workspaceId: MOCK_WORKSPACE_ID, password: 'password' },
  { id: 'c-2', name: 'Bob Startup', email: 'bob@startup.com', role: UserRole.CLIENT, workspaceId: MOCK_WORKSPACE_ID, password: 'password' }
];

const MOCK_PROJECTS: Project[] = [
  {
    id: 'p-1',
    workspaceId: MOCK_WORKSPACE_ID,
    clientId: 'c-1',
    title: 'Website Redesign',
    description: 'Complete overhaul of the landing page with new branding. We need a modern look that matches our new color palette.',
    amount: 1500,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    deadline: new Date(Date.now() + 86400000 * 1.5).toISOString(), // 1.5 days left
    status: ProjectStatus.IN_PROGRESS,
    paymentStatus: 'unpaid',
    clientFiles: [{ id: 'f-1', name: 'branding.pdf', size: '2MB', type: 'application/pdf', url: '#', uploadedAt: new Date().toISOString() }],
    deliveryFiles: [],
    comments: [
      { id: 'cm-1', userId: 'c-1', userName: 'Alice Client', text: 'Please ensure the mobile view is prioritized.', createdAt: new Date(Date.now() - 86400000).toISOString() },
      { id: 'cm-2', userId: 'admin-1', userName: 'Admin User', text: 'Noted. Working on the wireframes now.', createdAt: new Date(Date.now() - 43200000).toISOString() }
    ],
    updates: []
  },
  {
    id: 'p-2',
    workspaceId: MOCK_WORKSPACE_ID,
    clientId: 'c-2', // Different client
    title: 'Mobile App Icon Set',
    description: 'Vector icons for iOS and Android in 3 sizes. Needs to be delivered by EOD.',
    amount: 500,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    deadline: new Date(Date.now() + 3600000 * 4).toISOString(), // 4 hours left
    status: ProjectStatus.PENDING,
    paymentStatus: 'unpaid',
    clientFiles: [],
    deliveryFiles: [],
    comments: [],
    updates: []
  },
  {
    id: 'p-3',
    workspaceId: MOCK_WORKSPACE_ID,
    clientId: 'c-1',
    title: 'Old Project Archive',
    description: 'An old project that was completed.',
    amount: 2000,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    deadline: new Date(Date.now() - 86400000 * 5).toISOString(),
    status: ProjectStatus.COMPLETED,
    paymentStatus: 'paid',
    paidAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    clientFiles: [], // Files deleted
    deliveryFiles: [], // Files deleted
    comments: [],
    updates: []
  }
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null, // Start logged out
      users: MOCK_USERS,
      theme: 'light',
      workspaces: [
        { id: MOCK_WORKSPACE_ID, name: 'Creative Studio', code: 'CREATIVE', ownerId: 'admin-1' }
      ],
      projects: MOCK_PROJECTS,
      currentPath: '/',
      lastCheckTime: new Date().toISOString(),

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

      navigate: (path) => set({ currentPath: path }),

      login: async (email, password) => {
        // Simulated Login Delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const { users } = get();
        const foundUser = users.find(u => u.email === email && u.password === password);

        if (foundUser) {
          set({ user: foundUser, lastCheckTime: new Date().toISOString() });
          
          // Request notification permission on login
          if ('Notification' in window && Notification.permission !== 'granted') {
             Notification.requestPermission();
          }

          toast.success(`Welcome back, ${foundUser.name}!`);
          return true;
        } else {
          toast.error("Invalid email or password");
          return false;
        }
      },

      registerWorkspace: async (workspaceName, adminName, email, password) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const workspaceId = generateId();
        const newWorkspace: Workspace = {
          id: workspaceId,
          name: workspaceName,
          code: workspaceName.toUpperCase().slice(0, 6),
          ownerId: email,
        };

        const newAdmin: User = {
          id: generateId(),
          name: adminName,
          email,
          password,
          role: UserRole.ADMIN,
          workspaceId
        };

        set((state) => ({
          workspaces: [...state.workspaces, newWorkspace],
          users: [...state.users, newAdmin],
          user: newAdmin
        }));

        toast.success('Workspace created successfully!');
      },

      logout: () => set({ user: null, currentPath: '/' }),

      createUser: (name, email, password, role) => {
        const { user, users } = get();
        if (!user) return;

        // Check for duplicate
        if (users.find(u => u.email === email)) {
          toast.error("User with this email already exists");
          return;
        }

        const newUser: User = {
          id: generateId(),
          name,
          email,
          password,
          role,
          workspaceId: user.workspaceId
        };

        set((state) => ({ users: [...state.users, newUser] }));
        toast.success(`${role === UserRole.CLIENT ? 'Client' : 'Admin'} created successfully!`);
      },

      updateUserProfile: (name, password) => {
        const { user } = get();
        if (!user) return;

        const updatedUser = { ...user, name, ...(password ? { password } : {}) };

        set((state) => ({
            user: updatedUser,
            users: state.users.map(u => u.id === user.id ? updatedUser : u)
        }));
        toast.success('Profile updated successfully');
      },

      addProject: (projectData, files) => {
        const { user } = get();
        if (!user) return;

        const newProject: Project = {
          id: generateId(),
          workspaceId: user.workspaceId,
          clientId: user.id,
          ...projectData,
          status: ProjectStatus.PENDING,
          paymentStatus: 'unpaid',
          createdAt: new Date().toISOString(),
          clientFiles: files,
          deliveryFiles: [],
          comments: [],
          updates: []
        };

        set((state) => ({ projects: [...state.projects, newProject] }));
        toast.success('Project submitted successfully!');
      },

      updateProjectStatus: (projectId, status) => {
        set((state) => ({
          projects: state.projects.map(p => 
            p.id === projectId ? { 
              ...p, 
              status,
              // If completed, delete files for privacy/security as requested
              clientFiles: status === ProjectStatus.COMPLETED ? [] : p.clientFiles,
              deliveryFiles: status === ProjectStatus.COMPLETED ? [] : p.deliveryFiles,
            } : p
          )
        }));
        
        const statusText = status.replace('_', ' ');
        toast.success(`Project marked as ${statusText}`);
        if (status === ProjectStatus.COMPLETED) {
            toast('Files deleted from server.', { icon: '🗑️' });
        }
      },

      uploadDelivery: (projectId, files) => {
        set((state) => ({
          projects: state.projects.map(p => 
            p.id === projectId ? { 
              ...p, 
              status: ProjectStatus.DELIVERED,
              deliveryFiles: [...p.deliveryFiles, ...files] 
            } : p
          )
        }));
        toast.success('Delivery files uploaded & project updated!');
      },

      addComment: (projectId, text) => {
        const { user } = get();
        if (!user) return;

        const newComment: Comment = {
          id: generateId(),
          userId: user.id,
          userName: user.name,
          text,
          createdAt: new Date().toISOString()
        };

        set((state) => ({
          projects: state.projects.map(p => 
            p.id === projectId ? { ...p, comments: [...p.comments, newComment] } : p
          )
        }));
        toast.success('Comment added');
      },

      addProjectUpdate: (projectId, text, files) => {
        const newUpdate: ProjectUpdate = {
            id: generateId(),
            text,
            files,
            createdAt: new Date().toISOString(),
            isRead: false
        };

        set((state) => ({
            projects: state.projects.map(p => 
                p.id === projectId ? { 
                    ...p, 
                    updates: [...(p.updates || []), newUpdate] 
                } : p
            )
        }));
        toast.success('Update sent to Admin successfully');
      },

      markPaymentCleared: (projectId) => {
        set((state) => ({
          projects: state.projects.map(p => 
            p.id === projectId ? { ...p, paymentStatus: 'pending_approval' } : p
          )
        }));
        toast.success('Payment marked as cleared. Waiting for Admin approval.');
      },

      approvePayment: (projectId) => {
        set((state) => ({
          projects: state.projects.map(p => 
            p.id === projectId ? { ...p, paymentStatus: 'paid', paidAt: new Date().toISOString() } : p
          )
        }));
        toast.success('Payment approved! Transaction closed.');
      },

      simulateIncomingProject: () => {
        const { user, projects, navigate } = get();
        // Only simulate if user is admin
        if (!user || user.role !== UserRole.ADMIN) return;

        const titles = ['Emergency Bug Fix', 'SEO Audit', 'Logo Revision', 'Database Migration'];
        const randomTitle = titles[Math.floor(Math.random() * titles.length)];
        const newId = generateId();

        const newProject: Project = {
          id: newId,
          workspaceId: user.workspaceId,
          clientId: 'simulated-client',
          title: randomTitle,
          description: 'This is an urgent request simulated by the system.',
          amount: Math.floor(Math.random() * 2000) + 100,
          createdAt: new Date().toISOString(),
          deadline: new Date(Date.now() + Math.random() * 86400000 * 3).toISOString(),
          status: ProjectStatus.PENDING,
          paymentStatus: 'unpaid',
          clientFiles: [],
          deliveryFiles: [],
          comments: [],
          updates: []
        };

        set({ projects: [...projects, newProject] });
        
        // System Notification
        sendSystemNotification('New Project Received!', randomTitle);

        // In-App Toast
        toast((t) => (
            React.createElement('div', {
                onClick: () => { navigate(`/project/${newId}`); toast.dismiss(t.id); },
                className: "cursor-pointer flex flex-col space-y-1"
            }, [
                React.createElement('span', { key: '1', className: "font-bold flex items-center" }, "🚀 New Project Received!"),
                React.createElement('span', { key: '2', className: "text-sm opacity-90" }, randomTitle),
                React.createElement('span', { key: '3', className: "text-xs bg-black/20 dark:bg-white/20 px-2 py-0.5 rounded w-fit" }, "Click to View")
            ])
        ), {
            duration: 5000,
            style: {
                background: '#3b82f6',
                color: '#fff',
                cursor: 'pointer'
            },
        });
      },

      simulateIncomingComment: () => {
         const { user, projects, navigate } = get();
         if (!user) return;
         
         const myProjects = projects.filter(p => p.workspaceId === user.workspaceId && (user.role === UserRole.ADMIN || p.clientId === user.id));
         if (myProjects.length === 0) return;

         const randomProject = myProjects[Math.floor(Math.random() * myProjects.length)];
         const isUserAdmin = user.role === UserRole.ADMIN;
         
         // Mock message from the "other" side
         const senderName = isUserAdmin ? 'Alice Client' : 'Admin User';
         const msgs = ['Could you check the latest file?', 'Any update on this?', 'Looks good, thanks!', 'Can we extend the deadline?'];
         const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];

         const newComment: Comment = {
             id: generateId(),
             userId: 'simulated-other',
             userName: senderName,
             text: randomMsg,
             createdAt: new Date().toISOString()
         };

         set((state) => ({
             projects: state.projects.map(p => p.id === randomProject.id ? { ...p, comments: [...p.comments, newComment] } : p)
         }));

         // System Notification
         sendSystemNotification(`New Message from ${senderName}`, randomMsg);

         toast((t) => (
            React.createElement('div', {
                onClick: () => { navigate(`/project/${randomProject.id}`); toast.dismiss(t.id); },
                className: "cursor-pointer flex flex-col space-y-1"
            }, [
                React.createElement('span', { key: '1', className: "font-bold flex items-center" }, `💬 ${senderName} commented`),
                React.createElement('span', { key: '2', className: "text-sm opacity-90" }, randomMsg),
                React.createElement('span', { key: '3', className: "text-xs bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded w-fit mt-1" }, "View Conversation")
            ])
         ), {
             duration: 4000,
             icon: null,
             style: {
                 borderLeft: '4px solid #3b82f6'
             }
         });
      },

      checkUnreadUpdates: () => {
        const { projects, user, lastCheckTime, navigate } = get();
        if (!user || user.role !== UserRole.ADMIN) return;

        const now = new Date().toISOString();
        let hasUpdates = false;

        projects.forEach(p => {
             // Find updates created AFTER the last check time
             const newUpdates = p.updates?.filter(u => u.createdAt > (lastCheckTime || '0'));
             
             if (newUpdates && newUpdates.length > 0) {
                 hasUpdates = true;
                 
                 // System Notification
                 sendSystemNotification(`Update on: ${p.title}`, "Client added new info or files.");

                 // Notify for each project that has updates
                 toast((t) => (
                    React.createElement('div', {
                        onClick: () => { navigate(`/project/${p.id}`); toast.dismiss(t.id); },
                        className: "cursor-pointer flex flex-col space-y-1"
                    }, [
                        React.createElement('span', { key: '1', className: "font-bold flex items-center" }, `🔔 Update on: ${p.title}`),
                        React.createElement('span', { key: '2', className: "text-sm opacity-90" }, "Client added info/files"),
                        React.createElement('span', { key: '3', className: "text-xs bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded w-fit mt-1" }, "Click to View")
                    ])
                 ), {
                     icon: '📩',
                     duration: 5000,
                     style: {
                         border: '1px solid #6366f1',
                         padding: '16px',
                         color: '#4f46e5',
                     },
                     className: 'dark:bg-gray-800 dark:text-indigo-300 dark:border-indigo-800'
                 });
             }
        });

        // Update the last check time so we don't notify again for the same update
        if (hasUpdates || true) {
             set({ lastCheckTime: now });
        }
      }
    }),
    {
      name: 'flowspace-storage',
      storage: createJSONStorage(() => localStorage),
      // We only want to persist data, not the current UI navigation state
      partialize: (state) => ({ 
        users: state.users,
        user: state.user,
        projects: state.projects,
        workspaces: state.workspaces,
        theme: state.theme,
        lastCheckTime: state.lastCheckTime
      }),
    }
  )
);