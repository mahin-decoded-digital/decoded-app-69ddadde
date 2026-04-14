import { create } from 'zustand';
import { apiUrl } from '@/lib/api';

export type Role = 'admin' | 'manager' | 'developer';
export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed';
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type ThemeMode = 'light' | 'dark';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  deadline: string;
  status: ProjectStatus;
  memberIds: string[];
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assigneeId: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  name: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface AppState {
  // State
  users: User[];
  projects: Project[];
  tasks: Task[];
  files: ProjectFile[];
  currentUser: User | null;
  theme: ThemeMode;

  // Init
  fetchAll: () => Promise<void>;

  // Auth Actions
  login: (email: string) => Promise<void>;
  logout: () => void;

  // Theme Actions
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;

  // User Actions
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  // Project Actions
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // File Actions
  addFile: (file: Omit<ProjectFile, 'id' | 'uploadedAt'>) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
}

export const useAppStore = create<AppState>()((set, get) => ({
  users: [],
  projects: [],
  tasks: [],
  files: [],
  currentUser: null,
  theme: 'light',

  fetchAll: async () => {
    try {
      const [users, projects, tasks, files] = await Promise.all([
        fetch(apiUrl('/api/users')).then(r => r.json()),
        fetch(apiUrl('/api/projects')).then(r => r.json()),
        fetch(apiUrl('/api/tasks')).then(r => r.json()),
        fetch(apiUrl('/api/files')).then(r => r.json()),
      ]);
      set({ users, projects, tasks, files });
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  },

  login: async (email: string) => {
    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.user) {
        set({ currentUser: data.user });
      }
    } catch (err) {
      console.error('Login failed', err);
    }
  },

  logout: () => set({ currentUser: null }),

  setTheme: (theme) => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
    set({ theme });
  },

  toggleTheme: () => {
    const state = get();
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    }
    set({ theme: nextTheme });
  },

  addUser: async (user) => {
    const res = await fetch(apiUrl('/api/users'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    const created = await res.json();
    set(s => ({ users: [...s.users, created] }));
  },

  updateUser: async (id, updates) => {
    const res = await fetch(apiUrl(`/api/users/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const updated = await res.json();
    set(s => ({
      users: s.users.map(u => u.id === id ? updated : u),
      currentUser: s.currentUser?.id === id ? { ...s.currentUser, ...updated } : s.currentUser
    }));
  },

  deleteUser: async (id) => {
    await fetch(apiUrl(`/api/users/${id}`), { method: 'DELETE' });
    set(s => ({
      users: s.users.filter(u => u.id !== id),
      tasks: s.tasks.map(t => t.assigneeId === id ? { ...t, assigneeId: null } : t),
      projects: s.projects.map(p => ({
        ...p,
        memberIds: p.memberIds.filter(mid => mid !== id)
      }))
    }));
  },

  addProject: async (project) => {
    const p = { ...project, createdAt: new Date().toISOString() };
    const res = await fetch(apiUrl('/api/projects'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p)
    });
    const created = await res.json();
    set(s => ({ projects: [...s.projects, created] }));
  },

  updateProject: async (id, updates) => {
    const res = await fetch(apiUrl(`/api/projects/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const updated = await res.json();
    set(s => ({
      projects: s.projects.map(p => p.id === id ? updated : p)
    }));
  },

  deleteProject: async (id) => {
    await fetch(apiUrl(`/api/projects/${id}`), { method: 'DELETE' });
    set(s => ({
      projects: s.projects.filter(p => p.id !== id),
      tasks: s.tasks.filter(t => t.projectId !== id),
      files: s.files.filter(f => f.projectId !== id)
    }));
  },

  addTask: async (task) => {
    const t = { ...task, createdAt: new Date().toISOString() };
    const res = await fetch(apiUrl('/api/tasks'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(t)
    });
    const created = await res.json();
    set(s => ({ tasks: [...s.tasks, created] }));
  },

  updateTask: async (id, updates) => {
    const res = await fetch(apiUrl(`/api/tasks/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const updated = await res.json();
    set(s => ({
      tasks: s.tasks.map(t => t.id === id ? updated : t)
    }));
  },

  deleteTask: async (id) => {
    await fetch(apiUrl(`/api/tasks/${id}`), { method: 'DELETE' });
    set(s => ({
      tasks: s.tasks.filter(t => t.id !== id)
    }));
  },

  addFile: async (file) => {
    const f = { ...file, uploadedAt: new Date().toISOString() };
    const res = await fetch(apiUrl('/api/files'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(f)
    });
    const created = await res.json();
    set(s => ({ files: [...s.files, created] }));
  },

  deleteFile: async (id) => {
    await fetch(apiUrl(`/api/files/${id}`), { method: 'DELETE' });
    set(s => ({
      files: s.files.filter(f => f.id !== id)
    }));
  }
}));