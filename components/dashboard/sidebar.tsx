"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  Calendar,
  CreditCard,
  Inbox,
  LayoutDashboard,
  Package,
  QrCode,
  Settings,
  ShoppingCart,
  Users,
  Users2,
  User,
  Warehouse,
  Hammer,
  Clock,
  CheckSquare,
  Boxes,
  CalendarRange,
  LineChart,
  Wrench,
  Layers,
  FileImage,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  MessageSquare,
  TrendingUp,
  Gem,
  Tag,
  RefreshCw,
  Plus,
  ConciergeBell,
  ArrowRightLeft,
  ClipboardList,
  Truck,
  Menu,
  X,
  Zap,
  DollarSign,
  Smartphone,
  LinkIcon,
  Mail,
  Shield,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSidebar } from "./sidebar-context"
import { SidebarItem } from "./sidebar-item"

interface SidebarItem {
  label: string
  icon: LucideIcon
  href: string
  match: (path: string) => boolean
}

interface SidebarCategory {
  key: string
  icon: LucideIcon
  label: string
  items: SidebarItem[]
}

const SIDEBAR_KEY = "sidebar_expanded_categories_v1"

const sidebarStructure: SidebarCategory[] = [
  {
    key: "customers",
    icon: Users,
    label: "CUSTOMERS & SALES",
    items: [
      { label: "Customers", icon: Users, href: "/dashboard/customers", match: (p: string) => p === "/dashboard/customers" },
      { label: "Orders", icon: ShoppingCart, href: "/dashboard/orders", match: (p: string) => p.startsWith("/dashboard/orders") && p !== "/dashboard/orders/create" },
      { label: "Products", icon: Package, href: "/dashboard/products", match: (p: string) => p === "/dashboard/products" },
      { label: "Trade-In", icon: RefreshCw, href: "/dashboard/trade-ins", match: (p: string) => p.startsWith("/dashboard/trade-ins") },
      { label: "Sales Dashboard", icon: ClipboardList, href: "/dashboard/sales-dashboard", match: (p: string) => p.startsWith("/dashboard/sales-dashboard") },
    ],
  },
  {
    key: "inventory",
    icon: Warehouse,
    label: "INVENTORY",
    items: [
      { label: "Inventory Management", icon: Gem, href: "/dashboard/inventory-management", match: (p: string) => p === "/dashboard/inventory-management" },
      { label: "Asset Tracking", icon: QrCode, href: "/dashboard/inventory/asset-tracking", match: (p: string) => p === "/dashboard/inventory/asset-tracking" },
      { label: "Assign Inventory", icon: Plus, href: "/dashboard/inventory/asset-tracking/assign", match: (p: string) => p === "/dashboard/inventory/asset-tracking/assign" },
      { label: "Check-In / Check-Out", icon: ArrowRightLeft, href: "/dashboard/inventory/check-in-out", match: (p: string) => p === "/dashboard/inventory/check-in-out" },
      { label: "Scanner", icon: QrCode, href: "/dashboard/scanner", match: (p: string) => p === "/dashboard/scanner" },
    ],
  },
  {
    key: "production",
    icon: Hammer,
    label: "PRODUCTION",
    items: [
      { label: "Production Dashboard", icon: BarChart3, href: "/dashboard/production/kanban", match: (p: string) => p === "/dashboard/production/kanban" },
      { label: "Batches", icon: Layers, href: "/dashboard/production/batches", match: (p: string) => p === "/dashboard/production/batches" },
      { label: "Schedule", icon: CalendarRange, href: "/dashboard/production/schedule", match: (p: string) => p === "/dashboard/production/schedule" },
      { label: "CAD Files", icon: FileImage, href: "/dashboard/cad", match: (p: string) => p === "/dashboard/cad" },
      { label: "Materials", icon: Boxes, href: "/dashboard/production/materials", match: (p: string) => p === "/dashboard/production/materials" },
      { label: "Equipment", icon: Wrench, href: "/dashboard/equipment", match: (p: string) => p === "/dashboard/equipment" },
      { label: "Time Tracking", icon: Clock, href: "/dashboard/production/time-tracking", match: (p: string) => p === "/dashboard/production/time-tracking" },
      { label: "Quality Control", icon: CheckSquare, href: "/dashboard/production/quality-control", match: (p: string) => p === "/dashboard/production/quality-control" },
    ],
  },
  {
    key: "logistics",
    icon: Truck,
    label: "LOGISTICS",
    items: [
      { label: "Logistics Dashboard", icon: BarChart3, href: "/dashboard/logistics", match: (p: string) => p.startsWith("/dashboard/logistics") },
    ],
  },
  {
    key: "marketplace",
    icon: ShoppingCart,
    label: "MARKETPLACE",
    items: [
      { label: "Marketplace Overview", icon: ShoppingCart, href: "/dashboard/marketplace", match: (p: string) => p === "/dashboard/marketplace" },
      { label: "My Shared Inventory", icon: Package, href: "/dashboard/inventory-sharing", match: (p: string) => p.startsWith("/dashboard/inventory-sharing") && !p.includes("/shared-inventory") },
      { label: "Browse Network Inventory", icon: Gem, href: "/dashboard/shared-inventory", match: (p: string) => p.startsWith("/dashboard/shared-inventory") },
      { label: "Share New Item", icon: Plus, href: "/dashboard/inventory-sharing/share", match: (p: string) => p === "/dashboard/inventory-sharing/share" },
    ],
  },
  {
    key: "communications",
    icon: MessageSquare,
    label: "COMMUNICATIONS",
    items: [
      { label: "Communications", icon: MessageSquare, href: "/dashboard/communications", match: (p: string) => p === "/dashboard/communications" },
    ],
  },
  {
    key: "social",
    icon: Users2,
    label: "SOCIAL NETWORK",
    items: [
      { label: "Social Network", icon: Users2, href: "/dashboard/social-network", match: (p: string) => p === "/dashboard/social-network" },
      { label: "Profile Setup", icon: User, href: "/dashboard/profile-setup", match: (p: string) => p === "/dashboard/profile-setup" },
      { label: "My Network", icon: Users, href: "/dashboard/my-network", match: (p: string) => p === "/dashboard/my-network" },
      { label: "Communities", icon: Users, href: "/dashboard/communities", match: (p: string) => p === "/dashboard/communities" },
      { label: "Events", icon: Calendar, href: "/dashboard/events", match: (p: string) => p === "/dashboard/events" },
    ],
  },
  {
    key: "services",
    icon: ConciergeBell,
    label: "SERVICES",
    items: [
      { label: "Consignment Dashboard", icon: Package, href: "/dashboard/consignment", match: (p: string) => p === "/dashboard/consignment" },
      { label: "Repairs", icon: Wrench, href: "/dashboard/repairs", match: (p: string) => p.startsWith("/dashboard/repairs") },
      { label: "Rework Tracking", icon: AlertTriangle, href: "/dashboard/services/rework", match: (p: string) => p === "/dashboard/services/rework" },
    ],
  },
  {
    key: "finance",
    icon: CreditCard,
    label: "FINANCE",
    items: [
      { label: "Accounts Receivable", icon: CreditCard, href: "/dashboard/accounts-receivable", match: (p: string) => p.startsWith("/dashboard/accounts-receivable") },
      { label: "Accounts Payable", icon: CreditCard, href: "/dashboard/accounts-payable", match: (p: string) => p.startsWith("/dashboard/accounts-payable") },
    ],
  },
  {
    key: "analytics",
    icon: BarChart3,
    label: "ANALYTICS",
    items: [
      { label: "Business Analytics", icon: BarChart3, href: "/dashboard/analytics", match: (p: string) => p === "/dashboard/analytics" },
      { label: "Production Analytics", icon: LineChart, href: "/dashboard/production/analytics", match: (p: string) => p === "/dashboard/production/analytics" },
      { label: "Efficiency Analytics", icon: TrendingUp, href: "/dashboard/production/efficiency", match: (p: string) => p === "/dashboard/production/efficiency" },
    ],
  },
  {
    key: "settings",
    icon: Settings,
    label: "SETTINGS",
    items: [
      { label: "Access Control", icon: Shield, href: "/dashboard/access-control", match: (p: string) => p.startsWith("/dashboard/access-control") },
      { label: "Team Management", icon: Users, href: "/dashboard/team-management", match: (p: string) => p.startsWith("/dashboard/team-management") },
      { label: "Email Integration", icon: Mail, href: "/dashboard/email-integration", match: (p: string) => p === "/dashboard/email-integration" },
      { label: "Resources", icon: Users, href: "/dashboard/production/resources", match: (p: string) => p === "/dashboard/production/resources" },
      { label: "Billing", icon: CreditCard, href: "/dashboard/billing", match: (p: string) => p === "/dashboard/billing" },
      { label: "System Settings", icon: Settings, href: "/settings", match: (p: string) => p === "/settings" },
    ],
  },
]

