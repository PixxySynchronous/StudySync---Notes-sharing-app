// Resolve and normalize API base URL
// Logic:
// 1. Take VITE_API_BASE_URL if provided.
// 2. In dev, fallback to localhost.
// 3. In production, throw if missing (avoid silently calling localhost from a deployed frontend).
// 4. Ensure the final base ends with '/api' exactly once.
const rawEnvBase: string | undefined = (import.meta as any).env?.VITE_API_BASE_URL?.trim();
function buildApiBase(): string {
  let base = rawEnvBase && rawEnvBase.replace(/\/$/, ''); // remove trailing slash
  if (!base) {
    if (import.meta.env.DEV) {
      base = 'http://localhost:5001/api';
      // Helpful hint in dev if someone forgot to set env
      // eslint-disable-next-line no-console
      console.warn('[api] Using localhost fallback API base URL');
    } else {
      throw new Error('VITE_API_BASE_URL is not defined in production build. Set it to your backend URL (include protocol).');
    }
  }
  if (!/\/api$/.test(base)) {
    base = base.replace(/\/$/, '') + '/api';
  }
  return base;
}
const API_BASE_URL = buildApiBase();

// API client with automatic token handling
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  }

  async register(name: string, email: string, password: string) {
    return await this.request<{ message: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  async logout() {
    localStorage.removeItem('authToken');
  }

  // User methods
  async getProfile() {
    return await this.request<any>('/users/profile');
  }

  async updateProfile(name: string, email: string) {
    return await this.request<any>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, email }),
    });
  }

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const token = localStorage.getItem('authToken');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}/users/avatar`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Avatar upload failed');
    }

    return await response.json();
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return await this.request<{ message: string }>('/users/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Notes methods
  async getNotes() {
    return await this.request<any[]>('/notes');
  }

  async createNote(title: string, content: string, tags: string[]) {
    return await this.request<any>('/notes', {
      method: 'POST',
      body: JSON.stringify({ title, content, tags }),
    });
  }

  async updateNote(noteId: string, title: string, content: string, tags: string[]) {
    return await this.request<any>(`/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify({ title, content, tags }),
    });
  }

  async deleteNote(noteId: string) {
    return await this.request<{ message: string }>(`/notes/${noteId}`, {
      method: 'DELETE',
    });
  }

  async searchNotes(query: string) {
    return await this.request<any[]>(`/notes/search?query=${encodeURIComponent(query)}`);
  }

  async getNote(noteId: string) {
    return await this.request<any>(`/notes/${noteId}`);
  }

  // Sharing methods
  async shareNote(noteId: string, sharedWithEmail: string, permission: 'read' | 'edit' = 'read') {
    return await this.request<any>('/shared/share', {
      method: 'POST',
      body: JSON.stringify({ noteId, sharedWithEmail, permission }),
    });
  }

  async getSharedNotes() {
    return await this.request<any[]>('/shared/notes');
  }

  async getNotesSharedByMe() {
    return await this.request<any[]>('/shared/by-me');
  }

  async updateSharePermission(shareId: string, permission: 'read' | 'edit') {
    return await this.request<{ message: string }>(`/shared/${shareId}/permission`, {
      method: 'PUT',
      body: JSON.stringify({ permission }),
    });
  }

  async removeShare(shareId: string) {
    return await this.request<{ message: string }>(`/shared/${shareId}`, {
      method: 'DELETE',
    });
  }

  // Dashboard methods
  async getDashboardStats() {
    return await this.request<any>('/dashboard/stats');
  }

  async getUserActivity() {
    return await this.request<any>('/dashboard/activity');
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  async testConnection() {
    try {
      const response = await fetch(this.baseURL.replace('/api', ''));
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
