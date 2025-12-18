/**
 * API Configuration
 * Centralized configuration for backend API endpoints
 */

// Backend API Base URL
// For local development, your Django backend typically runs on http://localhost:8000
// You can override this by defining VITE_API_URL in a .env file at the project root.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000';

// API Documentation URLs
export const API_DOCS = {
  SWAGGER: 'https://project-management-with-rubina-backend.onrender.com/docs',
  REDOC: 'https://project-management-with-rubina-backend.onrender.com/redoc',
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
  },
  // Users
  USERS: {
    BASE: '/api/users/',
    ME: '/api/users/me',
  },
  // Workspaces
  WORKSPACES: {
    ME: '/api/workspaces/me',
    STATS: '/api/workspaces/me/stats',
    EXPORT: '/api/workspaces/me/export',
    IMPORT: '/api/workspaces/me/import',
  },
  // Projects
  PROJECTS: {
    BASE: '/api/projects/',
    DASHBOARD_STATS: '/api/projects/dashboard/stats',
    UPDATES_UNREAD: '/api/projects/updates/unread',
    BY_ID: (id: string) => `/api/projects/${id}`,
    STATUS: (id: string) => `/api/projects/${id}/status`,
    DELIVERY: (id: string) => `/api/projects/${id}/delivery`,
    COMMENTS: (id: string) => `/api/projects/${id}/comments`,
    UPDATES: (id: string) => `/api/projects/${id}/updates`,
    UPDATES_UNREAD_BY_PROJECT: (id: string) => `/api/projects/${id}/updates/unread`,
    PAYMENT_CLEAR: (id: string) => `/api/projects/${id}/payment/clear`,
    PAYMENT_APPROVE: (id: string) => `/api/projects/${id}/payment/approve`,
  },
  // Finance
  FINANCE: {
    HISTORY: '/api/finance/history',
    STATS: '/api/finance/stats',
  },
  // Files
  FILES: {
    BY_PROJECT: (projectId: string, category: string, filename: string) => 
      `/api/files/${projectId}/${category}/${filename}`,
  },
};

