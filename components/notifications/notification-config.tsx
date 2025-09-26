import { Settings, Clock, Filter, Bell } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"

export function NotificationConfig() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <CardTitle>General Settings</CardTitle>
          </div>
          <CardDescription>Configure general notification settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Enable All Notifications</Label>
              <p className="text-sm text-muted-foreground">Master switch for all notifications</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="space-y-2">
            <Label>Notification Display Duration</Label>
            <div className="flex items-center gap-4">
              <Slider defaultValue={[5]} max={10} step={1} className="flex-1" />
              <span className="w-12 text-center">5s</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Desktop Notifications</Label>
              <p className="text-sm text-muted-foreground">Show notifications in your browser</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">In-App Notifications</Label>
              <p className="text-sm text-muted-foreground">Show notifications within the application</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Sound Effects</Label>
              <p className="text-sm text-muted-foreground">Play sounds for notifications</p>
            </div>
            <Switch defaultChecked={false} />
          </div>
        </CardContent>
        <div>
          <Button variant="outline" className="w-full">
            Reset to Defaults
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle>Timing & Frequency</CardTitle>
          </div>
          <CardDescription>Configure when and how often you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Do Not Disturb</Label>
              <p className="text-sm text-muted-foreground">Silence notifications during specified hours</p>
            </div>
            <Switch defaultChecked={false} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input type="time" defaultValue="22:00" />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input type="time" defaultValue="07:00" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notification Batching</Label>
            <Select defaultValue="none">
              <SelectTrigger>
                <SelectValue placeholder="Select batching option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Send Immediately)</SelectItem>
                <SelectItem value="5min">Every 5 minutes</SelectItem>
                <SelectItem value="15min">Every 15 minutes</SelectItem>
                <SelectItem value="30min">Every 30 minutes</SelectItem>
                <SelectItem value="1hour">Hourly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Days of Week</Label>
            <div className="flex flex-wrap gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="flex items-center gap-1.5">
                  <Checkbox id={`day-${day}`} defaultChecked={day !== "Sat" && day !== "Sun"} />
                  <Label htmlFor={`day-${day}`} className="text-sm font-normal">
                    {day}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Maximum Notifications Per Day</Label>
            <div className="flex items-center gap-4">
              <Slider defaultValue={[20]} max={50} step={5} className="flex-1" />
              <span className="w-12 text-center">20</span>
            </div>
          </div>
        </CardContent>
        <div>
          <Button variant="outline" className="w-full">
            Apply Schedule
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <CardTitle>Notification Filtering</CardTitle>
          </div>
          <CardDescription>Configure filters for your notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Priority Level</Label>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Select priority level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Notifications</SelectItem>
                <SelectItem value="high">High Priority Only</SelectItem>
                <SelectItem value="medium">Medium Priority and Above</SelectItem>
                <SelectItem value="low">Low Priority and Above</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Filter by Category</Label>
            <div className="space-y-2">
              {[
                "Orders & Transactions",
                "Customer Activity",
                "System Alerts",
                "Security Notifications",
                "Team Collaboration",
                "Marketing Campaigns",
              ].map((category) => (
                <div key={category} className="flex items-center gap-2">
                  <Checkbox id={`category-${category}`} defaultChecked={true} />
                  <Label htmlFor={`category-${category}`} className="text-sm font-normal">
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Filter Duplicates</Label>
              <p className="text-sm text-muted-foreground">Prevent duplicate notifications</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Smart Filtering</Label>
              <p className="text-sm text-muted-foreground">Use AI to filter less relevant notifications</p>
            </div>
            <Switch defaultChecked={false} />
          </div>
        </CardContent>
        <div>
          <Button variant="outline" className="w-full">
            Apply Filters
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Notification Center</CardTitle>
          </div>
          <CardDescription>Configure your notification center</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Notification History</Label>
            <Select defaultValue="30days">
              <SelectTrigger>
                <SelectValue placeholder="Select history retention" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">7 Days</SelectItem>
                <SelectItem value="30days">30 Days</SelectItem>
                <SelectItem value="90days">90 Days</SelectItem>
                <SelectItem value="1year">1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Mark as Read on Click</Label>
              <p className="text-sm text-muted-foreground">Automatically mark notifications as read when clicked</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Show Unread Count</Label>
              <p className="text-sm text-muted-foreground">Display the number of unread notifications</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Group Similar Notifications</Label>
              <p className="text-sm text-muted-foreground">Combine similar notifications into groups</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Auto-Clear Read Notifications</Label>
              <p className="text-sm text-muted-foreground">Automatically remove read notifications after 7 days</p>
            </div>
            <Switch defaultChecked={false} />
          </div>
        </CardContent>
        <div className="flex flex-col gap-2">
          <Button className="w-full">Clear All Notifications</Button>
          <Button variant="outline" className="w-full">
            Mark All as Read
          </Button>
        </div>
      </Card>
    </div>
  )
}
