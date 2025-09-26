"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Box,
  Cable,
  CreditCard,
  FileText,
  Home,
  Package,
  Settings,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react"

interface SidebarNavProps {
  children: React.ReactNode
}

export function DropshipPortalLayout({ children }: SidebarNavProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const mainNavItems = [
    {
      title: "Dashboard",
      href: "/dropship-portal",
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: "Products",
      href: "/dropship-portal/products",
      icon: <Box className="h-5 w-5" />,
    },
    {
      title: "Orders",
      href: "/dropship-portal/orders",
      icon: <ShoppingCart className="h-5 w-5" />,
    },
    {
      title: "Shipping",
      href: "/dropship-portal/shipping",
      icon: <Truck className="h-5 w-5" />,
    },
    {
      title: "Integration",
      href: "/dropship-portal/integration",
      icon: <Cable className="h-5 w-5" />,
    },
  ]

  const settingsNavItems = [
    {
      title: "Product Mapping",
      href: "/dropship-portal/settings/mapping",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Pricing Rules",
      href: "/dropship-portal/settings/pricing",
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      title: "Shipping Methods",
      href: "/dropship-portal/settings/shipping",
      icon: <Package className="h-5 w-5" />,
    },
    {
      title: "Brand Guidelines",
      href: "/dropship-portal/settings/brand",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Testing Environment",
      href: "/dropship-portal/settings/testing",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      title: "Account Settings",
      href: "/dropship-portal/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  return (
    <div className="flex min-h-screen">
      <div
        className={`border-r bg-background ${
          collapsed ? "w-[80px]" : "w-[250px]"
        } transition-all duration-300 hidden md:block`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center border-b px-4">
            <Link href="/dropship-portal" className="flex items-center gap-2 font-semibold">
              {!collapsed && <span>Jewelia Drop-Shipping</span>}
              {collapsed && <span>JDS</span>}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform ${collapsed ? "rotate-180" : ""}`}
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Button>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-2 text-sm font-medium">
              <div className="space-y-1">
                {mainNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                      pathname === item.href ? "bg-muted text-primary" : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {item.icon}
                    {!collapsed && <span>{item.title}</span>}
                  </Link>
                ))}
              </div>
              <div className="mt-6">
                <h3
                  className={`mb-2 px-4 text-xs font-semibold text-muted-foreground ${collapsed ? "text-center" : ""}`}
                >
                  {collapsed ? "⚙️" : "Settings"}
                </h3>
                <div className="space-y-1">
                  {settingsNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                        pathname === item.href ? "bg-muted text-primary" : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {item.icon}
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