export function DashboardSidebar({ className }: { className?: string }) {
  const pathname = usePathname()
  const { isExpanded, isMobileOpen, toggleSidebar, closeMobileSidebar, isMobile, isTablet, isDesktop } = useSidebar()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ dashboard: true })
  
  useEffect(() => {
    // Only access localStorage on the client side
    const stored = localStorage.getItem(SIDEBAR_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setExpanded(parsed)
      } catch (e) {
        console.error('Failed to parse stored sidebar state:', e)
      }
    }
  }, [])

  useEffect(() => {
    // Only save to localStorage on the client side
    localStorage.setItem(SIDEBAR_KEY, JSON.stringify(expanded))
  }, [expanded])

  const toggle = (key: string) => {
    setExpanded((prev: Record<string, boolean>) => ({ ...prev, [key]: !prev[key] }))
  }

  // Handle backdrop click for mobile
  const handleBackdropClick = () => {
    if (isMobile) {
      closeMobileSidebar()
    }
  }

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        closeMobileSidebar()
      }
    }

    if (isMobile) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isMobile, isMobileOpen, closeMobileSidebar])

  // Mobile overlay backdrop
  if (isMobile && isMobileOpen) {
  return (
      <>
        {/* Backdrop */}
    <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
        
        {/* Mobile Sidebar */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-[#232323] border-r border-gray-700 transform transition-transform duration-300 ease-in-out lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          "shadow-2xl"
        )}>
          <div className="flex h-full flex-col">
            {/* Mobile Header */}
            <div className="flex h-14 items-center justify-between border-b border-gray-700 px-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-emerald-500">
                <Gem className="h-6 w-6" style={{ color: '#7FDBFF' }} />
                <span>Jewelia</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeMobileSidebar}
                className="h-8 w-8 text-gray-400 hover:text-white"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Mobile Content */}
      <ScrollArea className="flex-1 px-2 py-2">
        {sidebarStructure.map((cat) => {
          const isOpen = !!expanded[cat.key]
          return (
            <div key={cat.key} className="mb-1">
              <button
                className={cn(
                        "flex items-center w-full px-3 py-2 rounded-md transition-colors group hover:bg-emerald-900/20 min-h-[44px]",
                  isOpen ? "bg-emerald-900/10" : ""
                )}
                onClick={() => toggle(cat.key)}
                type="button"
                      aria-expanded={isOpen}
              >
                <cat.icon className="h-5 w-5 mr-2 text-emerald-400" />
                <span className="font-semibold flex-1 text-white tracking-wide text-[15px]">{cat.label}
                </span>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-emerald-300 transition-transform" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-emerald-300 transition-transform" />
                )}
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                )}
                style={{
                  pointerEvents: isOpen ? 'auto' : 'none',
                }}
              >
                <ul className="pl-8 py-1 space-y-1">
                  {cat.items.map((item) => {
                    const active = item.match(pathname)
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                                onClick={closeMobileSidebar}
                          className={cn(
                                  "flex items-center gap-2 px-2 py-1.5 rounded-md text-[15px] transition-colors min-h-[44px]",
                            active
                              ? "bg-emerald-700/30 text-emerald-200 font-bold"
                              : "text-emerald-100 hover:bg-emerald-800/20 hover:text-white"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          <span className="truncate">{item.label}</span>
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  </div>
                )
              })}
            </ScrollArea>
          </div>
        </div>
      </>
    )
  }

  // Desktop/Tablet Sidebar
  return (
    <div
      className={cn(
        "relative flex h-screen flex-col border-r transition-all duration-300 bg-[#232323] group sidebar-hover-expand",
        isExpanded ? "w-64" : "w-16",
        isMobile ? "hidden" : "block",
        "z-30",
        className
      )}
    >
      {/* Toggle Button for All Screen Sizes */}
      <div className="flex h-14 items-center justify-between border-b border-gray-700 px-4 bg-[#232323]">
        {/* Removed Jewelia logo and name */}
        <span></span>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 text-gray-400 hover:text-white"
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2 py-2 bg-[#232323] min-h-0 pb-20" style={{height: '100%', maxHeight: '100vh', flexGrow: 1, flexShrink: 1, flexBasis: 'auto'}}>
        {sidebarStructure.map((cat) => {
          const isOpen = !!expanded[cat.key]
          return (
            <div key={cat.key} className="mb-1 bg-[#232323] rounded-md">
              <button
                className={cn(
                  "flex items-center w-full px-3 py-2 rounded-md transition-colors group hover:bg-emerald-900/20 min-h-[44px] bg-[#232323] sidebar-item",
                  isOpen ? "bg-emerald-900/10" : "",
                  !isExpanded && "justify-center px-0"
                )}
                onClick={() => toggle(cat.key)}
                type="button"
                aria-expanded={isOpen}
                title={!isExpanded ? cat.label : undefined}
              >
                <cat.icon className="h-5 w-5 text-emerald-400 sidebar-icon" />
                <span className="font-semibold flex-1 text-white tracking-wide text-[15px] ml-2 sidebar-text" style={{ display: isExpanded ? 'block' : 'none' }}>{cat.label}
                </span>
                {isExpanded && (
                  <>
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 text-emerald-300 transition-transform" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-emerald-300 transition-transform" />
                    )}
                  </>
                )}
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300 bg-[#232323]",
                  isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                )}
                style={{
                  pointerEvents: isOpen ? 'auto' : 'none',
                }}
              >
                <ul className={cn("py-1 space-y-1 sidebar-submenu", isExpanded ? "pl-8" : "pl-0", "bg-[#232323]")}> 
                  {cat.items.map((item) => {
                    const active = item.match(pathname)
                    return (
                      <li key={item.href} className="bg-[#232323]">
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2 px-2 py-1.5 rounded-md text-[15px] transition-colors min-h-[44px] w-full bg-[#232323] sidebar-item",
                            active
                              ? "bg-emerald-700/30 text-emerald-200 font-bold"
                              : "text-emerald-100 hover:bg-emerald-800/20 hover:text-white",
                            !isExpanded && "justify-center px-0"
                          )}
                          style={!isExpanded ? { justifyContent: 'center', minWidth: 44, minHeight: 44, width: '100%' } : {}}
                          title={!isExpanded ? item.label : undefined}
                          tabIndex={0}
                        >
                          <item.icon className="h-4 w-4 sidebar-icon" />
                          <span className="truncate sidebar-text" style={{ display: isExpanded ? 'block' : 'none' }}>{item.label}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          )
        })}
      </ScrollArea>
    </div>
  )
} 