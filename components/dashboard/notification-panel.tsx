import { AlertTriangle, Bell, CheckCircle, Info, ShoppingCart, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const notifications = [
  {
    id: 1,
    title: "New Order Received",
    description: "Order #12345 has been placed for $329.97",
    time: "10 minutes ago",
    type: "order",
    read: false,
  },
  {
    id: 2,
    title: "Low Stock Alert",
    description: "Gold Earrings are running low (5 items remaining)",
    time: "1 hour ago",
    type: "alert",
    read: false,
  },
  {
    id: 3,
    title: "New Customer Registration",
    description: "Ethan Johnson has created an account",
    time: "2 hours ago",
    type: "user",
    read: true,
  },
  {
    id: 4,
    title: "Payment Successful",
    description: "Payment for Order #12342 has been processed",
    time: "3 hours ago",
    type: "payment",
    read: true,
  },
  {
    id: 5,
    title: "System Update",
    description: "Jewelia CRM will be updated tonight at 2:00 AM",
    time: "5 hours ago",
    type: "system",
    read: true,
  },
]

export function NotificationPanel() {
  const getIcon = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingCart className="h-4 w-4 text-primary" />
      case "alert":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case "user":
        return <User className="h-4 w-4 text-emerald-500" />
      case "payment":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />
      case "system":
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex gap-3 rounded-lg border p-3 ${notification.read ? "bg-background" : "bg-primary/5"}`}
        >
          <div className="mt-0.5">{getIcon(notification.type)}</div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{notification.title}</h4>
              {!notification.read && (
                <Badge variant="default" className="bg-primary text-xs">
                  New
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{notification.description}</p>
            <p className="text-xs text-muted-foreground">{notification.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
