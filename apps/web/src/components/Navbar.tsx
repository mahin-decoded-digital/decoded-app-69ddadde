import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Bell, Search, Plus, User, Settings, LogOut, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

const navLinks = [
  { name: 'Dashboard', href: '/' },
  { name: 'Projects', href: '/projects' },
  { name: 'Tasks', href: '/tasks' },
  { name: 'Team', href: '/team' },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const currentUser = useAppStore((state) => state.currentUser);
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden"
          onClick={toggleMobileMenu}
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        <div className="mr-6 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
            <img
              src="https://decoded-studios-storage.s3.ap-southeast-2.amazonaws.com/documents/69d61ef26e523b47e7fc12f5/images-1-e29e3ee1.jpg"
              alt="TeamSync Logo"
              className="h-8 w-auto rounded-md object-contain"
            />
            <span className="hidden bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-lg font-bold tracking-tight text-transparent sm:inline-block">
              TeamSync
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={cn(
                'rounded-md px-4 py-2 transition-colors hover:text-foreground/80',
                location.pathname === link.href ? 'bg-accent text-accent-foreground' : 'text-foreground/60'
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2 md:gap-4">
          <div className="relative hidden w-full max-w-sm items-center lg:flex">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search projects, tasks..."
              className="w-full border-none bg-muted/50 pl-9 transition-all focus-visible:bg-background focus-visible:ring-1"
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground transition-colors hover:text-foreground"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <Button variant="default" size="sm" className="hidden h-9 gap-1.5 bg-indigo-600 text-white hover:bg-indigo-700 sm:flex">
            <Plus className="h-4 w-4" />
            <span>New</span>
          </Button>

          <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
            <span className="sr-only">Notifications</span>
          </Button>

          <div className="relative">
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full"
              onClick={toggleUserMenu}
            >
              <Avatar className="h-9 w-9 border border-border">
                <AvatarImage src={currentUser?.avatarUrl} alt={currentUser?.name ?? '@user'} />
                <AvatarFallback className="bg-indigo-900 text-indigo-200">
                  {currentUser?.name
                    ?.split(' ')
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase() ?? 'TS'}
                </AvatarFallback>
              </Avatar>
            </Button>

            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div className="animate-in fade-in zoom-in-95 absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md border border-border bg-popover p-1 shadow-md">
                  <div className="px-2 py-1.5 text-sm">
                    <div className="font-medium">{currentUser?.name ?? 'Guest User'}</div>
                    <div className="text-xs text-muted-foreground">{currentUser?.email ?? 'guest@teamsync.io'}</div>
                  </div>
                  <div className="my-1 h-px bg-border" />
                  <button
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                    onClick={() => {
                      toggleTheme();
                      setIsUserMenuOpen(false);
                    }}
                  >
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                  </button>
                  <Link
                    to="/profile"
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <div className="my-1 h-px bg-border" />
                  <button
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-border/40 bg-background/95 backdrop-blur md:hidden">
          <div className="space-y-1 p-4 pb-6">
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full bg-muted/50 pl-9"
              />
            </div>
            <Button
              variant="outline"
              className="mb-3 w-full justify-start gap-2"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            </Button>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  'block rounded-md px-3 py-2 text-base font-medium transition-colors',
                  location.pathname === link.href
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="mt-4 border-t border-border pt-4">
              <Button className="w-full justify-start gap-2 bg-indigo-600 text-white hover:bg-indigo-700">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}