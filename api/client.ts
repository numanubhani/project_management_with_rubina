import { API_BASE_URL } from './config';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        
        // Provide user-friendly error messages for common backend issues
        let errorMessage = errorData.detail || `HTTP error! status: ${response.status}`;
        
        if (response.status === 500) {
          if (errorData.error && errorData.error.includes('no such table')) {
            errorMessage = 'Database tables not initialized. Please contact the backend administrator to run database migrations.';
          } else if (errorData.error) {
            errorMessage = `Server error: ${errorData.error}`;
          } else {
            errorMessage = 'Internal server error. Please try again later or contact support.';
          }
        } else if (response.status === 401) {
          errorMessage = 'Authentication failed. Please check your credentials.';
        } else if (response.status === 403) {
          errorMessage = 'You do not have permission to perform this action.';
        } else if (response.status === 404) {
          errorMessage = 'The requested resource was not found.';
        } else if (response.status === 422) {
          errorMessage = errorData.detail || 'Invalid input. Please check your data and try again.';
        }
        
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async uploadFile<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      
      // Provide user-friendly error messages for common backend issues
      let errorMessage = errorData.detail || `HTTP error! status: ${response.status}`;
      
      if (response.status === 500) {
        if (errorData.error && errorData.error.includes('no such table')) {
          errorMessage = 'Database tables not initialized. Please contact the backend administrator to run database migrations.';
        } else if (errorData.error) {
          errorMessage = `Server error: ${errorData.error}`;
        } else {
          errorMessage = 'Internal server error. Please try again later or contact support.';
        }
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

