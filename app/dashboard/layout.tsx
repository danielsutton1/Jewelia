import type { Metadata } from "next"
import type { ReactNode } from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardClientWrapper } from "@/components/dashboard/dashboard-client-wrapper"
import { MobileHeader } from "@/components/dashboard/mobile-header"
import { SidebarProvider } from "@/components/dashboard/sidebar-context"

export const metadata: Metadata = {
  title: "Dashboard | Jewelia CRM",
  description: "Jewelia CRM Dashboard",
}

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <DashboardClientWrapper>
      <SidebarProvider>
        <div className="min-h-screen bg-gray-100">
          {/* Mobile Header */}
          <MobileHeader />
          
          <div className="flex h-screen lg:h-[calc(100vh-4rem)]">
            <DashboardSidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <main className="flex-1 overflow-y-auto">
                <div className="w-full p-1 sm:p-2 lg:p-4">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </DashboardClientWrapper>
  )
}
