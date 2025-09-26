"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { 
  Shield, 
  Users, 
  Package, 
  ShoppingCart, 
  Warehouse, 
  Hammer, 
  Truck, 
  MessageSquare, 
  Users2, 
  ConciergeBell, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Mail,
  QrCode,
  Plus,
  ArrowRightLeft,
  Layers,
  CalendarRange,
  FileImage,
  Boxes,
  Wrench,
  Clock,
  CheckSquare,
  RefreshCw,
  ClipboardList,
  User,
  Calendar,
  AlertTriangle,
  LineChart,
  TrendingUp,
  Save,
  RotateCcw,
  Check,
  X
} from "lucide-react"
import { 
  JewelryUserRole, 
  ROLE_DISPLAY_NAMES, 
  ROLE_COLORS, 
  ROLE_HIERARCHY 
} from "@/types/rbac"

// Define all pages/sections from your sidebar structure
const PAGE_SECTIONS = [
  {
    category: "Dashboard",
    icon: BarChart3,
    pages: [
      { name: "Dashboard Overview", href: "/dashboard", description: "Main dashboard with analytics" }
    ]
  },
  {
    category: "Customers & Sales",
    icon: Users,
    pages: [
      { name: "Customers", href: "/dashboard/customers", description: "Customer management" },
      { name: "Orders", href: "/dashboard/orders", description: "Order processing and tracking" },
      { name: "Products", href: "/dashboard/products", description: "Product catalog management" },
      { name: "Trade-In", href: "/dashboard/trade-ins", description: "Trade-in processing" },
      { name: "Sales Dashboard", href: "/dashboard/sales-dashboard", description: "Sales analytics and reports" }
    ]
  },
  {
    category: "Inventory",
    icon: Warehouse,
    pages: [
      { name: "Inventory Management", href: "/dashboard/inventory-management", description: "Main inventory control" },
      { name: "Asset Tracking", href: "/dashboard/inventory/asset-tracking", description: "Asset tracking with QR codes" },
      { name: "Assign Inventory", href: "/dashboard/inventory/asset-tracking/assign", description: "Assign items to projects" },
      { name: "Check-In / Check-Out", href: "/dashboard/inventory/check-in-out", description: "Item check-in/out system" },
      { name: "Scanner", href: "/dashboard/scanner", description: "QR code scanner" }
    ]
  },
  {
    category: "Production",
    icon: Hammer,
    pages: [
      { name: "Production Dashboard", href: "/dashboard/production/kanban", description: "Production workflow management" },
      { name: "Batches", href: "/dashboard/production/batches", description: "Production batch tracking" },
      { name: "Schedule", href: "/dashboard/production/schedule", description: "Production scheduling" },
      { name: "CAD Files", href: "/dashboard/cad", description: "CAD file management" },
      { name: "Materials", href: "/dashboard/production/materials", description: "Material inventory" },
      { name: "Equipment", href: "/dashboard/equipment", description: "Equipment management" },
      { name: "Time Tracking", href: "/dashboard/production/time-tracking", description: "Production time tracking" },
      { name: "Quality Control", href: "/dashboard/production/quality-control", description: "Quality assurance" }
    ]
  },
  {
    category: "Logistics",
    icon: Truck,
    pages: [
      { name: "Logistics Dashboard", href: "/dashboard/logistics", description: "Shipping and logistics" }
    ]
  },
  {
    category: "Marketplace",
    icon: ShoppingCart,
    pages: [
      { name: "Marketplace Overview", href: "/dashboard/marketplace", description: "Marketplace management" },
      { name: "My Shared Inventory", href: "/dashboard/inventory-sharing", description: "Share inventory with network" },
      { name: "Browse Network Inventory", href: "/dashboard/shared-inventory", description: "Browse partner inventory" },
      { name: "Share New Item", href: "/dashboard/inventory-sharing/share", description: "Add items to network" }
    ]
  },
  {
    category: "Communications",
    icon: MessageSquare,
    pages: [
      { name: "Communications", href: "/dashboard/communications", description: "Internal communications" }
    ]
  },
  {
    category: "Social Network",
    icon: Users2,
    pages: [
      { name: "Social Network", href: "/dashboard/social-network", description: "Industry networking" },
      { name: "Profile Setup", href: "/dashboard/profile-setup", description: "User profile management" },
      { name: "My Network", href: "/dashboard/my-network", description: "Personal network" },
      { name: "Communities", href: "/dashboard/communities", description: "Industry communities" },
      { name: "Events", href: "/dashboard/events", description: "Industry events" }
    ]
  },
  {
    category: "Services",
    icon: ConciergeBell,
    pages: [
      { name: "Consignment Dashboard", href: "/dashboard/consignment", description: "Consignment management" },
      { name: "Repairs", href: "/dashboard/repairs", description: "Repair services" },
      { name: "Rework Tracking", href: "/dashboard/services/rework", description: "Rework process tracking" }
    ]
  },
  {
    category: "Finance",
    icon: CreditCard,
    pages: [
      { name: "Accounts Receivable", href: "/dashboard/accounts-receivable", description: "Money coming in" },
      { name: "Accounts Payable", href: "/dashboard/accounts-payable", description: "Money going out" }
    ]
  },
  {
    category: "Analytics",
    icon: BarChart3,
    pages: [
      { name: "Business Analytics", href: "/dashboard/analytics", description: "Business intelligence" },
      { name: "Production Analytics", href: "/dashboard/production/analytics", description: "Production metrics" },
      { name: "Efficiency Analytics", href: "/dashboard/production/efficiency", description: "Efficiency tracking" }
    ]
  },
  {
    category: "Settings",
    icon: Settings,
    pages: [
      { name: "Access Control", href: "/dashboard/access-control", description: "User permissions and roles" },
      { name: "Team Management", href: "/dashboard/team-management", description: "Team organization" },
      { name: "Email Integration", href: "/dashboard/email-integration", description: "Email automation" },
      { name: "Resources", href: "/dashboard/production/resources", description: "Resource management" },
      { name: "Billing", href: "/dashboard/billing", description: "Billing and subscriptions" },
      { name: "System Settings", href: "/settings", description: "System configuration" }
    ]
  }
]

