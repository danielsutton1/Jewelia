import type { Metadata } from "next"
import type { ReactNode } from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"

export const metadata: Metadata = {
  title: "Settings | Jewelia CRM",
  description: "Jewelia CRM Settings",
}

interface SettingsLayoutProps {
  children: ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
} 