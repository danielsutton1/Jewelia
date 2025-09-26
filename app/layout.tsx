'use client'

import './globals.css';
import { DemoProvider } from '@/lib/demo-context';
import TopNavBar from '@/components/TopNavBar';
import BottomStatusBar from '@/components/BottomStatusBar';
import { SidebarProvider } from '@/components/dashboard/sidebar-context';
import { AuthProvider } from '@/components/providers/auth-provider';
import { usePathname } from 'next/navigation';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check if current page is an auth page
  const isAuthPage = pathname?.startsWith('/auth/') || pathname === '/login' || pathname === '/register';
  
  return (
    <AuthProvider>
      <DemoProvider>
        <SidebarProvider>
          {!isAuthPage && <TopNavBar />}
          <main className={`min-h-screen bg-gray-50 ${!isAuthPage ? 'pt-14 pb-12' : ''}`}>
            {children}
          </main>
          {!isAuthPage && <BottomStatusBar />}
        </SidebarProvider>
      </DemoProvider>
    </AuthProvider>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LayoutContent>
          {children}
        </LayoutContent>
      </body>
    </html>
  );
}
// FORCE DEPLOYMENT REFRESH - Thu Aug 21 15:56:03 EDT 2025
// FORCE DEPLOYMENT - Thu Aug 21 18:52:47 EDT 2025 - All Supabase .or() method errors fixed
