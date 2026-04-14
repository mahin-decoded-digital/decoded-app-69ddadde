import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {LayoutDashboard, CheckCircle, Users, FileText, Settings, LogOut, Folder, Plus} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';

const MAIN_NAV = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'My Tasks', href: '/tasks', icon: CheckCircle },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Files', href: '/files', icon: FileText },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const projects = useAppStore((state) => state.projects);
  const logout = useAppStore((state) => state.logout);
  const currentUser = useAppStore((state) => state.currentUser);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentUser) return null;

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Logo & Brand */}
      <div className="flex h-16 shrink-0 items-center gap-3 px-6 border-b border-border">
        <img 
          src="https://decoded-studios-storage.s3.ap-southeast-2.amazonaws.com/documents/69d61ef26e523b47e7fc12f5/images-1-e29e3ee1.jpg" 
          alt="TeamSync Logo" 
          className="h-8 w-8 rounded-md object-cover"
        />
        <span className="text-lg font-semibold tracking-tight text-foreground">
          TeamSync
        </span>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Main Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          <div className="mb-2 px-3 text-xs font-semibold tracking-wider text-muted-foreground">
            OVERVIEW
          </div>
          {MAIN_NAV.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-4 w-4 shrink-0',
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-accent-foreground'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}

          {/* Projects Navigation */}
          <div className="mt-8 flex items-center justify-between px-3 mb-2">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground">
              PROJECTS
            </span>
            <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground" asChild>
              <Link to="/projects/new">
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add Project</span>
              </Link>
            </Button>
          </div>
          <div className="space-y-1">
            {projects.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground italic">No projects yet.</p>
            ) : (
              projects.map((project) => {
                const isProjectActive = location.pathname.includes(`/projects/${project.id}`);
                return (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className={cn(
                      'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isProjectActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Folder
                      className={cn(
                        'mr-3 h-4 w-4 shrink-0',
                        isProjectActive ? 'text-primary' : 'text-muted-foreground group-hover:text-accent-foreground'
                      )}
                      aria-hidden="true"
                    />
                    <span className="truncate">{project.name}</span>
                  </Link>
                );
              })
            )}
          </div>
        </nav>
      </div>

      {/* Footer / User section */}
      <div className="mt-auto border-t border-border p-4 space-y-1">
        <Link
          to="/settings"
          className={cn(
            'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
            location.pathname === '/settings'
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <Settings className="mr-3 h-4 w-4 shrink-0" />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="mr-3 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-destructive" />
          Log out
        </button>
      </div>
    </aside>
  );
}