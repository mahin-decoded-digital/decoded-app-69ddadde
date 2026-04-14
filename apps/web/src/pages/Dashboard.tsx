import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Briefcase, 
  CheckCircle, 
  Clock, 
  Calendar, 
  ArrowRight,
  Activity,
  ListTodo,
  MoreHorizontal
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const currentUser = useAppStore((s) => s.currentUser);
  const projects = useAppStore((s) => s.projects);
  const tasks = useAppStore((s) => s.tasks);
  const users = useAppStore((s) => s.users);

  // Derived Data: Filter projects relevant to the current user (unless admin)
  const relevantProjects = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return projects;
    return projects.filter((p) => p.memberIds.includes(currentUser.id));
  }, [projects, currentUser]);

  // Derived Data: Stats
  const stats = useMemo(() => {
    const activeProjects = relevantProjects.filter((p) => p.status === 'active').length;
    
    const myTasks = tasks.filter((t) => t.assigneeId === currentUser?.id);
    const completedTasks = myTasks.filter((t) => t.status === 'done').length;
    const pendingTasks = myTasks.filter((t) => t.status !== 'done').length;

    return {
      totalProjects: relevantProjects.length,
      activeProjects,
      completedTasks,
      pendingTasks,
      myTasks
    };
  }, [relevantProjects, tasks, currentUser]);

  // Derived Data: Enriched projects with progress and user objects
  const projectSummaries = useMemo(() => {
    return relevantProjects.map((project) => {
      const projectTasks = tasks.filter((t) => t.projectId === project.id);
      const doneTasks = projectTasks.filter((t) => t.status === 'done').length;
      const progress = projectTasks.length === 0 ? 0 : Math.round((doneTasks / projectTasks.length) * 100);
      
      const teamMembers = (project.memberIds ?? [])
        .map((id) => users.find((u) => u.id === id))
        .filter((u): u is NonNullable<typeof u> => u !== undefined);

      return {
        ...project,
        progress,
        taskCount: projectTasks.length,
        doneTaskCount: doneTasks,
        teamMembers,
      };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [relevantProjects, tasks, users]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'planning': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'on-hold': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'completed': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome back, {currentUser?.name?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your projects today.
            </p>
          </div>
          <Button onClick={() => navigate('/projects/new')} className="w-full md:w-auto">
            <Briefcase className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
              <Briefcase className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
              <Activity className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeProjects}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">My Pending Tasks</CardTitle>
              <ListTodo className="w-4 h-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingTasks}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed Tasks</CardTitle>
              <CheckCircle className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedTasks}</div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Project Summaries</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/projects')} className="text-muted-foreground hover:text-primary">
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {projectSummaries.length === 0 ? (
            <Card className="border-dashed border-2 bg-transparent">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No projects found</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  You aren't assigned to any projects yet. Create a new project to get started.
                </p>
                <Button onClick={() => navigate('/projects/new')} className="mt-4" variant="outline">
                  Create Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {projectSummaries.slice(0, 6).map((project) => (
                <Card key={project.id} className="flex flex-col bg-card hover:border-primary/50 transition-colors duration-200">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <CardTitle className="text-lg line-clamp-1" title={project.name}>
                          {project.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                          {project.description}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className={`capitalize shrink-0 ${getStatusColor(project.status)}`}>
                        {project.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-4 flex-1">
                    <div className="space-y-4">
                      {/* Deadline */}
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        Deadline: <span className="ml-1 font-medium text-foreground">{formatDate(project.deadline)}</span>
                      </div>
                      
                      {/* Progress */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {project.doneTaskCount} of {project.taskCount} tasks completed
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  
                  <div className="px-6 pb-4 pt-0 mt-auto border-t border-border/50 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2 overflow-hidden">
                        {(project.teamMembers ?? []).slice(0, 4).map((member) => (
                          <Avatar key={member.id} className="w-8 h-8 border-2 border-background" title={member.name}>
                            <AvatarImage src={member.avatarUrl} alt={member.name} />
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {(project.teamMembers?.length ?? 0) > 4 && (
                          <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium z-10">
                            +{(project.teamMembers?.length ?? 0) - 4}
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tasks (Bottom Section) */}
        {stats.myTasks.length > 0 && (
          <div className="space-y-4 pt-4">
            <h2 className="text-xl font-semibold tracking-tight">My Recent Tasks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.myTasks.slice(0, 3).map((task) => (
                <Card key={task.id} className="p-4 flex flex-col gap-3 border-l-4 border-l-primary hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-sm line-clamp-1" title={task.title}>{task.title}</h4>
                    <Badge variant="secondary" className="text-[10px] capitalize shrink-0 ml-2">
                      {task.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground gap-4">
                    {task.dueDate && (
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(task.dueDate)}
                      </span>
                    )}
                    <span className="flex items-center capitalize">
                      <span className={`w-2 h-2 rounded-full mr-1 ${
                        task.priority === 'high' ? 'bg-destructive' : 
                        task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                      }`} />
                      {task.priority}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}