import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { create } from 'zustand';
import { Plus, MoreVertical, Trash2, GripVertical, Calendar, User, Clock, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';

// --- Types ---
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignee: string;
  dueDate: string;
  createdAt: string;
}

interface TaskStore {
  tasks: Task[];
  loadTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

// --- Store ---
export const useTaskStore = create<TaskStore>()((set) => ({
  tasks: [],
  
  loadTasks: async () => {
    try {
      const res = await fetch(apiUrl('/api/tasks'));
      const tasks = await res.json();
      set({ tasks });
    } catch (err) {
      console.error('Failed to load tasks', err);
    }
  },

  addTask: async (task) => {
    const t = { ...task, createdAt: new Date().toISOString() };
    const res = await fetch(apiUrl('/api/tasks'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(t)
    });
    const created = await res.json();
    set((state) => ({ tasks: [...state.tasks, created] }));
  },

  updateTaskStatus: async (id, status) => {
    // Optimistic UI update
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
    }));
    await fetch(apiUrl(`/api/tasks/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  },

  deleteTask: async (id) => {
    // Optimistic UI update
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }));
    await fetch(apiUrl(`/api/tasks/${id}`), { method: 'DELETE' });
  },
}));

// --- Constants ---
const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-500' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-500' },
  { id: 'review', title: 'In Review', color: 'bg-amber-500' },
  { id: 'done', title: 'Done', color: 'bg-emerald-500' },
];

// --- Components ---
export default function ProjectView() {
  const { id: projectId = 'demo-project' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const tasks = useTaskStore((s) => s.tasks);
  const loadTasks = useTaskStore((s) => s.loadTasks);
  const addTask = useTaskStore((s) => s.addTask);
  const updateTaskStatus = useTaskStore((s) => s.updateTaskStatus);
  const deleteTask = useTaskStore((s) => s.deleteTask);

  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Filter tasks for current project
  const projectTasks = useMemo(() => {
    return (tasks ?? []).filter((t) => t.projectId === projectId);
  }, [tasks, projectId]);

  // Handle new task submission
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    await addTask({
      projectId,
      title: newTaskTitle.trim(),
      description: '',
      status: 'todo',
      assignee: newTaskAssignee.trim() || 'Unassigned',
      dueDate: new Date(Date.now() + 86400000 * 7).toISOString(), // Default 1 week
    });

    setNewTaskTitle('');
    setNewTaskAssignee('');
    setIsNewTaskOpen(false);
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = 'move';
    // Transparent drag image for better UI feel
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (draggedTaskId) {
      updateTaskStatus(draggedTaskId, status);
      setDraggedTaskId(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'No Date';
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                Project Dashboard
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium uppercase tracking-wider">
                  Active
                </span>
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Manage tasks and track progress</p>
            </div>
          </div>

          <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Task</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Add a new task to your project board. It will be placed in the "To Do" column.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTask} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="title" className="text-sm font-medium">Task Title</label>
                  <Input
                    id="title"
                    placeholder="e.g., Update database schema"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="assignee" className="text-sm font-medium">Assignee (Optional)</label>
                  <Input
                    id="assignee"
                    placeholder="e.g., John Doe"
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <DialogClose asChild>
                    <Button type="button" variant="ghost">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={!newTaskTitle.trim()}>Create Task</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Board Content */}
      <main className="flex-1 overflow-x-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-background to-secondary/5">
        <div className="flex gap-6 min-w-max max-w-[1600px] mx-auto h-[calc(100vh-8rem)]">
          {COLUMNS.map((column) => {
            const columnTasks = projectTasks.filter((t) => t.status === column.id);
            
            return (
              <div
                key={column.id}
                className="flex flex-col w-[320px] shrink-0 bg-secondary/20 rounded-xl border border-border/50 overflow-hidden"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Column Header */}
                <div className="p-4 flex items-center justify-between border-b border-border/50 bg-secondary/30">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", column.color)} />
                    <h2 className="font-semibold text-sm tracking-tight">{column.title}</h2>
                  </div>
                  <span className="bg-background text-muted-foreground text-xs font-medium px-2 py-1 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Column Tasks */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {columnTasks.length === 0 ? (
                    <div className="h-24 border-2 border-dashed border-border/50 rounded-lg flex items-center justify-center text-sm text-muted-foreground">
                      Drop tasks here
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <Card
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragEnd={handleDragEnd}
                        className={cn(
                          "cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors group relative",
                          draggedTaskId === task.id ? "opacity-50" : "opacity-100"
                        )}
                      >
                        <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                          <CardTitle className="text-sm font-medium leading-snug break-words pr-6">
                            {task.title}
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 absolute top-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTask(task.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <User className="h-3.5 w-3.5" />
                              <span className="truncate max-w-[100px]">{task.assignee || 'Unassigned'}</span>
                            </div>
                            <div className={cn(
                              "flex items-center gap-1 text-xs px-2 py-1 rounded-md",
                              task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'
                                ? "bg-destructive/10 text-destructive font-medium"
                                : "bg-secondary text-muted-foreground"
                            )}>
                              <Calendar className="h-3 w-3" />
                              <span>{task.dueDate ? formatDate(task.dueDate) : 'No Date'}</span>
                            </div>
                          </div>
                          
                          {/* Mobile move buttons */}
                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/40 sm:hidden">
                            <select 
                              className="bg-transparent text-xs text-muted-foreground outline-none w-full"
                              value={task.status}
                              onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                            >
                              {COLUMNS.map(c => (
                                <option key={c.id} value={c.id} className="bg-background">{c.title}</option>
                              ))}
                            </select>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}