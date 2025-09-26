import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, Plus, Trash2, Edit } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const paymentMethods = [
  {
    id: 1,
    type: "Visa",
    last4: "4242",
    expiry: "04/2025",
    isDefault: true,
  },
  {
    id: 2,
    type: "Mastercard",
    last4: "5555",
    expiry: "08/2024",
    isDefault: false,
  },
]

export function PaymentMethods() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <h2 className="text-lg sm:text-xl font-semibold">Payment Methods</h2>
        <Button className="gap-1 text-xs sm:text-sm min-h-[44px]">
          <Plus className="h-3 w-3 sm:h-4 sm:w-4" /> Add Payment Method
        </Button>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2 overflow-x-auto">
        {paymentMethods.map((method) => (
          <Card key={method.id} className="min-w-[280px] lg:min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm sm:text-lg font-medium">
                {method.type} •••• {method.last4}
              </CardTitle>
              {method.isDefault && <Badge className="text-xs sm:text-sm">Default</Badge>}
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 sm:gap-4">
                <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Expires {method.expiry}</p>
                </div>
              </div>
            </CardContent>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4 p-4 sm:p-6">
              <Button variant="outline" className="gap-1 text-xs sm:text-sm min-h-[44px]">
                <Edit className="h-3 w-3 sm:h-4 sm:w-4" /> Edit
              </Button>
              <Button variant="outline" className="gap-1 text-destructive text-xs sm:text-sm min-h-[44px]">
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" /> Remove
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Billing Address</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Your billing address for invoices and receipts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <p className="font-medium text-sm sm:text-base">John Doe</p>
            <p className="text-xs sm:text-sm text-muted-foreground">123 Main Street</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Apt 4B</p>
            <p className="text-xs sm:text-sm text-muted-foreground">New York, NY 10001</p>
            <p className="text-xs sm:text-sm text-muted-foreground">United States</p>
          </div>
        </CardContent>
        <div className="p-4 sm:p-6">
          <Button variant="outline" className="text-xs sm:text-sm min-h-[44px]">Update Address</Button>
        </div>
      </Card>
    </div>
  )
}
