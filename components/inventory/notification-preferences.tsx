"use client"

import { useState } from "react"
import { Mail, MessageSquare, Bell, Smartphone, Users, Clock, Plus, Trash2, Settings } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Sample data for team members
const teamMembers = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex@jeweliacrm.com",
    role: "Store Manager",
    avatar: "/diverse-avatars.png",
  },
  {
    id: 2,
    name: "Sam Rodriguez",
    email: "sam@jeweliacrm.com",
    role: "Inventory Specialist",
    avatar: "/diverse-avatars.png",
  },
  {
    id: 3,
    name: "Taylor Kim",
    email: "taylor@jeweliacrm.com",
    role: "Purchasing Manager",
    avatar: "/diverse-avatars.png",
  },
  {
    id: 4,
    name: "Jordan Smith",
    email: "jordan@jeweliacrm.com",
    role: "Sales Associate",
    avatar: "/diverse-avatars.png",
  },
]

export function NotificationPreferences() {
  const [activeTab, setActiveTab] = useState("channels")

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-6">
          <TabsTrigger value="channels">Delivery Channels</TabsTrigger>
          <TabsTrigger value="recipients">Recipients</TabsTrigger>
          <TabsTrigger value="escalation">Escalation Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <CardTitle>Email Notifications</CardTitle>
                </div>
                <CardDescription>Configure email alert settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Email Alerts</Label>
                    <p className="text-sm text-muted-foreground">Send alerts via email</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>

                <div className="space-y-2">
                  <Label>Email Format</Label>
                  <Select defaultValue="html">
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="html">HTML (Rich Format)</SelectItem>
                      <SelectItem value="text">Plain Text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Digest Frequency</Label>
                  <Select defaultValue="immediate">
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="hourly">Hourly Digest</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Alert Types to Include</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <Checkbox id="email-low-stock" defaultChecked />
                      <Label htmlFor="email-low-stock" className="text-sm font-normal">
                        Low Stock
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="email-overstock" defaultChecked />
                      <Label htmlFor="email-overstock" className="text-sm font-normal">
                        Overstock
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="email-aging" defaultChecked />
                      <Label htmlFor="email-aging" className="text-sm font-normal">
                        Aging Inventory
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="email-price" defaultChecked />
                      <Label htmlFor="email-price" className="text-sm font-normal">
                        Price Changes
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="email-cert" defaultChecked />
                      <Label htmlFor="email-cert" className="text-sm font-normal">
                        Certification
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <div>
                <Button className="w-full">Save Email Settings</Button>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <CardTitle>Dashboard Alerts</CardTitle>
                </div>
                <CardDescription>Configure in-app alert settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Dashboard Alerts</Label>
                    <p className="text-sm text-muted-foreground">Show alerts in the dashboard</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>

                <div className="space-y-2">
                  <Label>Alert Display Duration</Label>
                  <div className="flex items-center gap-4">
                    <Select defaultValue="persistent">
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5sec">5 Seconds</SelectItem>
                        <SelectItem value="10sec">10 Seconds</SelectItem>
                        <SelectItem value="30sec">30 Seconds</SelectItem>
                        <SelectItem value="persistent">Persistent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Minimum Severity</Label>
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

                <div className="space-y-2">
                  <Label>Alert Types to Include</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <Checkbox id="dash-low-stock" defaultChecked />
                      <Label htmlFor="dash-low-stock" className="text-sm font-normal">
                        Low Stock
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="dash-overstock" defaultChecked />
                      <Label htmlFor="dash-overstock" className="text-sm font-normal">
                        Overstock
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="dash-aging" defaultChecked />
                      <Label htmlFor="dash-aging" className="text-sm font-normal">
                        Aging Inventory
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="dash-price" defaultChecked />
                      <Label htmlFor="dash-price" className="text-sm font-normal">
                        Price Changes
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="dash-cert" defaultChecked />
                      <Label htmlFor="dash-cert" className="text-sm font-normal">
                        Certification
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <div>
                <Button className="w-full">Save Dashboard Settings</Button>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <CardTitle>Mobile Push Notifications</CardTitle>
                </div>
                <CardDescription>Configure mobile alert settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send alerts to mobile devices</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>

                <div className="space-y-2">
                  <Label>Notification Priority</Label>
                  <Select defaultValue="high">
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Include Images</Label>
                    <p className="text-sm text-muted-foreground">Add product images to notifications</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>

                <div className="space-y-2">
                  <Label>Minimum Severity</Label>
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

                <div className="space-y-2">
                  <Label>Alert Types to Include</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <Checkbox id="push-low-stock" defaultChecked />
                      <Label htmlFor="push-low-stock" className="text-sm font-normal">
                        Low Stock
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="push-overstock" defaultChecked={false} />
                      <Label htmlFor="push-overstock" className="text-sm font-normal">
                        Overstock
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="push-aging" defaultChecked={false} />
                      <Label htmlFor="push-aging" className="text-sm font-normal">
                        Aging Inventory
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="push-price" defaultChecked />
                      <Label htmlFor="push-price" className="text-sm font-normal">
                        Price Changes
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="push-cert" defaultChecked />
                      <Label htmlFor="push-cert" className="text-sm font-normal">
                        Certification
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <div>
                <Button className="w-full">Save Mobile Settings</Button>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <CardTitle>SMS Notifications</CardTitle>
                </div>
                <CardDescription>Configure SMS alert settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable SMS Alerts</Label>
                    <p className="text-sm text-muted-foreground">Send alerts via text message</p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>

                <div className="space-y-2">
                  <Label>SMS Provider</Label>
                  <Select defaultValue="twilio">
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twilio">Twilio</SelectItem>
                      <SelectItem value="messagebird">MessageBird</SelectItem>
                      <SelectItem value="custom">Custom Provider</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Message Format</Label>
                  <Select defaultValue="concise">
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="concise">Concise</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Minimum Severity</Label>
                  <Select defaultValue="critical">
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

                <div className="space-y-2">
                  <Label>Alert Types to Include</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <Checkbox id="sms-low-stock" defaultChecked />
                      <Label htmlFor="sms-low-stock" className="text-sm font-normal">
                        Low Stock
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="sms-overstock" defaultChecked={false} />
                      <Label htmlFor="sms-overstock" className="text-sm font-normal">
                        Overstock
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="sms-aging" defaultChecked={false} />
                      <Label htmlFor="sms-aging" className="text-sm font-normal">
                        Aging Inventory
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="sms-price" defaultChecked={false} />
                      <Label htmlFor="sms-price" className="text-sm font-normal">
                        Price Changes
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="sms-cert" defaultChecked />
                      <Label htmlFor="sms-cert" className="text-sm font-normal">
                        Certification
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <div>
                <Button className="w-full">Save SMS Settings</Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recipients" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle>Alert Recipients</CardTitle>
              </div>
              <CardDescription>Configure who receives which alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Team Member</TableHead>
                    <TableHead>Low Stock</TableHead>
                    <TableHead>Overstock</TableHead>
                    <TableHead>Aging</TableHead>
                    <TableHead>Price Changes</TableHead>
                    <TableHead>Certification</TableHead>
                    <TableHead>Channels</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.role}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Checkbox defaultChecked={member.id === 1 || member.id === 2} />
                      </TableCell>
                      <TableCell>
                        <Checkbox defaultChecked={member.id === 2 || member.id === 3} />
                      </TableCell>
                      <TableCell>
                        <Checkbox defaultChecked={member.id === 1 || member.id === 3} />
                      </TableCell>
                      <TableCell>
                        <Checkbox defaultChecked={member.id === 3} />
                      </TableCell>
                      <TableCell>
                        <Checkbox defaultChecked={member.id === 1} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Bell className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Smartphone className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 flex justify-end">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Recipient
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <CardTitle>External Recipients</CardTitle>
              </div>
              <CardDescription>Configure external email recipients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input placeholder="email@example.com" className="flex-1" defaultValue="vendor@supplierco.com" />
                  <Select defaultValue="low-stock">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Alert type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low-stock">Low Stock</SelectItem>
                      <SelectItem value="overstock">Overstock</SelectItem>
                      <SelectItem value="aging">Aging Inventory</SelectItem>
                      <SelectItem value="price">Price Changes</SelectItem>
                      <SelectItem value="cert">Certification</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  <Input
                    placeholder="email@example.com"
                    className="flex-1"
                    defaultValue="support@certificationco.com"
                  />
                  <Select defaultValue="cert">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Alert type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low-stock">Low Stock</SelectItem>
                      <SelectItem value="overstock">Overstock</SelectItem>
                      <SelectItem value="aging">Aging Inventory</SelectItem>
                      <SelectItem value="price">Price Changes</SelectItem>
                      <SelectItem value="cert">Certification</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button variant="outline" className="mt-2">
                <Plus className="mr-2 h-4 w-4" />
                Add External Recipient
              </Button>
            </CardContent>
            <div>
              <Button className="w-full">Save Recipients</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="escalation" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <CardTitle>Escalation Rules</CardTitle>
              </div>
              <CardDescription>Configure when and how alerts are escalated</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="rounded-md border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">Low Stock Escalation</h3>
                      <p className="text-sm text-muted-foreground">
                        Escalate if low stock alert is not resolved within 24 hours
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Initial Alert</p>
                      <p className="text-muted-foreground">Inventory Specialist</p>
                    </div>
                    <div>
                      <p className="font-medium">First Escalation</p>
                      <p className="text-muted-foreground">Purchasing Manager (after 24h)</p>
                    </div>
                    <div>
                      <p className="font-medium">Final Escalation</p>
                      <p className="text-muted-foreground">Store Manager (after 48h)</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">Certification Expiration Escalation</h3>
                      <p className="text-sm text-muted-foreground">
                        Escalate if certification is not renewed within 30 days of first alert
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Initial Alert</p>
                      <p className="text-muted-foreground">Store Manager</p>
                    </div>
                    <div>
                      <p className="font-medium">First Escalation</p>
                      <p className="text-muted-foreground">All Team (after 15 days)</p>
                    </div>
                    <div>
                      <p className="font-medium">Final Escalation</p>
                      <p className="text-muted-foreground">External Certification Agency (after 25 days)</p>
                    </div>
                  </div>
                </div>
              </div>

              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Escalation Rule
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <CardTitle>Escalation Settings</CardTitle>
              </div>
              <CardDescription>Configure global escalation settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable Escalations</Label>
                  <p className="text-sm text-muted-foreground">Automatically escalate unresolved alerts</p>
                </div>
                <Switch defaultChecked={true} />
              </div>

              <div className="space-y-2">
                <Label>Default Escalation Time</Label>
                <div className="flex items-center gap-4">
                  <Input type="number" defaultValue="24" className="w-20" />
                  <span>hours</span>
                </div>
                <p className="text-xs text-muted-foreground">Time before an unresolved alert is escalated</p>
              </div>

              <div className="space-y-2">
                <Label>Maximum Escalation Level</Label>
                <Select defaultValue="3">
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Level</SelectItem>
                    <SelectItem value="2">2 Levels</SelectItem>
                    <SelectItem value="3">3 Levels</SelectItem>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Weekend Escalation Pause</Label>
                  <p className="text-sm text-muted-foreground">Pause escalation timers on weekends</p>
                </div>
                <Switch defaultChecked={true} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notification on Escalation</Label>
                  <p className="text-sm text-muted-foreground">Notify all parties when an alert is escalated</p>
                </div>
                <Switch defaultChecked={true} />
              </div>
            </CardContent>
            <div>
              <Button className="w-full">Save Escalation Settings</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
