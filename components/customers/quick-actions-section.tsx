import { Plus, ShoppingCart, Package, DollarSign, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export function QuickActionsSection() {
  return (
    <Card className="bg-white/90 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-slate-800">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {/* Add Customer */}
          <Link href="/dashboard/customers/new">
            <Button 
              className="w-full h-12 flex flex-col items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-102 border-0 group"
            >
              <div className="p-1 bg-white/20 rounded-md group-hover:bg-white/30 transition-colors duration-200">
                <Users className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs font-medium text-white">Add Customer</span>
            </Button>
          </Link>

          {/* Create Order */}
          <Link href="/dashboard/orders/create">
            <Button 
              className="w-full h-12 flex flex-col items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-102 border-0 group"
            >
              <div className="p-1 bg-white/30 rounded-md group-hover:bg-white/40 transition-colors duration-200">
                <ShoppingCart className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs font-medium text-white">Create Order</span>
            </Button>
          </Link>

          {/* Add Product */}
          <Link href="/dashboard/products/new">
            <Button 
              className="w-full h-12 flex flex-col items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-102 border-0 group"
            >
              <div className="p-1 bg-white/35 rounded-md group-hover:bg-white/45 transition-colors duration-200">
                <Package className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs font-medium text-white">Add Product</span>
            </Button>
          </Link>

          {/* Create Quote */}
          <Link href="/dashboard/quotes/create">
            <Button 
              className="w-full h-12 flex flex-col items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-102 border-0 group"
            >
              <div className="p-1 bg-white/25 rounded-md group-hover:bg-white/35 transition-colors duration-200">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs font-medium text-white">Create Quote</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
} 