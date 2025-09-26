"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { Plus, Settings, Mail, CheckCircle, XCircle, Clock, Eye, Trash2, Edit, Copy, ExternalLink } from "lucide-react"

interface EmailIntegration {
  id: string
  email_address: string
  email_type: string
  is_active: boolean
  auto_process: boolean
  require_confirmation: boolean
  notification_email?: string
  created_at: string
  updated_at: string
}

interface ProcessingLog {
  id: string
  sender_email: string
  subject: string
  email_type: string
  processing_status: string
  ai_confidence_score: number
  created_record_type?: string
  created_record_id?: string
  error_message?: string
  extracted_data?: any
  created_at: string
  email_integration: {
    email_address: string
    email_type: string
  }
}

export default function EmailIntegrationPage() {
  const [integrations, setIntegrations] = useState<EmailIntegration[]>([])
  const [processingLogs, setProcessingLogs] = useState<ProcessingLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingIntegration, setEditingIntegration] = useState<EmailIntegration | null>(null)
  const [formData, setFormData] = useState({
    email_address: '',
    email_type: 'quotes',
    is_active: true,
    auto_process: true,
    require_confirmation: false,
    notification_email: ''
  })

  useEffect(() => {
    loadIntegrations()
    loadProcessingLogs()
  }, [])

  const loadIntegrations = async () => {
    try {
      const response = await fetch('/api/email-integration')
      const result = await response.json()
      
      if (result.success) {
        setIntegrations(result.data)
      } else {
        toast.error('Failed to load email integrations')
      }
    } catch (error) {
      toast.error('Error loading email integrations')
    } finally {
      setLoading(false)
    }
  }

  const loadProcessingLogs = async () => {
    try {
      const response = await fetch('/api/email-processing-logs?limit=50')
      const result = await response.json()
      
      if (result.success) {
        setProcessingLogs(result.data)
      }
    } catch (error) {
      console.error('Error loading processing logs:', error)
    }
  }

  const handleCreateIntegration = async () => {
    try {
      const response = await fetch('/api/email-integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success('Email integration created successfully')
        setShowCreateDialog(false)
        resetForm()
        loadIntegrations()
      } else {
        toast.error(result.error || 'Failed to create email integration')
      }
    } catch (error) {
      toast.error('Error creating email integration')
    }
  }

  const handleUpdateIntegration = async () => {
    if (!editingIntegration) return

    try {
      const response = await fetch('/api/email-integration', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingIntegration.id,
          ...formData
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success('Email integration updated successfully')
        setEditingIntegration(null)
        resetForm()
        loadIntegrations()
      } else {
        toast.error(result.error || 'Failed to update email integration')
      }
    } catch (error) {
      toast.error('Error updating email integration')
    }
  }

  const handleDeleteIntegration = async (id: string) => {
    if (!confirm('Are you sure you want to delete this email integration?')) return

    try {
      const response = await fetch(`/api/email-integration?id=${id}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success('Email integration deleted successfully')
        loadIntegrations()
      } else {
        toast.error(result.error || 'Failed to delete email integration')
      }
    } catch (error) {
      toast.error('Error deleting email integration')
    }
  }

  const resetForm = () => {
    setFormData({
      email_address: '',
      email_type: 'quotes',
      is_active: true,
      auto_process: true,
      require_confirmation: false,
      notification_email: ''
    })
  }

  const openEditDialog = (integration: EmailIntegration) => {
    setEditingIntegration(integration)
    setFormData({
      email_address: integration.email_address,
      email_type: integration.email_type || 'quotes',
      is_active: integration.is_active,
      auto_process: integration.auto_process,
      require_confirmation: integration.require_confirmation,
      notification_email: integration.notification_email || ''
    })
  }

  const copyEmailAddress = (email: string) => {
    navigator.clipboard.writeText(email)
    toast.success('Email address copied to clipboard')
  }

  const getStatusIcon = (status: string, recordType?: string) => {
    if (recordType === 'security_alert') {
      return <XCircle className="h-4 w-4 text-red-600" />
    }
    
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      failed: 'destructive',
      processing: 'secondary',
      pending: 'outline'
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading email integrations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Integration</h1>
          <p className="text-gray-600">Configure email addresses to automatically process incoming emails</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Email Integration
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Email Integration</DialogTitle>
              <DialogDescription>
                Set up an email address that will automatically process incoming emails
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email_address">Email Address</Label>
                <Input
                  id="email_address"
                  type="email"
                  placeholder="info@yourcompany.com"
                  value={formData.email_address}
                  onChange={(e) => setFormData({ ...formData, email_address: e.target.value })}
                />
                <p className="text-sm text-gray-600 mt-1">
                  This email will receive ALL types of communications. Our AI will automatically determine the type and route to the appropriate system.
                </p>
              </div>
              <div>
                <Label htmlFor="notification_email">Notification Email (Optional)</Label>
                <Input
                  id="notification_email"
                  type="email"
                  placeholder="admin@yourcompany.com"
                  value={formData.notification_email}
                  onChange={(e) => setFormData({ ...formData, notification_email: e.target.value })}
                />
                <p className="text-sm text-gray-600 mt-1">
                  You'll receive notifications when emails are processed and records are created.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Active</Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto_process">Auto Process</Label>
                  <Switch
                    id="auto_process"
                    checked={formData.auto_process}
                    onCheckedChange={(checked) => setFormData({ ...formData, auto_process: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="require_confirmation">Require Confirmation</Label>
                  <Switch
                    id="require_confirmation"
                    checked={formData.require_confirmation}
                    onCheckedChange={(checked) => setFormData({ ...formData, require_confirmation: checked })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateIntegration}>
                Create Integration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="integrations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="integrations">Email Integrations</TabsTrigger>
          <TabsTrigger value="logs">Processing Logs</TabsTrigger>
          <TabsTrigger value="setup">Setup Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          {integrations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Mail className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Email Integrations</h3>
                <p className="text-gray-600 text-center mb-4">
                  Set up email integrations to automatically process incoming emails
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Integration
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {integrations.map((integration) => (
                <Card key={integration.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <div>
                          <CardTitle className="text-lg">{integration.email_address}</CardTitle>
                          <CardDescription>
                            {integration.email_type} • {integration.is_active ? 'Active' : 'Inactive'}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyEmailAddress(integration.email_address)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(integration)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteIntegration(integration.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <Label className="text-gray-500">Type</Label>
                        <p className="font-medium capitalize">{integration.email_type}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Auto Process</Label>
                        <p className="font-medium">{integration.auto_process ? 'Yes' : 'No'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Confirmation</Label>
                        <p className="font-medium">{integration.require_confirmation ? 'Required' : 'Not Required'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Created</Label>
                        <p className="font-medium">{new Date(integration.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Processing Logs</CardTitle>
              <CardDescription>
                Recent email processing activity and results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {processingLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No processing logs yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processingLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(log.processing_status, log.created_record_type)}
                            {log.created_record_type === 'security_alert' ? (
                              <Badge variant="destructive">🚨 Security Alert</Badge>
                            ) : (
                              getStatusBadge(log.processing_status)
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{log.sender_email}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {log.created_record_type === 'security_alert' ? (
                            <span className="text-red-600 font-medium">🚨 {log.subject}</span>
                          ) : (
                            log.subject
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.email_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  log.created_record_type === 'security_alert' 
                                    ? 'bg-red-600' 
                                    : 'bg-blue-600'
                                }`}
                                style={{ width: `${(log.ai_confidence_score || 0) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">
                              {Math.round((log.ai_confidence_score || 0) * 100)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Setup Guide</CardTitle>
              <CardDescription>
                How to configure email forwarding for automatic processing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Step 1: Create Email Integration</h3>
                <p className="text-gray-600 mb-4">
                  Create an email integration above to get a dedicated email address for processing specific types of emails.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Step 2: Configure Email Forwarding</h3>
                <p className="text-gray-600 mb-4">
                  Set up email forwarding in your email provider to forward emails to the integration address.
                </p>
                <Alert>
                  <AlertDescription>
                    <strong>Example:</strong> Forward all emails sent to <code>quotes@yourcompany.com</code> to your integration email address.
                  </AlertDescription>
                </Alert>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Step 3: Test the Integration</h3>
                <p className="text-gray-600 mb-4">
                  Send a test email to your integration address to verify it's working correctly.
                </p>
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Send Test Email
                </Button>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Supported Email Types</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Quotes</h4>
                    <p className="text-sm text-gray-600">
                      Automatically creates quote requests from customer emails
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Orders</h4>
                    <p className="text-sm text-gray-600">
                      Updates order status and tracking information
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Repairs</h4>
                    <p className="text-sm text-gray-600">
                      Creates repair tickets from customer requests
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Communications</h4>
                    <p className="text-sm text-gray-600">
                      Logs customer communications and inquiries
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editingIntegration} onOpenChange={() => setEditingIntegration(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Email Integration</DialogTitle>
            <DialogDescription>
              Update the settings for this email integration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_email_address">Email Address</Label>
              <Input
                id="edit_email_address"
                type="email"
                value={formData.email_address}
                onChange={(e) => setFormData({ ...formData, email_address: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit_email_type">Email Type</Label>
              <Select value={formData.email_type} onValueChange={(value) => setFormData({ ...formData, email_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quotes">Quotes</SelectItem>
                  <SelectItem value="orders">Orders</SelectItem>
                  <SelectItem value="repairs">Repairs</SelectItem>
                  <SelectItem value="communications">Communications</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit_notification_email">Notification Email (Optional)</Label>
              <Input
                id="edit_notification_email"
                type="email"
                value={formData.notification_email}
                onChange={(e) => setFormData({ ...formData, notification_email: e.target.value })}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="edit_is_active">Active</Label>
                <Switch
                  id="edit_is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit_auto_process">Auto Process</Label>
                <Switch
                  id="edit_auto_process"
                  checked={formData.auto_process}
                  onCheckedChange={(checked) => setFormData({ ...formData, auto_process: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit_require_confirmation">Require Confirmation</Label>
                <Switch
                  id="edit_require_confirmation"
                  checked={formData.require_confirmation}
                  onCheckedChange={(checked) => setFormData({ ...formData, require_confirmation: checked })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingIntegration(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateIntegration}>
              Update Integration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
