"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Package, LayoutDashboard, ShoppingBag, CreditCard, BarChart3, FileText, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ConsignmentPortalLayoutProps {
  children: React.ReactNode
}

export function ConsignmentPortalLayout({ children }: ConsignmentPortalLayoutProps) {
  const pathname = usePathname()
  const [partnerName, setPartnerName] = useState("Eleanor's Fine Jewelry")

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/consignment-portal",
      active: pathname === "/consignment-portal",
    },
    {
      label: "Inventory",
      icon: ShoppingBag,
      href: "/consignment-portal/inventory",
      active: pathname === "/consignment-portal/inventory",
    },
    {
      label: "Sales",
      icon: BarChart3,
      href: "/consignment-portal/sales",
      active: pathname === "/consignment-portal/sales",
    },
    {
      label: "Settlements",
      icon: CreditCard,
      href: "/consignment-portal/settlements",
      active: pathname === "/consignment-portal/settlements",
    },
    {
      label: "Reports",
      icon: FileText,
      href: "/consignment-portal/reports",
      active: pathname === "/consignment-portal/reports",
    },
    {
      label: "Agreement",
      icon: FileText,
      href: "/consignment-portal/agreement",
      active: pathname === "/consignment-portal/agreement",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/consignment-portal/settings",
      active: pathname === "/consignment-portal/settings",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/consignment-portal" className="flex items-center gap-2 font-semibold">
          <Package className="h-6 w-6" />
          <span>Jewelia Partner Portal</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-sm font-medium">{partnerName}</span>
          <Button variant="ghost" size="icon">
            <Link href="/login">
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Log out</span>
            </Link>
          </Button>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="w-64 border-r bg-background">
          <nav className="grid gap-1 p-4">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={route.active ? "secondary" : "ghost"}
                className={cn("justify-start", route.active && "bg-secondary")}
              >
                <Link href={route.href}>
                  <route.icon className="mr-2 h-4 w-4" />
                  {route.label}
                </Link>
              </Button>
            ))}
          </nav>
        </aside>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
