"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Bell, Search } from "lucide-react"
import { useSidebar } from "./sidebar-context"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export function MobileHeader() {
  const [searchQuery, setSearchQuery] = useState("")
  
  // Add safety check for useSidebar
  let sidebarContext
  try {
    sidebarContext = useSidebar()
  } catch (error) {
    console.warn('Sidebar context not available:', error)
    return null
  }
  
  const { isMobile, isMobileOpen, toggleMobileSidebar } = sidebarContext

  if (!isMobile) {
    return null
  }

  return (
    <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
      {/* Left side - Menu button */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobileSidebar}
          className="h-9 w-9 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          aria-label="Toggle sidebar"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">J</span>
          </div>
          <span className="font-semibold text-gray-900 text-lg">Jewelia</span>
        </div>
      </div>

      {/* Right side - Search and notifications */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 h-9 w-48 text-sm"
          />
        </div>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-gray-600 hover:text-gray-900 hover:bg-gray-100 relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            3
          </Badge>
        </Button>
      </div>
    </header>
  )
}
