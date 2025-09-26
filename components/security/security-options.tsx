import { Shield, Users, Bell, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SecurityOptions() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Authentication</CardTitle>
          </div>
          <CardDescription>Configure how users authenticate with your system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">Require 2FA for all admin accounts</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Single Sign-On (SSO)</Label>
              <p className="text-sm text-muted-foreground">Enable SSO with your identity provider</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="space-y-2">
            <Label>Password Policy</Label>
            <Select defaultValue="strong">
              <SelectTrigger>
                <SelectValue placeholder="Select password policy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic (8+ characters)</SelectItem>
                <SelectItem value="medium">Medium (8+ chars, mixed case)</SelectItem>
                <SelectItem value="strong">Strong (12+ chars, mixed case, numbers, symbols)</SelectItem>
                <SelectItem value="custom">Custom Policy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Password Expiration</Label>
              <p className="text-sm text-muted-foreground">Force password reset every 90 days</p>
            </div>
            <Switch defaultChecked={false} />
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            Advanced Settings
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Access Control</CardTitle>
          </div>
          <CardDescription>Manage user roles and permissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Role-Based Access Control</Label>
              <p className="text-sm text-muted-foreground">Enable granular permissions based on roles</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">IP Restrictions</Label>
              <p className="text-sm text-muted-foreground">Limit access to specific IP addresses</p>
            </div>
            <Switch defaultChecked={false} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Session Timeout</Label>
              <p className="text-sm text-muted-foreground">Automatically log out inactive users</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="space-y-2">
            <Label>Session Timeout Duration</Label>
            <Select defaultValue="30">
              <SelectTrigger>
                <SelectValue placeholder="Select timeout duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="240">4 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            Manage Roles
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Security Alerts</CardTitle>
          </div>
          <CardDescription>Configure security notifications and alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Failed Login Attempts</Label>
              <p className="text-sm text-muted-foreground">Alert on multiple failed login attempts</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">New Device Logins</Label>
              <p className="text-sm text-muted-foreground">Alert when users log in from new devices</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Permission Changes</Label>
              <p className="text-sm text-muted-foreground">Alert when user permissions are modified</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Data Export Alerts</Label>
              <p className="text-sm text-muted-foreground">Alert when large amounts of data are exported</p>
            </div>
            <Switch defaultChecked={true} />
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            Configure Alert Recipients
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <CardTitle>Threat Protection</CardTitle>
          </div>
          <CardDescription>Configure protection against security threats</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Brute Force Protection</Label>
              <p className="text-sm text-muted-foreground">Block IPs after multiple failed login attempts</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Malware Scanning</Label>
              <p className="text-sm text-muted-foreground">Scan uploaded files for malware</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">CSRF Protection</Label>
              <p className="text-sm text-muted-foreground">Protect against cross-site request forgery</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">XSS Protection</Label>
              <p className="text-sm text-muted-foreground">Protect against cross-site scripting attacks</p>
            </div>
            <Switch defaultChecked={true} />
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            Advanced Threat Settings
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
