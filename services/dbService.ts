import { User, Project, Notification } from '../types';

const API_BASE = '/api';

const SESSION_KEY = 'crowdfundx_session';
const TOKEN_KEY = 'crowdfundx_token';

const getHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const dbService = {
  // Session persistence
  saveSession: (user: User, token?: string) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email: user.email, id: user.id }));
    if (token) localStorage.setItem(TOKEN_KEY, token);
  },

  getSession: (): { email: string; id: string } | null => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  },

  getToken: () => localStorage.getItem(TOKEN_KEY),

  clearSession: () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },

  // MongoDB User methods via Backend
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: getHeaders()
      });
      if (response.ok) return await response.json();
    } catch (error) {
      console.error('Failed to fetch current user:', error);
    }
    return null;
  },

  getUser: async (email?: string): Promise<User | null> => {
    if (email) {
      try {
        const response = await fetch(`${API_BASE}/user/${email}`);
        if (response.ok) return await response.json();
      } catch (error) {
        console.error('Failed to fetch user from MongoDB:', error);
      }
    }
    return null;
  },

  saveUser: async (user: User) => {
    try {
      await fetch(`${API_BASE}/user`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(user),
      });
    } catch (error) {
      console.error('Failed to sync user to MongoDB:', error);
    }
  },

  sendNotification: async (targetUserId: string, notification: Notification) => {
    try {
      await fetch(`${API_BASE}/notifications`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ targetUserId, notification }),
      });
    } catch (error) {
      console.error('Failed to send notification to MongoDB:', error);
    }
  },

  clearUser: () => {
    localStorage.removeItem('trustfund_user');
    dbService.clearSession();
  },

  // Projects logic via Backend (MongoDB only, no localStorage)
  getProjects: async (initial: Project[]): Promise<Project[]> => {
    try {
      const response = await fetch(`${API_BASE}/projects`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      return data.length > 0 ? data : initial;
    } catch (error) {
      console.error('Failed to fetch projects from MongoDB:', error);
      return initial;
    }
  },

  saveProjects: async (projects: Project[]) => {
    try {
      await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(projects),
      });
    } catch (error) {
      console.error('Failed to sync projects to MongoDB:', error);
    }
  },

  updateProject: async (projectId: string, updates: Partial<Project>) => {
    try {
      await fetch(`${API_BASE}/projects/${projectId}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error('Failed to update project in MongoDB:', error);
    }
  },

  deleteProject: async (projectId: string) => {
    try {
      await fetch(`${API_BASE}/projects/${projectId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
    } catch (error) {
      console.error('Failed to delete project in MongoDB:', error);
    }
  }
};
