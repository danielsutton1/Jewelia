"use client"

import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Mail, Lock, Users, Bell, Shield, Database, Key, Zap, HelpCircle, LogOut, Download, Trash2, ChevronRight, Settings, User, Building2, CreditCard, Link2, AlertCircle, FileText, MessageCircle, Sparkles, Gem, CheckCircle, Clock, Eye, Globe, Plus } from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog"

export default function DashboardSettingsPage() {
  const [tab, setTab] = useState("account")
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [showSupportModal, setShowSupportModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Notification toggles (mock state)
  const [emailTransactional, setEmailTransactional] = useState(true)
  const [emailMarketing, setEmailMarketing] = useState(false)
  const [smsAlerts, setSmsAlerts] = useState(true)
  const [smsReminders, setSmsReminders] = useState(false)
  const [inAppOrders, setInAppOrders] = useState(true)
  const [inAppMessages, setInAppMessages] = useState(true)
  const [inAppSystem, setInAppSystem] = useState(true)

  // Settings summary data
  const settingsSummary = {
    accountStatus: "Active",
    securityLevel: "High",
    notificationsEnabled: 5,
    integrationsCount: 3,
    lastLogin: "2 hours ago",
    dataUsage: "2.3 GB",
    privacyScore: 95
  }

  // Handlers
  const handleDownloadData = () => {
    toast({ title: "Data export started", description: "Your data will be downloaded soon." })
  }

  const handleDeleteAccount = () => {
    toast({ title: "Account deletion requested", description: "We'll process your request within 24 hours." })
    setShowDeleteModal(false)
  }

  const handleLogout = () => {
    toast({ title: "Logged out", description: "You have been successfully logged out." })
    setShowLogoutModal(false)
    router.push("/auth/login")
  }

  const handleSaveSettings = () => {
    toast({ title: "Settings saved", description: "Your settings have been updated successfully." })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Settings & Configuration</h1>
          </div>
          <p className="text-gray-600">Manage your account settings, preferences, and system configuration</p>
        </div>

        {/* Settings Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Account Status</p>
                  <p className="text-2xl font-bold text-green-600">{settingsSummary.accountStatus}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Security Level</p>
                  <p className="text-2xl font-bold text-blue-600">{settingsSummary.securityLevel}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Notifications</p>
                  <p className="text-2xl font-bold text-purple-600">{settingsSummary.notificationsEnabled}</p>
                </div>
                <Bell className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Integrations</p>
                  <p className="text-2xl font-bold text-orange-600">{settingsSummary.integrationsCount}</p>
                </div>
                <Link2 className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Settings Tabs */}
        <Card>
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>

            {/* Account Settings */}
            <TabsContent value="account" className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <Input defaultValue="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <Input defaultValue="john.doe@jewelia.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                      <Input defaultValue="Jewelia CRM" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <Input defaultValue="+1 (555) 123-4567" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Profile Visibility</p>
                        <p className="text-sm text-gray-600">Make your profile visible to other users</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-600">Receive email updates about your account</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button onClick={handleSaveSettings}>Save Changes</Button>
                  <Button variant="outline">Cancel</Button>
                </div>
              </div>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security" className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Password & Authentication</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">Password</p>
                          <p className="text-sm text-gray-600">Last changed 30 days ago</p>
                        </div>
                      </div>
                      <Button variant="outline" onClick={() => setShowPasswordModal(true)}>
                        Change
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-600">Add an extra layer of security</p>
                        </div>
                      </div>
                      <Button variant="outline" onClick={() => setShow2FAModal(true)}>
                        Enable
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Active Sessions</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Globe className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium">Current Session</p>
                          <p className="text-sm text-gray-600">Chrome on macOS • New York, NY</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Notifications Settings */}
            <TabsContent value="notifications" className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Email Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Transactional Emails</p>
                        <p className="text-sm text-gray-600">Order confirmations, receipts, etc.</p>
                      </div>
                      <Switch checked={emailTransactional} onCheckedChange={setEmailTransactional} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Marketing Emails</p>
                        <p className="text-sm text-gray-600">Product updates, promotions, etc.</p>
                      </div>
                      <Switch checked={emailMarketing} onCheckedChange={setEmailMarketing} />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">SMS Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Security Alerts</p>
                        <p className="text-sm text-gray-600">Login attempts, password changes</p>
                      </div>
                      <Switch checked={smsAlerts} onCheckedChange={setSmsAlerts} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Order Reminders</p>
                        <p className="text-sm text-gray-600">Payment reminders, delivery updates</p>
                      </div>
                      <Switch checked={smsReminders} onCheckedChange={setSmsReminders} />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">In-App Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Order Updates</p>
                        <p className="text-sm text-gray-600">New orders, status changes</p>
                      </div>
                      <Switch checked={inAppOrders} onCheckedChange={setInAppOrders} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Messages</p>
                        <p className="text-sm text-gray-600">Customer messages, team communications</p>
                      </div>
                      <Switch checked={inAppMessages} onCheckedChange={setInAppMessages} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">System Updates</p>
                        <p className="text-sm text-gray-600">Maintenance, feature announcements</p>
                      </div>
                      <Switch checked={inAppSystem} onCheckedChange={setInAppSystem} />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button onClick={handleSaveSettings}>Save Preferences</Button>
                  <Button variant="outline">Reset to Default</Button>
                </div>
              </div>
            </TabsContent>

            {/* Integrations Settings */}
            <TabsContent value="integrations" className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Connected Services</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Mail className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Email Service</p>
                          <p className="text-sm text-gray-600">Gmail Integration</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Connected</Badge>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Database className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Database</p>
                          <p className="text-sm text-gray-600">Supabase</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Connected</Badge>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Zap className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">Payment Gateway</p>
                          <p className="text-sm text-gray-600">Stripe</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Connected</Badge>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Plus className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">Add Integration</p>
                          <p className="text-sm text-gray-600">Connect new service</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Connect</Button>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Privacy Settings */}
            <TabsContent value="privacy" className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Data Privacy</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Data Collection</p>
                        <p className="text-sm text-gray-600">Allow collection of usage analytics</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Marketing Communications</p>
                        <p className="text-sm text-gray-600">Receive promotional content</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Third-Party Sharing</p>
                        <p className="text-sm text-gray-600">Share data with trusted partners</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Data Management</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Download Your Data</p>
                        <p className="text-sm text-gray-600">Export all your data in a portable format</p>
                      </div>
                      <Button variant="outline" onClick={handleDownloadData}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Billing Settings */}
            <TabsContent value="billing" className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Billing Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Billing Address</label>
                      <Input defaultValue="123 Business St, Suite 100" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City, State ZIP</label>
                      <Input defaultValue="New York, NY 10001" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <CreditCard className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-gray-600">Expires 12/25</p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-auto">
                      Update
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Subscription</h3>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Professional Plan</p>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <p className="text-sm text-gray-600">$99/month • Next billing: March 15, 2024</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Danger Zone */}
        <Card className="mt-8 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
              <div>
                <p className="font-medium text-red-600">Delete Account</p>
                <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
              </div>
              <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input type="password" placeholder="Current password" />
            <Input type="password" placeholder="New password" />
            <Input type="password" placeholder="Confirm new password" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowPasswordModal(false)}>
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={show2FAModal} onOpenChange={setShow2FAModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Add an extra layer of security to your account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              We'll send you a verification code via SMS or email to complete the setup.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShow2FAModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShow2FAModal(false)}>
              Enable 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-red-600">
              Type "DELETE" to confirm account deletion.
            </p>
            <Input placeholder="Type DELETE to confirm" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
