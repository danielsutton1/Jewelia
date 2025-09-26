"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  Settings, 
  Clock, 
  Bell, 
  Save, 
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Timer,
  Users,
  Calendar,
  Zap,
  Target
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface TimeTrackingSettings {
  autoStart: boolean
  autoPause: boolean
  breakReminders: boolean
  breakDuration: number
  workSessionLength: number
  overtimeThreshold: number
  roundingRules: string
  timezone: string
  notifications: {
    breakReminder: boolean
    overtimeAlert: boolean
    goalAchievement: boolean
    weeklyReport: boolean
  }
  goals: {
    dailyHours: number
    weeklyHours: number
    efficiency: number
  }
  integrations: {
    calendar: boolean
    slack: boolean
    email: boolean
  }
}

const defaultSettings: TimeTrackingSettings = {
  autoStart: false,
  autoPause: true,
  breakReminders: true,
  breakDuration: 15,
  workSessionLength: 90,
  overtimeThreshold: 8,
  roundingRules: "nearest_15",
  timezone: "America/New_York",
  notifications: {
    breakReminder: true,
    overtimeAlert: true,
    goalAchievement: true,
    weeklyReport: false,
  },
  goals: {
    dailyHours: 8,
    weeklyHours: 40,
    efficiency: 90,
  },
  integrations: {
    calendar: true,
    slack: false,
    email: true,
  },
}

