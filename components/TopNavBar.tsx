"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Users2, Briefcase, MessageSquare, Bell, User, Mail, Sun, Moon, Gem, QrCode, ScanLine, Menu, Settings, LogOut, Shield, Crown, Users, Briefcase as BriefcaseIcon, Search, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from '@/components/ui/use-toast';
import { QRShareModal } from '@/components/ui/qr-share-modal';
import { QRScanner } from '@/components/ui/qr-scanner';
import { useSidebar } from '@/components/dashboard/sidebar-context';
import { useAuth } from '@/components/providers/auth-provider';
import { toast } from 'sonner';

const navItems = [
  { label: 'Home', icon: Home, href: '/dashboard', tooltip: 'Home' },
  { label: 'My Network', icon: Users2, href: '/dashboard/my-network', tooltip: 'My Network' },
  { label: 'Messages', icon: MessageSquare, href: '/dashboard/messages', tooltip: 'Messages' },
  { label: 'Tasks', icon: Briefcase, href: '/dashboard/tasks', tooltip: 'Tasks' },
];



// Add mockTasks for badge count (sync with tasks page mock)
const mockTasks = [
  { id: "j1", status: "on-track" },
  { id: "j2", status: "delayed" },
  { id: "j3", status: "on-track" },
  { id: "j4", status: "overdue" },
  { id: "j5", status: "on-track" },
];
const openTasksCount = mockTasks.length;

