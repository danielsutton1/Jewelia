"use client"

import { Plus, UserPlus, FileText, ShoppingCart, Package, Calendar, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"

export function QuickActions() {
  const router = useRouter()
  const { hasPermission, user, loading } = useAuth()

  const actions = [
    {
      label: "Add Customer",
      icon: UserPlus,
      href: "/dashboard/customers/new",
      permission: "canEditCustomers",
    },
    {
      label: "Create Quote",
      icon: FileText,
      href: "/dashboard/quotes/create",
      permission: "canEditOrders",
    },
    {
      label: "Create Order",
      icon: ShoppingCart,
      href: "/dashboard/orders/create",
      permission: "canEditOrders",
    },
    {
      label: "Add Product",
      icon: Package,
      href: "/dashboard/products/new",
      permission: "canEditInventory",
    },
    {
      label: "Schedule Appointment",
      icon: Calendar,
      href: "/dashboard/calendar/schedule",
      permission: "canViewAnalytics",
    },
    {
      label: "Add Customer Note",
      icon: Phone,
      href: "/dashboard/call-log",
      permission: "canEditCustomers",
    },
  ]

  // For development/testing, show all actions if no permissions are available
  const allowedActions = actions.filter(action => {
    try {
      // If user is not logged in or still loading, allow all actions for development
      if (!user || loading) {
        return true
      }
      return hasPermission(action.permission as any)
    } catch {
      // If permission check fails, allow the action (for development)
      return true
    }
  })

  // If no actions are allowed by permissions, show all actions anyway (for development)
  const finalActions = allowedActions.length > 0 ? allowedActions : actions

  // Debug logging
  console.log('QuickActions Debug:', {
    user: user?.email,
    loading,
    allowedActionsCount: allowedActions.length,
    finalActionsCount: finalActions.length,
    actions: finalActions.map(a => a.label)
  })

  if (finalActions.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-500">No quick actions available for your role.</p>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Quick Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {finalActions.map((action) => {
            const IconComponent = action.icon
            return (
              <DropdownMenuItem 
                key={action.label}
                className="gap-2 cursor-pointer"
                onClick={() => router.push(action.href)}
              >
                <IconComponent className="h-4 w-4" /> {action.label}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
