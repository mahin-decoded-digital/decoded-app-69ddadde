import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';

// Layout Components
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

// Pages
import Dashboard from '@/pages/Dashboard';
import ProjectView from '@/pages/ProjectView';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

function Login() {
  const login = useAppStore((s) => s.login);
  const [email, setEmail] = useState('admin@teamsync.com');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(email);
    setLoading(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Subtle modern background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 z-0" />
      
      <Card className="w-full max-w-md relative z-10 border-border/50 shadow-2xl backdrop-blur-sm bg-card/95">
        <CardHeader className="space-y-3 text-center pt-8">
          <div className="flex justify-center mb-2">
            <img
              src="https://decoded-studios-storage.s3.ap-southeast-2.amazonaws.com/documents/69d61ef26e523b47e7fc12f5/images-1-e29e3ee1.jpg"
              alt="TeamSync Logo"
              className="h-16 w-auto object-contain rounded-xl shadow-md"
            />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
          <CardDescription>Enter your email to sign in to TeamSync</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="name@teamsync.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background/50 focus-visible:ring-primary/50"
              />
            </div>
            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p>Demo Accounts:</p>
              <p>admin@teamsync.com (Admin) • sarah@teamsync.com (Manager) • marcus@teamsync.com (Dev)</p>
            </div>
          </CardContent>
          <CardFooter className="pb-8">
            <Button type="submit" disabled={loading} className="w-full shadow-lg hover:shadow-primary/25 transition-all duration-300">
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <Navbar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 scroll-smooth">
          <div className="mx-auto max-w-7xl h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const currentUser = useAppStore((s) => s.currentUser);
  const fetchAll = useAppStore((s) => s.fetchAll);

  useEffect(() => {
    if (currentUser) {
      fetchAll();
    }
  }, [currentUser, fetchAll]);

  if (!currentUser) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects/:id" element={<ProjectView />} />
        {/* Catch-all route to redirect back to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
}