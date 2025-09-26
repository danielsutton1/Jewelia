"use client"

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, ShoppingCart, Package, Gem, Plus, Settings } from 'lucide-react'

// =====================================================
// MARKETPLACE BREADCRUMB COMPONENT
// =====================================================

export function MarketplaceBreadcrumb() {
  const pathname = usePathname()

  const getBreadcrumbItems = () => {
    const items = [
      {
        label: 'Marketplace',
        href: '/dashboard/marketplace',
        icon: ShoppingCart,
        isActive: pathname === '/dashboard/marketplace'
      }
    ]

    if (pathname.startsWith('/dashboard/inventory-sharing')) {
      if (pathname === '/dashboard/inventory-sharing/share') {
        items.push({
          label: 'Share New Item',
          href: '/dashboard/inventory-sharing/share',
          icon: Plus,
          isActive: true
        })
      } else if (pathname.includes('/manage/')) {
        items.push(
          {
            label: 'My Shared Inventory',
            href: '/dashboard/inventory-sharing',
            icon: Package,
            isActive: false
          },
          {
            label: 'Manage Settings',
            href: pathname,
            icon: Settings,
            isActive: true
          }
        )
      } else {
        items.push({
          label: 'My Shared Inventory',
          href: '/dashboard/inventory-sharing',
          icon: Package,
          isActive: true
        })
      }
    } else if (pathname.startsWith('/dashboard/shared-inventory')) {
      items.push({
        label: 'Browse Network Inventory',
        href: '/dashboard/shared-inventory',
        icon: Gem,
        isActive: true
      })
    }

    return items
  }

  const breadcrumbItems = getBreadcrumbItems()

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      {breadcrumbItems.map((item, index) => (
        <div key={item.href} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          )}
          
          <Link
            href={item.href}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
              item.isActive
                ? 'bg-emerald-100 text-emerald-700 font-medium'
                : 'hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        </div>
      ))}
    </nav>
  )
}
