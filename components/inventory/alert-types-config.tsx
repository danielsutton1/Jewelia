"use client"
import { PackageOpen, Clock, DollarSign, FileCheck, Settings } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export function AlertTypesConfig() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PackageOpen className="h-5 w-5 text-primary" />
              <CardTitle>Low Stock Threshold</CardTitle>
            </div>
            <CardDescription>Configure alerts for low inventory levels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Enable Alerts</Label>
                <p className="text-sm text-muted-foreground">Receive alerts when stock is low</p>
              </div>
              <Switch defaultChecked={true} />
            </div>

            <div className="space-y-2">
              <Label>Default Threshold Percentage</Label>
              <div className="flex items-center gap-4">
                <Slider defaultValue={[20]} max={50} step={5} className="flex-1" />
                <span className="w-12 text-center">20%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Alert when stock falls below this percentage of target inventory level
              </p>
            </div>

            <div className="space-y-2">
              <Label>Minimum Quantity Override</Label>
              <Input type="number" placeholder="3" />
              <p className="text-xs text-muted-foreground">Minimum number of items regardless of percentage</p>
            </div>

            <div className="space-y-2">
              <Label>Alert Severity</Label>
              <Select defaultValue="warning">
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Auto-Generate Purchase Orders</Label>
                <p className="text-sm text-muted-foreground">Create POs when threshold is reached</p>
              </div>
              <Switch defaultChecked={false} />
            </div>
          </CardContent>
          <div>
            <Button className="w-full">Save Configuration</Button>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PackageOpen className="h-5 w-5 text-primary" />
              <CardTitle>Overstock Warning</CardTitle>
            </div>
            <CardDescription>Configure alerts for excess inventory</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Enable Alerts</Label>
                <p className="text-sm text-muted-foreground">Receive alerts when stock is excessive</p>
              </div>
              <Switch defaultChecked={true} />
            </div>

            <div className="space-y-2">
              <Label>Overstock Threshold Percentage</Label>
              <div className="flex items-center gap-4">
                <Slider defaultValue={[150]} min={100} max={300} step={10} className="flex-1" />
                <span className="w-12 text-center">150%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Alert when stock exceeds this percentage of target inventory level
              </p>
            </div>

            <div className="space-y-2">
              <Label>Maximum Quantity Override</Label>
              <Input type="number" placeholder="25" />
              <p className="text-xs text-muted-foreground">Maximum number of items regardless of percentage</p>
            </div>

            <div className="space-y-2">
              <Label>Alert Severity</Label>
              <Select defaultValue="info">
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Suggest Promotions</Label>
                <p className="text-sm text-muted-foreground">Recommend marketing for overstocked items</p>
              </div>
              <Switch defaultChecked={true} />
            </div>
          </CardContent>
          <div>
            <Button className="w-full">Save Configuration</Button>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle>Aging Inventory</CardTitle>
            </div>
            <CardDescription>Configure alerts for slow-moving inventory</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Enable Alerts</Label>
                <p className="text-sm text-muted-foreground">Receive alerts for aging inventory</p>
              </div>
              <Switch defaultChecked={true} />
            </div>

            <div className="space-y-2">
              <Label>Age Threshold (Days)</Label>
              <Input type="number" placeholder="90" />
              <p className="text-xs text-muted-foreground">Alert when items remain in inventory for this many days</p>
            </div>

            <div className="space-y-2">
              <Label>Secondary Threshold (Days)</Label>
              <Input type="number" placeholder="180" />
              <p className="text-xs text-muted-foreground">Escalate alert when items remain for this many days</p>
            </div>

            <div className="space-y-2">
              <Label>Alert Severity</Label>
              <Select defaultValue="warning">
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Suggest Price Adjustments</Label>
                <p className="text-sm text-muted-foreground">Recommend discounts for aging items</p>
              </div>
              <Switch defaultChecked={true} />
            </div>
          </CardContent>
          <div>
            <Button className="w-full">Save Configuration</Button>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <CardTitle>Price Changes</CardTitle>
            </div>
            <CardDescription>Configure alerts for market price fluctuations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Enable Alerts</Label>
                <p className="text-sm text-muted-foreground">Receive alerts for price changes</p>
              </div>
              <Switch defaultChecked={true} />
            </div>

            <div className="space-y-2">
              <Label>Price Change Threshold (%)</Label>
              <div className="flex items-center gap-4">
                <Slider defaultValue={[5]} max={20} step={1} className="flex-1" />
                <span className="w-12 text-center">5%</span>
              </div>
              <p className="text-xs text-muted-foreground">Alert when market price changes by this percentage</p>
            </div>

            <div className="space-y-2">
              <Label>Check Frequency</Label>
              <Select defaultValue="daily">
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Alert Severity</Label>
              <Select defaultValue="info">
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Auto-Update Retail Prices</Label>
                <p className="text-sm text-muted-foreground">Automatically adjust prices based on market</p>
              </div>
              <Switch defaultChecked={false} />
            </div>
          </CardContent>
          <div>
            <Button className="w-full">Save Configuration</Button>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-primary" />
              <CardTitle>Certification Expiration</CardTitle>
            </div>
            <CardDescription>Configure alerts for expiring certifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Enable Alerts</Label>
                <p className="text-sm text-muted-foreground">Receive alerts for expiring certifications</p>
              </div>
              <Switch defaultChecked={true} />
            </div>

            <div className="space-y-2">
              <Label>First Alert (Days Before)</Label>
              <Input type="number" placeholder="60" />
              <p className="text-xs text-muted-foreground">First alert this many days before expiration</p>
            </div>

            <div className="space-y-2">
              <Label>Follow-up Alerts</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox id="alert-30" defaultChecked />
                  <Label htmlFor="alert-30" className="text-sm font-normal">
                    30 days before
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="alert-14" defaultChecked />
                  <Label htmlFor="alert-14" className="text-sm font-normal">
                    14 days before
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="alert-7" defaultChecked />
                  <Label htmlFor="alert-7" className="text-sm font-normal">
                    7 days before
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Alert Severity</Label>
              <Select defaultValue="warning">
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Auto-Schedule Renewal</Label>
                <p className="text-sm text-muted-foreground">Create tasks for certification renewal</p>
              </div>
              <Switch defaultChecked={true} />
            </div>
          </CardContent>
          <div>
            <Button className="w-full">Save Configuration</Button>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <CardTitle>Global Alert Settings</CardTitle>
            </div>
            <CardDescription>Configure settings that apply to all alert types</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Master Alert Switch</Label>
                <p className="text-sm text-muted-foreground">Enable or disable all alerts</p>
              </div>
              <Switch defaultChecked={true} />
            </div>

            <div className="space-y-2">
              <Label>Alert Retention Period</Label>
              <Select defaultValue="90days">
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30days">30 Days</SelectItem>
                  <SelectItem value="90days">90 Days</SelectItem>
                  <SelectItem value="180days">180 Days</SelectItem>
                  <SelectItem value="1year">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Alert Check Frequency</Label>
              <Select defaultValue="daily">
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Auto-Resolve Alerts</Label>
                <p className="text-sm text-muted-foreground">Automatically resolve alerts when conditions are met</p>
              </div>
              <Switch defaultChecked={true} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Alert Analytics</Label>
                <p className="text-sm text-muted-foreground">Track and analyze alert patterns</p>
              </div>
              <Switch defaultChecked={true} />
            </div>
          </CardContent>
          <div>
            <Button className="w-full">Save Global Settings</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
