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
import { Mail, Lock, Users, Bell, Shield, Database, Key, Zap, HelpCircle, LogOut, Download, Trash2, ChevronRight, Settings, User, Building2, CreditCard, Link2, AlertCircle, FileText, MessageCircle, Sparkles, Gem, CheckCircle, Clock, Eye, Globe } from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog"

export default function SettingsPage() {
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
    setShowDeleteModal(false)
    toast({ title: "Deletion requested", description: "Your account deletion request has been submitted." })
  }
  const handleLogoutAll = () => {
    setShowLogoutModal(false)
    toast({ title: "Logged out everywhere", description: "All sessions have been logged out." })
  }
  const handleChangePassword = () => {
    setShowPasswordModal(false)
    toast({ title: "Password changed", description: "Your password has been updated." })
  }
  const handleEnable2FA = () => {
    setShow2FAModal(false)
    toast({ title: "2FA enabled", description: "Two-factor authentication is now active." })
  }
  const handleSupport = () => {
    setShowSupportModal(false)
    toast({ title: "Support request sent", description: "Our team will contact you soon." })
  }
  const handlePrivacy = () => {
    setShowPrivacyModal(false)
    toast({ title: "Privacy settings updated", description: "Your privacy preferences have been saved." })
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/50 relative overflow-hidden">
      {/* Luxury Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/20 to-emerald-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-200/20 to-teal-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-200/10 to-pink-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col gap-1 p-1 w-full">
        {/* Enhanced Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-lg">
                    <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 via-green-700 to-emerald-800 bg-clip-text text-transparent tracking-tight settings-heading">
                      Settings & Preferences
                    </h1>
                    <p className="text-sm sm:text-base lg:text-lg text-slate-600 font-medium settings-subtext">Manage your account, security, notifications, and system preferences</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                    <span>Premium Features Enabled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gem className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
                    <span>Advanced Controls</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Summary Cards - Matching Dashboard Style */}
        <div className="relative">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-4">
            <div className="w-full overflow-x-auto md:overflow-visible">
              <div className="flex md:grid md:grid-cols-4 gap-3 md:gap-4 min-w-[320px] md:min-w-0 flex-nowrap">
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Account Status</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Profile
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        {settingsSummary.accountStatus}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        <span>Last login: {settingsSummary.lastLogin}</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Current account status and activity
                    </p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <Shield className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Security Level</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Security
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        {settingsSummary.securityLevel}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <Eye className="h-3 w-3" />
                        <span>Privacy Score: {settingsSummary.privacyScore}%</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Account security and privacy level
                    </p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <Bell className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Notifications</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Alerts
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        {settingsSummary.notificationsEnabled}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        <span>channels active</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Active notification channels
                    </p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <Globe className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Integrations</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Connected
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        {settingsSummary.integrationsCount}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <Globe className="h-3 w-3" />
                        <span>connected services</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Active third-party integrations
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Main Content with Tabs */}
        <div className="relative">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-4 sm:p-6 lg:p-8">
            <Tabs value={tab} onValueChange={setTab} className="space-y-4 sm:space-y-6">
              <TabsList className="mb-4 sm:mb-6 flex flex-wrap gap-2 h-auto p-2 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl shadow-lg border border-white/20 overflow-x-auto">
                <TabsTrigger value="account" className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200 whitespace-nowrap min-h-[44px]">
                  <User className="h-3 w-3 sm:h-4 sm:w-4" />Account
                </TabsTrigger>
                <TabsTrigger value="business" className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200 whitespace-nowrap min-h-[44px]">
                  <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />Business
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200 whitespace-nowrap min-h-[44px]">
                  <Bell className="h-3 w-3 sm:h-4 sm:w-4" />Notifications
                </TabsTrigger>
                <TabsTrigger value="privacy" className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200 whitespace-nowrap min-h-[44px]">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4" />Privacy & Security
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200 whitespace-nowrap min-h-[44px]">
                  <Zap className="h-3 w-3 sm:h-4 sm:w-4" />Advanced
                </TabsTrigger>
                <TabsTrigger value="support" className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200 whitespace-nowrap min-h-[44px]">
                  <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4" />Support
                </TabsTrigger>
              </TabsList>

              {/* Account Tab */}
              <TabsContent value="account" className="space-y-4 sm:space-y-6">
                <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl font-semibold text-slate-800">Account Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1 text-slate-700">Profile Info</label>
                        <Button variant="outline" size="sm" asChild className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300 text-xs sm:text-sm min-h-[44px]">
                          <a href="/dashboard/profile">View/Edit Profile</a>
                        </Button>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1 text-slate-700">Change Password</label>
                        <Button variant="outline" size="sm" onClick={() => setShowPasswordModal(true)} className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300 text-xs sm:text-sm min-h-[44px]">
                          <Lock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />Change Password
                        </Button>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1 text-slate-700">Two-Factor Authentication</label>
                        <Switch checked={false} onCheckedChange={() => setShow2FAModal(true)} /> <span className="ml-2 text-xs text-slate-600">Enable 2FA</span>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1 text-slate-700">Email</label>
                        <Input value="user@email.com" disabled className="bg-white/50 border-slate-200 text-xs sm:text-sm min-h-[44px]" />
                        <Button variant="ghost" size="sm" className="mt-1 text-xs sm:text-sm min-h-[44px]" onClick={() => setShowSupportModal(true)}>Request Change</Button>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1 text-slate-700">Phone</label>
                        <Input value="+1 555-123-4567" disabled className="bg-white/50 border-slate-200 text-xs sm:text-sm min-h-[44px]" />
                        <Button variant="ghost" size="sm" className="mt-1 text-xs sm:text-sm min-h-[44px]" onClick={() => setShowSupportModal(true)}>Request Change</Button>
                      </div>
                      <div className="lg:col-span-2">
                        <label className="block text-xs sm:text-sm font-medium mb-1 text-slate-700">Login History</label>
                        <div className="text-xs text-slate-600">Recent logins, device info, suspicious activity alerts (coming soon)</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Business Tab */}
              <TabsContent value="business" className="space-y-4 sm:space-y-6">
                <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl font-semibold text-slate-800">Business Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1 text-slate-700">Company Info</label>
                        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/profile")} className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300 text-xs sm:text-sm min-h-[44px]">
                          <Building2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />Edit Company Info
                        </Button>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1 text-slate-700">Team Management</label>
                        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/profile?tab=team")} className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300 text-xs sm:text-sm min-h-[44px]">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />Manage Team
                        </Button>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1 text-slate-700">Subscription & Billing</label>
                        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/billing")} className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300 text-xs sm:text-sm min-h-[44px]">
                          <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />Manage Billing
                        </Button>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1 text-slate-700">Integrations</label>
                        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/integrations")} className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300 text-xs sm:text-sm min-h-[44px]">
                          <Link2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />Manage Integrations
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-4 sm:space-y-6">
                <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl font-semibold text-slate-800">Notifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1 text-slate-700">Email Preferences</label>
                        <Switch checked={emailTransactional} onCheckedChange={v => { setEmailTransactional(v); toast({ title: "Preference saved", description: "Transactional emails " + (v ? "enabled" : "disabled") }); }} /> <span className="ml-2 text-xs text-slate-600">Transactional</span>
                        <Switch className="ml-4" checked={emailMarketing} onCheckedChange={v => { setEmailMarketing(v); toast({ title: "Preference saved", description: "Marketing emails " + (v ? "enabled" : "disabled") }); }} /> <span className="ml-2 text-xs text-slate-600">Marketing</span>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1 text-slate-700">SMS Preferences</label>
                        <Switch checked={smsAlerts} onCheckedChange={v => { setSmsAlerts(v); toast({ title: "Preference saved", description: "SMS alerts " + (v ? "enabled" : "disabled") }); }} /> <span className="ml-2 text-xs text-slate-600">Alerts</span>
                        <Switch className="ml-4" checked={smsReminders} onCheckedChange={v => { setSmsReminders(v); toast({ title: "Preference saved", description: "SMS reminders " + (v ? "enabled" : "disabled") }); }} /> <span className="ml-2 text-xs text-slate-600">Reminders</span>
                      </div>
                      <div className="lg:col-span-2">
                        <label className="block text-xs sm:text-sm font-medium mb-1 text-slate-700">In-app Notifications</label>
                        <Switch checked={inAppOrders} onCheckedChange={v => { setInAppOrders(v); toast({ title: "Preference saved", description: "Order notifications " + (v ? "enabled" : "disabled") }); }} /> <span className="ml-2 text-xs text-slate-600">Orders</span>
                        <Switch className="ml-4" checked={inAppMessages} onCheckedChange={v => { setInAppMessages(v); toast({ title: "Preference saved", description: "Message notifications " + (v ? "enabled" : "disabled") }); }} /> <span className="ml-2 text-xs text-slate-600">Messages</span>
                        <Switch className="ml-4" checked={inAppSystem} onCheckedChange={v => { setInAppSystem(v); toast({ title: "Preference saved", description: "System alerts " + (v ? "enabled" : "disabled") }); }} /> <span className="ml-2 text-xs text-slate-600">System Alerts</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Privacy & Security Tab */}
              <TabsContent value="privacy" className="space-y-4 sm:space-y-6">
                <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl font-semibold text-slate-800">Privacy & Security</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1 text-slate-700">Data Export</label>
                        <Button variant="outline" size="sm" onClick={handleDownloadData} className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300 text-xs sm:text-sm min-h-[44px]">
                          <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />Download Data
                        </Button>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1 text-slate-700">Data Deletion</label>
                        <Button variant="destructive" size="sm" onClick={() => setShowDeleteModal(true)} className="bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm min-h-[44px]">
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />Request Deletion
                        </Button>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1 text-slate-700">Session Management</label>
                        <Button variant="outline" size="sm" onClick={() => setShowLogoutModal(true)} className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300 text-xs sm:text-sm min-h-[44px]">
                          <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />Log Out of All Devices
                        </Button>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1 text-slate-700">Privacy Controls</label>
                        <Button variant="outline" size="sm" onClick={() => setShowPrivacyModal(true)} className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300 text-xs sm:text-sm min-h-[44px]">
                          <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />Manage Privacy
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="space-y-4 sm:space-y-6">
                <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl font-semibold text-slate-800">Advanced</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1 text-slate-700">API Keys</label>
                        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/developer/api-keys")} className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300 text-xs sm:text-sm min-h-[44px]">
                          <Key className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />Manage API Keys
                        </Button>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1 text-slate-700">Webhooks</label>
                        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/developer/webhooks")} className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300 text-xs sm:text-sm min-h-[44px]">
                          <Link2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />Configure Webhooks
                        </Button>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1 text-slate-700">Audit Logs</label>
                        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/developer/audit-logs")} className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300 text-xs sm:text-sm min-h-[44px]">
                          <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />View Audit Logs
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Support Tab */}
              <TabsContent value="support" className="space-y-4 sm:space-y-6">
                <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl font-semibold text-slate-800">Support</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1 text-slate-700">Contact Support</label>
                        <Button variant="outline" size="sm" onClick={() => setShowSupportModal(true)} className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300 text-xs sm:text-sm min-h-[44px]">
                          <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />Open Ticket
                        </Button>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1 text-slate-700">Live Chat</label>
                        <Button variant="outline" size="sm" onClick={() => setShowSupportModal(true)} className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300 text-xs sm:text-sm min-h-[44px]">
                          <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />Start Chat
                        </Button>
                      </div>
                      <div className="lg:col-span-2">
                        <label className="block text-xs sm:text-sm font-medium mb-1 text-slate-700">Documentation</label>
                        <Button variant="outline" size="sm" asChild className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300 text-xs sm:text-sm min-h-[44px]">
                          <a href="https://docs.jewelia.com" target="_blank" rel="noopener noreferrer">
                            <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />View Docs
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Enhanced Dialogs */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-semibold text-slate-800">Change Password</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-slate-600">Enter your current and new password below.</DialogDescription>
          </DialogHeader>
          <Input type="password" placeholder="Current Password" className="mb-2 bg-white/50 border-slate-200 text-xs sm:text-sm min-h-[44px]" />
          <Input type="password" placeholder="New Password" className="mb-2 bg-white/50 border-slate-200 text-xs sm:text-sm min-h-[44px]" />
          <Input type="password" placeholder="Confirm New Password" className="mb-2 bg-white/50 border-slate-200 text-xs sm:text-sm min-h-[44px]" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordModal(false)} className="border-slate-200 text-xs sm:text-sm min-h-[44px]">Cancel</Button>
            <Button onClick={handleChangePassword} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm min-h-[44px]">Change Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={show2FAModal} onOpenChange={setShow2FAModal}>
        <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-semibold text-slate-800">Enable Two-Factor Authentication</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-slate-600">Scan the QR code with your authenticator app and enter the code below.</DialogDescription>
          </DialogHeader>
          <div className="bg-slate-100 rounded p-4 text-center mb-2">[QR Code Placeholder]</div>
          <Input type="text" placeholder="Enter 2FA code" className="mb-2 bg-white/50 border-slate-200 text-xs sm:text-sm min-h-[44px]" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShow2FAModal(false)} className="border-slate-200 text-xs sm:text-sm min-h-[44px]">Cancel</Button>
            <Button onClick={handleEnable2FA} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm min-h-[44px]">Enable 2FA</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSupportModal} onOpenChange={setShowSupportModal}>
        <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-semibold text-slate-800">Contact Support</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-slate-600">Describe your issue and our team will contact you soon.</DialogDescription>
          </DialogHeader>
          <Input type="text" placeholder="Subject" className="mb-2 bg-white/50 border-slate-200 text-xs sm:text-sm min-h-[44px]" />
          <Input type="email" placeholder="Your Email" className="mb-2 bg-white/50 border-slate-200 text-xs sm:text-sm min-h-[44px]" />
          <Input type="text" placeholder="Message" className="mb-2 bg-white/50 border-slate-200 text-xs sm:text-sm min-h-[44px]" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSupportModal(false)} className="border-slate-200 text-xs sm:text-sm min-h-[44px]">Cancel</Button>
            <Button onClick={handleSupport} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm min-h-[44px]">Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPrivacyModal} onOpenChange={setShowPrivacyModal}>
        <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-semibold text-slate-800">Privacy Controls</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-slate-600">Adjust your privacy preferences below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mb-2">
            <label className="flex items-center gap-2 text-xs sm:text-sm"><Switch /> Show profile in directory</label>
            <label className="flex items-center gap-2 text-xs sm:text-sm"><Switch /> Allow connection requests</label>
            <label className="flex items-center gap-2 text-xs sm:text-sm"><Switch /> Show business metrics</label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPrivacyModal(false)} className="border-slate-200 text-xs sm:text-sm min-h-[44px]">Cancel</Button>
            <Button onClick={handlePrivacy} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm min-h-[44px]">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-semibold text-slate-800">Request Account Deletion</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-slate-600">This action is irreversible. Are you sure you want to delete your account?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="border-slate-200 text-xs sm:text-sm min-h-[44px]">Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteAccount} className="bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm min-h-[44px]">Delete Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showLogoutModal} onOpenChange={setShowLogoutModal}>
        <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-semibold text-slate-800">Log Out of All Devices</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-slate-600">This will log you out everywhere. Continue?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogoutModal(false)} className="border-slate-200 text-xs sm:text-sm min-h-[44px]">Cancel</Button>
            <Button onClick={handleLogoutAll} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm min-h-[44px]">Log Out Everywhere</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
// FORCE DEPLOYMENT - Thu Aug 21 19:16:59 EDT 2025 - All Supabase .or() method errors fixed