export function TimeTrackingSettings() {
  const [settings, setSettings] = React.useState<TimeTrackingSettings>(defaultSettings)
  const [isSaving, setIsSaving] = React.useState(false)
  const [hasChanges, setHasChanges] = React.useState(false)

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleNestedSettingChange = (parentKey: keyof TimeTrackingSettings, childKey: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [parentKey]: {
        ...(prev[parentKey] as any),
        [childKey]: value
      }
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setHasChanges(false)
      toast({
        title: "Settings Saved",
        description: "Your time tracking settings have been updated successfully."
      })
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setSettings(defaultSettings)
    setHasChanges(true)
    toast({
      title: "Settings Reset",
      description: "Settings have been reset to default values."
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Time Tracking Settings</h2>
          <p className="text-muted-foreground">
            Configure your time tracking preferences and automation rules
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Timer Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Timer Settings
            </CardTitle>
            <CardDescription>Configure how the timer behaves</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-start Timer</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically start timer when selecting a work order
                </p>
              </div>
              <Switch
                checked={settings.autoStart}
                onCheckedChange={(checked) => handleSettingChange("autoStart", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-pause on Inactivity</Label>
                <p className="text-sm text-muted-foreground">
                  Pause timer after 5 minutes of inactivity
                </p>
              </div>
              <Switch
                checked={settings.autoPause}
                onCheckedChange={(checked) => handleSettingChange("autoPause", checked)}
              />
            </div>

            <div className="space-y-2">
              <Label>Break Duration (minutes)</Label>
              <Select 
                value={settings.breakDuration.toString()} 
                onValueChange={(value) => handleSettingChange("breakDuration", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="20">20 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Work Session Length (minutes)</Label>
              <Select 
                value={settings.workSessionLength.toString()} 
                onValueChange={(value) => handleSettingChange("workSessionLength", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                  <SelectItem value="120">120 minutes</SelectItem>
                  <SelectItem value="180">180 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Overtime Threshold (hours)</Label>
              <Input
                type="number"
                value={settings.overtimeThreshold}
                onChange={(e) => handleSettingChange("overtimeThreshold", parseFloat(e.target.value))}
                min="0"
                step="0.5"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Break Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Remind me to take breaks
                </p>
              </div>
              <Switch
                checked={settings.notifications.breakReminder}
                onCheckedChange={(checked) => handleNestedSettingChange("notifications", "breakReminder", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Overtime Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Alert when approaching overtime
                </p>
              </div>
              <Switch
                checked={settings.notifications.overtimeAlert}
                onCheckedChange={(checked) => handleNestedSettingChange("notifications", "overtimeAlert", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Goal Achievement</Label>
                <p className="text-sm text-muted-foreground">
                  Notify when goals are met
                </p>
              </div>
              <Switch
                checked={settings.notifications.goalAchievement}
                onCheckedChange={(checked) => handleNestedSettingChange("notifications", "goalAchievement", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">
                  Send weekly summary reports
                </p>
              </div>
              <Switch
                checked={settings.notifications.weeklyReport}
                onCheckedChange={(checked) => handleNestedSettingChange("notifications", "weeklyReport", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Goals and Targets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Goals & Targets
            </CardTitle>
            <CardDescription>Set your productivity goals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Daily Hours Goal</Label>
              <Input
                type="number"
                value={settings.goals.dailyHours}
                onChange={(e) => handleNestedSettingChange("goals", "dailyHours", parseFloat(e.target.value))}
                min="0"
                step="0.5"
              />
            </div>

            <div className="space-y-2">
              <Label>Weekly Hours Goal</Label>
              <Input
                type="number"
                value={settings.goals.weeklyHours}
                onChange={(e) => handleNestedSettingChange("goals", "weeklyHours", parseFloat(e.target.value))}
                min="0"
                step="0.5"
              />
            </div>

            <div className="space-y-2">
              <Label>Efficiency Target (%)</Label>
              <Input
                type="number"
                value={settings.goals.efficiency}
                onChange={(e) => handleNestedSettingChange("goals", "efficiency", parseFloat(e.target.value))}
                min="0"
                max="100"
                step="1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Integrations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Integrations
            </CardTitle>
            <CardDescription>Connect with other tools and services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Calendar Integration</Label>
                <p className="text-sm text-muted-foreground">
                  Sync with Google Calendar
                </p>
              </div>
              <Switch
                checked={settings.integrations.calendar}
                onCheckedChange={(checked) => handleNestedSettingChange("integrations", "calendar", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Slack Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send updates to Slack
                </p>
              </div>
              <Switch
                checked={settings.integrations.slack}
                onCheckedChange={(checked) => handleNestedSettingChange("integrations", "slack", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Reports</Label>
                <p className="text-sm text-muted-foreground">
                  Send reports via email
                </p>
              </div>
              <Switch
                checked={settings.integrations.email}
                onCheckedChange={(checked) => handleNestedSettingChange("integrations", "email", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Time Tracking Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time Tracking Rules
            </CardTitle>
            <CardDescription>Configure time rounding and validation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Time Rounding Rules</Label>
              <Select 
                value={settings.roundingRules} 
                onValueChange={(value) => handleSettingChange("roundingRules", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nearest_5">Nearest 5 minutes</SelectItem>
                  <SelectItem value="nearest_15">Nearest 15 minutes</SelectItem>
                  <SelectItem value="nearest_30">Nearest 30 minutes</SelectItem>
                  <SelectItem value="up_5">Round up to 5 minutes</SelectItem>
                  <SelectItem value="down_5">Round down to 5 minutes</SelectItem>
                  <SelectItem value="no_rounding">No rounding</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select 
                value={settings.timezone} 
                onValueChange={(value) => handleSettingChange("timezone", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Break Reminders</Label>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Enable break reminders</span>
                <Switch
                  checked={settings.breakReminders}
                  onCheckedChange={(checked) => handleSettingChange("breakReminders", checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Advanced Settings
            </CardTitle>
            <CardDescription>Advanced configuration options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Custom Notes Template</Label>
              <Textarea
                placeholder="Enter a template for time entry notes..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Idle Timeout (minutes)</Label>
              <Input
                type="number"
                placeholder="5"
                min="1"
                max="60"
              />
            </div>

            <div className="space-y-2">
              <Label>Auto-save Interval (minutes)</Label>
              <Input
                type="number"
                placeholder="5"
                min="1"
                max="30"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Settings Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Timer Settings</p>
                <p className="text-sm text-green-600">Configured and active</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <Bell className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">Notifications</p>
                <p className="text-sm text-blue-600">3 of 4 enabled</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">Integrations</p>
                <p className="text-sm text-amber-600">2 of 3 connected</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
 