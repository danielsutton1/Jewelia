"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
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
  LucideIcon,
  Gem,
  Tag,
  RefreshCw,
  ConciergeBell,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

const SIDEBAR_KEY = "sidebar_expanded_categories_v1"

const sidebarStructure = [
  {
    key: "dashboard",
    icon: LayoutDashboard,
    label: "DASHBOARD",
    items: [
      { label: "Main Dashboard", icon: LayoutDashboard, href: "/dashboard", match: (p: string) => p === "/dashboard" },
      { label: "Onboarding Wizard", icon: BarChart3, href: "/dashboard/onboarding", match: (p: string) => p === "/dashboard/onboarding" },
    ],
  },
  {
    key: "communications",
    icon: MessageSquare,
    label: "COMMUNICATIONS",
    items: [
      { label: "Communications Dashboard", icon: MessageSquare, href: "/dashboard/communications", match: (p: string) => p === "/dashboard/communications" },
      { label: "Inbox", icon: Inbox, href: "/dashboard/inbox", match: (p: string) => p === "/dashboard/inbox" },
      { label: "Partner Communications", icon: Users2, href: "/dashboard/partners/communications", match: (p: string) => p === "/dashboard/partners/communications" },
      { label: "Calendar", icon: Calendar, href: "/dashboard/calendar", match: (p: string) => p === "/dashboard/calendar" },
      { label: "E-commerce Integration", icon: ShoppingCart, href: "/dashboard/ecommerce", match: (p: string) => p === "/dashboard/ecommerce" },
    ],
  },
  {
    key: "customers",
    icon: Users,
    label: "CUSTOMERS & SALES",
    items: [
      { label: "Customers", icon: Users, href: "/dashboard/customers", match: (p: string) => p === "/dashboard/customers" },
      { label: "Partners", icon: Users2, href: "/dashboard/partners", match: (p: string) => p === "/dashboard/partners" },
      { label: "Orders", icon: ShoppingCart, href: "/dashboard/orders", match: (p: string) => p.startsWith("/dashboard/orders") && p !== "/dashboard/orders/create" },
      { label: "Trade-In", icon: RefreshCw, href: "/dashboard/trade-ins", match: (p: string) => p.startsWith("/dashboard/trade-ins") },
    ],
  },
  {
    key: "inventory",
    icon: Warehouse,
    label: "INVENTORY",
    items: [
      { label: "Products", icon: Package, href: "/dashboard/products", match: (p: string) => p === "/dashboard/products" },
      { label: "Inventory Management", icon: Warehouse, href: "/dashboard/inventory", match: (p: string) => p.startsWith("/dashboard/inventory") },
      { label: "Diamond Inventory", icon: Gem, href: "/dashboard/diamonds", match: (p: string) => p === "/dashboard/diamonds" },
      { label: "Inventory Tags", icon: Tag, href: "/dashboard/inventory/tags", match: (p: string) => p === "/dashboard/inventory/tags" },
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
      { label: "Resources", icon: Users, href: "/dashboard/production/resources", match: (p: string) => p === "/dashboard/production/resources" },
      { label: "Billing", icon: CreditCard, href: "/dashboard/billing", match: (p: string) => p === "/dashboard/billing" },
      { label: "System Settings", icon: Settings, href: "/settings", match: (p: string) => p === "/settings" },
    ],
  },
]

export function DashboardSidebar({ className }: { className?: string }) {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(SIDEBAR_KEY)
      if (stored) return JSON.parse(stored)
    }
    // Default: only dashboard expanded
    return { dashboard: true }
  })

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, JSON.stringify(expanded))
  }, [expanded])

  const toggle = (key: string) => {
    setExpanded((prev: Record<string, boolean>) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div
      className={cn(
        "relative flex h-screen flex-col border-r bg-[#232323] transition-all duration-300 w-64",
        className
      )}
    >
      <div className="flex h-14 items-center border-b px-4 relative">
        <div className="flex items-center gap-2 text-lg font-semibold text-emerald-500 w-full justify-center">
          <Gem className="h-6 w-6" style={{ color: '#7FDBFF' }} />
          Jewelia
        </div>
      </div>
      <ScrollArea className="flex-1 px-2 py-4">
        {sidebarStructure.map((cat) => {
          const isOpen = !!expanded[cat.key]
          return (
            <div key={cat.key} className="mb-2">
              <button
                className={cn(
                  "flex items-center w-full px-3 py-2 rounded-md transition-colors group hover:bg-emerald-900/20",
                  isOpen ? "bg-emerald-900/10" : ""
                )}
                onClick={() => toggle(cat.key)}
                type="button"
                aria-expanded={isOpen}
              >
                <cat.icon className="h-5 w-5 mr-2 text-emerald-400" />
                <span className="font-semibold flex-1 text-white tracking-wide text-sm">{cat.label}</span>
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
                          className={cn(
                            "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
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
  )
}