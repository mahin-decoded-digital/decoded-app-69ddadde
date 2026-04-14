export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed';

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';

export type UserRole = 'admin' | 'manager' | 'member';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeId?: string;
  dueDate?: string;
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  deadline?: string;
  ownerId: string;
  teamMemberIds: string[];
  createdAt: string;
  updatedAt: string;
}