// Simplified permission - just one checkbox per page that grants view + edit access

// Mock permission data - simplified to just page access (view + edit)
const getDefaultPermissions = (role: JewelryUserRole) => {
  const level = ROLE_HIERARCHY[role]
  
  // Define permissions based on role level - simplified to just page access
  const permissions: Record<string, boolean> = {}
  
  PAGE_SECTIONS.forEach(section => {
    section.pages.forEach(page => {
      // Level 1+ gets basic access, Level 3+ gets full access
      permissions[page.href] = level >= 1
    })
  })
  
  // Special cases for specific roles
  if (role === "store_owner" || role === "system_admin") {
    // Full access to everything
    Object.keys(permissions).forEach(page => {
      permissions[page] = true
    })
  } else if (role === "viewer" || role === "guest") {
    // Limited access - only basic pages
    Object.keys(permissions).forEach(page => {
      // Only allow basic viewing pages for viewers/guests
      const basicPages = [
        "/dashboard",
        "/dashboard/customers", 
        "/dashboard/products",
        "/dashboard/orders"
      ]
      permissions[page] = basicPages.includes(page)
    })
  }
  
  return permissions
}

export function RolePermissionMatrix() {
  const [selectedRole, setSelectedRole] = useState<JewelryUserRole>("store_manager")
  const [permissions, setPermissions] = useState<Record<string, boolean>>({})
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setPermissions(getDefaultPermissions(selectedRole))
    setHasChanges(false)
  }, [selectedRole])

  const handlePermissionChange = (pageHref: string, checked: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [pageHref]: checked
    }))
    setHasChanges(true)
  }

  const handleSelectAllInCategory = (section: typeof PAGE_SECTIONS[0]) => {
    const newPermissions = { ...permissions }
    section.pages.forEach(page => {
      newPermissions[page.href] = true
    })
    setPermissions(newPermissions)
    setHasChanges(true)
  }

  const handleDeselectAllInCategory = (section: typeof PAGE_SECTIONS[0]) => {
    const newPermissions = { ...permissions }
    section.pages.forEach(page => {
      newPermissions[page.href] = false
    })
    setPermissions(newPermissions)
    setHasChanges(true)
  }

  const getCategoryStatus = (section: typeof PAGE_SECTIONS[0]) => {
    const totalPages = section.pages.length
    const checkedPages = section.pages.filter(page => permissions[page.href]).length
    
    if (checkedPages === 0) return 'none'
    if (checkedPages === totalPages) return 'all'
    return 'partial'
  }

  const handleSave = () => {
    // In real implementation, this would save to your RBAC system
    console.log("Saving permissions for role:", selectedRole, permissions)
    setHasChanges(false)
    // Show success message
  }

  const handleReset = () => {
    setPermissions(getDefaultPermissions(selectedRole))
    setHasChanges(false)
  }

  const getRoleIcon = (role: JewelryUserRole) => {
    const icons: Record<JewelryUserRole, string> = {
      store_owner: "👑",
      store_manager: "👔",
      assistant_manager: "👨‍💼",
      senior_sales_associate: "💼",
      sales_associate: "💍",
      customer_service_rep: "📞",
      jewelry_designer: "🎨",
      goldsmith: "🔨",
      jeweler: "💎",
      appraiser: "🔍",
      inventory_manager: "📦",
      bookkeeper: "📊",
      accountant: "💰",
      system_admin: "⚙️",
      viewer: "👁️",
      guest: "👤"
    }
    return icons[role] || "👤"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Role Permission Matrix</h2>
          <p className="text-gray-600">Configure which pages each role can access</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {hasChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-200 self-center">
              Unsaved Changes
            </Badge>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} disabled={!hasChanges} size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges} size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Role Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Select Role to Configure</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Label htmlFor="role-select" className="text-sm font-medium flex-shrink-0">
              Select Role:
            </Label>
            <Select value={selectedRole} onValueChange={(value: JewelryUserRole) => setSelectedRole(value)}>
              <SelectTrigger className="w-full sm:w-80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_DISPLAY_NAMES).map(([role, name]) => (
                  <SelectItem key={role} value={role}>
                    <div className="flex items-center space-x-2">
                      <span>{getRoleIcon(role as JewelryUserRole)}</span>
                      <span>{name}</span>
                      <Badge 
                        variant="outline" 
                        className="ml-2"
                        style={{ 
                          backgroundColor: ROLE_COLORS[role as JewelryUserRole] + '20',
                          borderColor: ROLE_COLORS[role as JewelryUserRole],
                          color: ROLE_COLORS[role as JewelryUserRole]
                        }}
                      >
                        Level {ROLE_HIERARCHY[role as JewelryUserRole]}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Appealing Permission Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-blue-100">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base">
                  {ROLE_DISPLAY_NAMES[selectedRole]} Access
                </h3>
                <p className="text-sm text-gray-600">
                  {Object.values(permissions).filter(Boolean).length} of {Object.keys(permissions).length} pages accessible
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((Object.values(permissions).filter(Boolean).length / Object.keys(permissions).length) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Access Level</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permission Matrix - Clean & Readable */}
      <div className="space-y-4">
        {PAGE_SECTIONS.map((section) => (
          <Card key={section.category} className="overflow-hidden shadow-sm">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b py-3 px-4">
              <CardTitle className="flex items-center space-x-2 text-sm font-semibold">
                <section.icon className="h-4 w-4 text-gray-600" />
                <span>{section.category}</span>
                <div className="flex items-center space-x-2 ml-auto">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleSelectAllInCategory(section)}
                    disabled={getCategoryStatus(section) === 'all'}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 h-7 text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeselectAllInCategory(section)}
                    disabled={getCategoryStatus(section) === 'none'}
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-gray-300 px-2 py-1 h-7 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {section.pages.map((page) => (
                  <div key={page.href} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg border border-gray-100 transition-all duration-200 hover:shadow-sm">
                    <Checkbox
                      id={`${page.href}`}
                      checked={permissions[page.href] || false}
                      onCheckedChange={(checked) => 
                        handlePermissionChange(page.href, checked as boolean)
                      }
                      className="flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm leading-tight break-words">
                        {page.name}
                      </h4>
                    </div>
                    <div className="flex-shrink-0">
                      {permissions[page.href] ? (
                        <div className="w-2 h-2 bg-green-500 rounded-full shadow-sm"></div>
                      ) : (
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Clean Legend */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox checked={true} disabled className="flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700">Access Granted</span>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox checked={false} disabled className="flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700">No Access</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full shadow-sm"></div>
                <span className="text-sm font-medium text-gray-700">Enabled</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Disabled</span>
              </div>
            </div>
            <div className="text-sm text-blue-700 font-medium">
              ✓ Checkbox = View + Edit permissions
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
