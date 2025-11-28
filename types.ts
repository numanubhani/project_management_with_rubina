
export enum UserRole {
  ADMIN = 'admin',
  CLIENT = 'client',
}

export enum ProjectStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
}

export type PaymentStatus = 'unpaid' | 'pending_approval' | 'paid';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  workspaceId: string;
  password?: string; // For simulation only
}

export interface Workspace {
  id: string;
  name: string;
  code: string; // Used for joining
  ownerId: string;
}

export interface FileData {
  id: string;
  name: string;
  url: string;
  type: string;
  size: string;
  uploadedAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface ProjectUpdate {
  id: string;
  text: string;
  files: FileData[];
  createdAt: string;
  isRead: boolean;
}

export interface Project {
  id: string;
  workspaceId: string;
  clientId: string;
  title: string;
  description: string;
  amount: number;
  createdAt: string;
  deadline: string; // ISO string
  status: ProjectStatus;
  paymentStatus: PaymentStatus;
  paidAt?: string;
  clientFiles: FileData[];
  deliveryFiles: FileData[];
  comments: Comment[];
  updates: ProjectUpdate[];
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