export function TopNavBar() {
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { toast: toastNotification } = useToast();
  const [qrModal, setQrModal] = useState<'share' | 'scan' | null>(null);
  const { user, userRole, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  // Always call useSidebar hook to maintain hook order consistency
  const sidebarContext = useSidebar();
  const isDashboardPage = pathname.startsWith('/dashboard');
  const isMobile = sidebarContext?.isMobile || false;
  const toggleMobileSidebar = sidebarContext?.toggleMobileSidebar || (() => {});

  // Example notification/message counts
  const notificationCount = 3;
  const [internalMsgCount, setInternalMsgCount] = useState(2);
  const [externalMsgCount, setExternalMsgCount] = useState(1);

  // Example profile data for sharing (replace with real user data)
  const profile = {
    name: user?.user_metadata?.full_name || 'User',
    title: 'Founder & CEO | Multi-Brand Strategist',
    company: 'Jewelia Inc.',
    location: 'New York, NY, USA',
    email: user?.email || 'user@jewelia.com',
    phone: '+1 555-123-4567',
    website: 'https://jewelia.com',
    linkedin: 'LinkedIn Profile',
    avatar: '/portfolio/avatars.jpg',
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Handle search functionality here
      console.log('Searching for:', searchQuery);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  // Handle escape key to close search
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isSearchOpen]);

  // Handle click outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen]);

  // Sync message counts with NewMessageBox
  useEffect(() => {
    const checkMockMessages = () => {
      if (typeof window !== 'undefined') {
        const showMockData = localStorage.getItem('showMockMessages') === 'true'
        if (showMockData) {
          setInternalMsgCount(2)
          setExternalMsgCount(1)
        } else {
          setInternalMsgCount(0)
          setExternalMsgCount(0)
        }
      }
    }

    checkMockMessages()
    
    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'showMockMessages') {
        checkMockMessages()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push('/auth/login');
      toast.success('Successfully signed out');
    } catch (error) {
      toast.error('Failed to sign out');
    } finally {
      setIsSigningOut(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-3 w-3" />
      case "manager":
        return <Shield className="h-3 w-3" />
      case "sales":
        return <Users className="h-3 w-3" />
      case "production":
        return <BriefcaseIcon className="h-3 w-3" />
      default:
        return <User className="h-3 w-3" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "manager":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "sales":
        return "bg-green-100 text-green-800 border-green-200"
      case "production":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getUserInitials = (user: any) => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(" ")
        .map((name: string) => name[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return user?.email?.slice(0, 2).toUpperCase() || "U"
  }

  const isMessagesActive = pathname.startsWith('/dashboard/messages') || pathname.startsWith('/dashboard/internal-messages') || pathname.startsWith('/dashboard/external-messages');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm h-[56px] flex items-center px-4 md:px-8" style={{fontFamily: 'Inter, Arial, sans-serif'}}>
      {/* Left: Hamburger Menu (Mobile) & Logo */}
      <div className="flex items-center gap-4 flex-shrink-0">
        {/* Hamburger Menu for Mobile - only on dashboard pages */}
        {isMobile && isDashboardPage && sidebarContext && (
          <button
            onClick={toggleMobileSidebar}
            className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            aria-label="Toggle sidebar menu"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
        )}
        
        {!isMobile && (
          <Link href="/dashboard" className="flex items-center gap-2 group" aria-label="Jewelia Home">
            <span className="relative inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:from-emerald-500 group-hover:via-green-600 group-hover:to-emerald-700">
              {/* Inner glow effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-60"></div>
              {/* Diamond icon with enhanced styling */}
              <Gem className="h-6 w-6 text-white drop-shadow-lg relative z-10" />
              {/* Subtle sparkle effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </span>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 bg-clip-text text-transparent tracking-tight group-hover:from-emerald-700 group-hover:via-green-700 group-hover:to-emerald-800 transition-all duration-300">Jewelia</span>
          </Link>
        )}
      </div>

      {/* Center: Navigation */}
      <div className={cn(
        "flex-1 flex gap-3 md:gap-4",
        isMobile ? "justify-center ml-2" : "justify-start ml-8"
      )}>
        {navItems.map((item) => {
          const active = pathname === item.href || (item.label === 'Messages' && isMessagesActive);
          // Add badge for Tasks
          const showBadge = item.label === 'Tasks' && openTasksCount > 0;
          const showMessagesBadge = item.label === 'Messages' && (internalMsgCount + externalMsgCount > 0);
          
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex flex-col items-center group relative pt-2 pb-1 rounded-md hover:bg-gray-50 transition-colors",
              isMobile ? "px-2" : "px-3"
            )} tabIndex={0} aria-label={item.tooltip} title={item.tooltip}>
              <item.icon className={cn(
                'mb-1',
                isMobile ? 'h-5 w-5' : 'h-6 w-6',
                active ? 'text-emerald-600' : 'text-gray-600 group-hover:text-emerald-500'
              )} />
              {showBadge && (
                <span className={cn(
                  "absolute bg-emerald-500 text-white text-xs rounded-full px-1.5 py-0.5 text-center border border-white font-medium",
                  isMobile ? "top-1 -right-1 min-w-[16px]" : "top-2 -right-1 min-w-[18px]"
                )}>{openTasksCount}</span>
              )}
              {showMessagesBadge && (
                <span className={cn(
                  "absolute bg-emerald-500 text-white text-xs rounded-full px-1.5 py-0.5 text-center border border-white font-medium",
                  isMobile ? "top-1 -right-1 min-w-[16px]" : "top-2 -right-1 min-w-[18px]"
                )}>{internalMsgCount + externalMsgCount}</span>
              )}
              <span className={cn('text-xs font-medium', active ? 'text-emerald-700' : 'text-gray-600 group-hover:text-emerald-600')}>{item.label}</span>
            </Link>
          );
        })}
        {/* Notifications */}
        <Link href="/dashboard/notifications" className={cn(
          "flex flex-col items-center group relative pt-2 pb-1 rounded-md hover:bg-gray-50 transition-colors",
          isMobile ? "px-2" : "px-3"
        )} tabIndex={0} aria-label="Notifications" title="Notifications">
          <Bell className={cn(
            'mb-1',
            isMobile ? 'h-5 w-5' : 'h-6 w-6',
            pathname === '/dashboard/notifications' ? 'text-emerald-600' : 'text-gray-600 group-hover:text-emerald-500'
          )} />
          {notificationCount > 0 && (
            <span className={cn(
              "absolute bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 text-center border border-white font-medium",
              isMobile ? "top-1 -right-1 min-w-[16px]" : "top-2 -right-1 min-w-[18px]"
            )}>{notificationCount}</span>
          )}
          <span className={cn('text-xs font-medium', pathname === '/dashboard/notifications' ? 'text-emerald-700' : 'text-gray-600 group-hover:text-emerald-600')}>
            {isMobile ? 'Alerts' : 'Notifications'}
          </span>
        </Link>
      </div>

      {/* Right: Search, QR Widget, User */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Search Icon/Input - Hidden on Mobile */}
        {!isMobile && (
          <div className="relative" ref={searchRef}>
            {isSearchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-4 pr-10 py-2 rounded-full border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder-gray-500"
                  autoFocus
                  aria-label="Search"
                />
                <button
                  type="submit"
                  className="absolute right-2 p-1 text-gray-400 hover:text-emerald-600"
                  aria-label="Search"
                >
                  <Search className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="absolute right-8 p-1 text-gray-400 hover:text-gray-600"
                  aria-label="Close search"
                >
                  <X className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-full hover:bg-gray-100 focus:outline-none transition-colors"
                aria-label="Open search"
                title="Search"
              >
                <Search className="h-5 w-5 text-gray-600" />
              </button>
            )}
          </div>
        )}
        {/* QR Widget - Hidden on Mobile */}
        {!isMobile && (
          <button 
            onClick={() => setQrModal('share')}
            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none" 
            aria-label="Share or Scan QR" 
            title="Share or Scan QR"
          >
            <QrCode className="h-5 w-5 text-emerald-600" />
          </button>
        )}

        {/* Enhanced User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 focus:outline-none hover:bg-gray-100 rounded-full p-1" aria-haspopup="true" aria-expanded="false">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email} />
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-green-600 text-white text-sm">
                  {getUserInitials(user)}
                </AvatarFallback>
              </Avatar>
              {!isMobile && (
                <span className="text-sm text-gray-700 font-medium">Me</span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.user_metadata?.full_name || "User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
                {userRole && (
                  <div className="flex items-center space-x-1 mt-1">
                    <Badge variant="outline" className={`text-xs ${getRoleColor(userRole)}`}>
                      {getRoleIcon(userRole)}
                      <span className="ml-1 capitalize">{userRole}</span>
                    </Badge>
                  </div>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* QR Share Modal */}
      <QRShareModal open={qrModal === 'share'} onOpenChange={open => setQrModal(open ? 'share' : null)} profile={profile} />
      {/* QR Scanner Modal */}
      <QRScanner open={qrModal === 'scan'} onOpenChange={open => setQrModal(open ? 'scan' : null)} onContactFound={() => {}} />
    </nav>
  );
}

export default TopNavBar; 