import { ShoppingCart, Users, AlertTriangle, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export function NotificationTypes() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <CardTitle>Order Notifications</CardTitle>
          </div>
          <CardDescription>Notifications related to orders and transactions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">New Orders</Label>
              <p className="text-sm text-muted-foreground">Receive notifications for new orders</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Order Status Changes</Label>
              <p className="text-sm text-muted-foreground">Notifications when order status changes</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Order Cancellations</Label>
              <p className="text-sm text-muted-foreground">Notifications for cancelled orders</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Payment Confirmations</Label>
              <p className="text-sm text-muted-foreground">Notifications for successful payments</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Shipping Updates</Label>
              <p className="text-sm text-muted-foreground">Notifications for shipping status changes</p>
            </div>
            <Switch defaultChecked={true} />
          </div>
        </CardContent>
        <div>
          <Button variant="outline" className="w-full">
            Advanced Settings
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Customer Notifications</CardTitle>
          </div>
          <CardDescription>Notifications related to customer activities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">New Customers</Label>
              <p className="text-sm text-muted-foreground">Notifications for new customer registrations</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Customer Feedback</Label>
              <p className="text-sm text-muted-foreground">Notifications for customer reviews and feedback</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Support Requests</Label>
              <p className="text-sm text-muted-foreground">Notifications for new support tickets</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Account Changes</Label>
              <p className="text-sm text-muted-foreground">Notifications for customer account updates</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Customer Milestones</Label>
              <p className="text-sm text-muted-foreground">Notifications for customer anniversaries and milestones</p>
            </div>
            <Switch defaultChecked={false} />
          </div>
        </CardContent>
        <div>
          <Button variant="outline" className="w-full">
            Advanced Settings
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <CardTitle>System Alerts</CardTitle>
          </div>
          <CardDescription>Critical system notifications and alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">System Errors</Label>
              <p className="text-sm text-muted-foreground">Notifications for critical system errors</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Security Alerts</Label>
              <p className="text-sm text-muted-foreground">Notifications for security-related events</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Performance Alerts</Label>
              <p className="text-sm text-muted-foreground">Notifications for performance issues</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Maintenance Notifications</Label>
              <p className="text-sm text-muted-foreground">Notifications for scheduled maintenance</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Data Backup Alerts</Label>
              <p className="text-sm text-muted-foreground">Notifications for backup successes or failures</p>
            </div>
            <Switch defaultChecked={true} />
          </div>
        </CardContent>
        <div>
          <Button variant="outline" className="w-full">
            Advanced Settings
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Calendar & Reminders</CardTitle>
          </div>
          <CardDescription>Notifications for events and reminders</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Appointment Reminders</Label>
              <p className="text-sm text-muted-foreground">Notifications for upcoming appointments</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Task Due Dates</Label>
              <p className="text-sm text-muted-foreground">Notifications for task deadlines</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Follow-up Reminders</Label>
              <p className="text-sm text-muted-foreground">Reminders to follow up with customers</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Meeting Invitations</Label>
              <p className="text-sm text-muted-foreground">Notifications for new meeting invites</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Calendar Sync Alerts</Label>
              <p className="text-sm text-muted-foreground">Notifications for calendar sync issues</p>
            </div>
            <Switch defaultChecked={false} />
          </div>
        </CardContent>
        <div>
          <Button variant="outline" className="w-full">
            Advanced Settings
          </Button>
        </div>
      </Card>
    </div>
  )
}
