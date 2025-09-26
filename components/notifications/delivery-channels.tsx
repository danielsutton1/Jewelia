import { Mail, MessageSquare, Smartphone, Slack } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function DeliveryChannels() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle>Email Notifications</CardTitle>
          </div>
          <CardDescription>Configure email notification settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Enable Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input defaultValue="john.doe@example.com" />
          </div>

          <div className="space-y-2">
            <Label>Email Format</Label>
            <Select defaultValue="html">
              <SelectTrigger>
                <SelectValue placeholder="Select email format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="text">Plain Text</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Email Frequency</Label>
            <Select defaultValue="immediate">
              <SelectTrigger>
                <SelectValue placeholder="Select email frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="hourly">Hourly Digest</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
                <SelectItem value="weekly">Weekly Digest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Include Attachments</Label>
              <p className="text-sm text-muted-foreground">Include relevant files in email notifications</p>
            </div>
            <Switch defaultChecked={true} />
          </div>
        </CardContent>
        <div>
          <Button variant="outline" className="w-full">
            Test Email Notification
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <CardTitle>Mobile Push Notifications</CardTitle>
          </div>
          <CardDescription>Configure push notification settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Enable Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications on your mobile device</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="space-y-2">
            <Label>Notification Priority</Label>
            <Select defaultValue="high">
              <SelectTrigger>
                <SelectValue placeholder="Select notification priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Sound Alerts</Label>
              <p className="text-sm text-muted-foreground">Play sound for push notifications</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Vibration</Label>
              <p className="text-sm text-muted-foreground">Vibrate device for push notifications</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Do Not Disturb</Label>
              <p className="text-sm text-muted-foreground">Silence notifications during specified hours</p>
            </div>
            <Switch defaultChecked={false} />
          </div>
        </CardContent>
        <div>
          <Button variant="outline" className="w-full">
            Test Push Notification
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <CardTitle>SMS Notifications</CardTitle>
          </div>
          <CardDescription>Configure SMS notification settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Enable SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
            </div>
            <Switch defaultChecked={false} />
          </div>

          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input placeholder="+1 (555) 123-4567" />
          </div>

          <div className="space-y-2">
            <Label>SMS Frequency</Label>
            <Select defaultValue="critical">
              <SelectTrigger>
                <SelectValue placeholder="Select SMS frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Notifications</SelectItem>
                <SelectItem value="important">Important Only</SelectItem>
                <SelectItem value="critical">Critical Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Include Short Links</Label>
              <p className="text-sm text-muted-foreground">Include shortened URLs in SMS messages</p>
            </div>
            <Switch defaultChecked={true} />
          </div>
        </CardContent>
        <div>
          <Button variant="outline" className="w-full">
            Test SMS Notification
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Slack className="h-5 w-5 text-primary" />
            <CardTitle>Integration Notifications</CardTitle>
          </div>
          <CardDescription>Configure notifications for third-party integrations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Slack Integration</Label>
              <p className="text-sm text-muted-foreground">Send notifications to Slack channels</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="space-y-2">
            <Label>Slack Workspace</Label>
            <Input defaultValue="acme-inc" />
          </div>

          <div className="space-y-2">
            <Label>Default Channel</Label>
            <Input defaultValue="#notifications" />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Microsoft Teams</Label>
              <p className="text-sm text-muted-foreground">Send notifications to Microsoft Teams</p>
            </div>
            <Switch defaultChecked={false} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Discord</Label>
              <p className="text-sm text-muted-foreground">Send notifications to Discord channels</p>
            </div>
            <Switch defaultChecked={false} />
          </div>
        </CardContent>
        <div>
          <Button variant="outline" className="w-full">
            Configure Webhooks
          </Button>
        </div>
      </Card>
    </div>
  )
}
