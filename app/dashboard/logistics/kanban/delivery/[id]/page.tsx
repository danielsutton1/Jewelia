"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  CheckCircle, 
  Calendar, 
  User, 
  Clock, 
  FileText, 
  MessageSquare, 
  Download,
  Upload,
  Eye,
  Trash2,
  Plus,
  AlertCircle,
  Info
} from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

interface DeliveryDetail {
  id: string
  name: string
  customer: string
  dueDate: string
  status: "in-progress" | "review" | "approved" | "revise"
  priority: "low" | "medium" | "high" | "urgent"
  assignee: string
  notes: string
  progress: number
  specifications: {
    deliveryMethod: string
    deliveryAddress: string
    contactPerson: string
    deliveryTime: string
    specialInstructions: string
  }
  timeline: {
    date: string
    event: string
    user: string
  }[]
  files: {
    name: string
    type: string
    size: string
    uploadedBy: string
    date: string
  }[]
  qualityChecks: {
    check: string
    status: "passed" | "failed" | "pending"
    notes: string
    checkedBy: string
    date: string
  }[]
  relatedOrders: {
    id: string
    name: string
    status: string
  }[]
}

const mockDeliveryDetail: DeliveryDetail = {
  id: 'ORD-1001',
  name: 'Custom Engagement Ring',
  customer: 'Sophia Chen',
  dueDate: 'Jul 27',
  status: 'in-progress',
  priority: 'high',
  assignee: 'Sarah Johnson',
  notes: 'Scheduled delivery for platinum engagement ring with signature required. Customer requested specific delivery time window.',
  progress: 75,
  specifications: {
    deliveryMethod: 'Direct Delivery',
    deliveryAddress: '123 Luxury Lane, Beverly Hills, CA 90210',
    contactPerson: 'Sophia Chen',
    deliveryTime: '2:00 PM - 4:00 PM',
    specialInstructions: 'Ring doorbell twice, call customer upon arrival'
  },
  timeline: [
    { date: 'Jul 26', event: 'Order received for delivery', user: 'System' },
    { date: 'Jul 26', event: 'Assigned to Sarah Johnson', user: 'Manager' },
    { date: 'Jul 26', event: 'Delivery route planned', user: 'Sarah Johnson' },
    { date: 'Jul 27', event: 'Package loaded for delivery', user: 'Sarah Johnson' },
    { date: 'Jul 27', event: 'Out for delivery', user: 'Sarah Johnson' }
  ],
  files: [
    { name: 'delivery_confirmation.pdf', type: 'PDF', size: '1.5 MB', uploadedBy: 'Sarah Johnson', date: 'Jul 26' },
    { name: 'customer_signature.pdf', type: 'PDF', size: '0.9 MB', uploadedBy: 'Sarah Johnson', date: 'Jul 27' },
    { name: 'delivery_photos.jpg', type: 'Image', size: '3.2 MB', uploadedBy: 'Sarah Johnson', date: 'Jul 27' }
  ],
  qualityChecks: [
    { check: 'Package condition', status: 'passed', notes: 'Package in excellent condition', checkedBy: 'Quality Team', date: 'Jul 27' },
    { check: 'Customer verification', status: 'pending', notes: 'Awaiting customer signature', checkedBy: 'Sarah Johnson', date: 'Jul 27' },
    { check: 'Delivery confirmation', status: 'pending', notes: 'To be completed upon delivery', checkedBy: 'Sarah Johnson', date: 'Jul 27' }
  ],
  relatedOrders: [
    { id: 'ORD-1002', name: 'Sapphire Pendant', status: 'in-progress' },
    { id: 'ORD-1003', name: 'Custom Bracelet', status: 'approved' }
  ]
}

const statusConfig = {
  "in-progress": { label: "In Progress", color: "bg-blue-100 text-blue-800" },
  "review": { label: "Review", color: "bg-amber-100 text-amber-800" },
  "approved": { label: "Approved", color: "bg-emerald-100 text-emerald-800" },
  "revise": { label: "Revise", color: "bg-red-100 text-red-800" },
}

const priorityConfig = {
  "low": { label: "Low", color: "bg-gray-100 text-gray-800" },
  "medium": { label: "Medium", color: "bg-blue-100 text-blue-800" },
  "high": { label: "High", color: "bg-amber-100 text-amber-800" },
  "urgent": { label: "Urgent", color: "bg-red-100 text-red-800" },
}

export default function DeliveryDetailPage() {
  const params = useParams()
  const id = params.id as string
  
  const [detail, setDetail] = React.useState<DeliveryDetail>(mockDeliveryDetail)
  const [isEditing, setIsEditing] = React.useState(false)
  const [editForm, setEditForm] = React.useState<DeliveryDetail>(mockDeliveryDetail)
  const router = useRouter()

  const handleSave = () => {
    setDetail(editForm)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditForm(detail)
    setIsEditing(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-emerald-500" />
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'pending': return <Clock className="h-4 w-4 text-amber-500" />
      default: return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Delivery Detail</h2>
            <p className="text-muted-foreground">
              Order {detail.id} - {detail.name}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="specifications">Delivery Details</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="quality">Quality Checks</TabsTrigger>
          <TabsTrigger value="related">Related Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Select value={editForm.status} onValueChange={(value) => setEditForm({...editForm, status: value as any})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="revise">Revise</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={statusConfig[detail.status]?.color}>
                    {statusConfig[detail.status]?.label}
                  </Badge>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Priority</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Select value={editForm.priority} onValueChange={(value) => setEditForm({...editForm, priority: value as any})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={priorityConfig[detail.priority]?.color}>
                    {priorityConfig[detail.priority]?.label}
                  </Badge>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Due Date</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Input 
                    value={editForm.dueDate} 
                    onChange={(e) => setEditForm({...editForm, dueDate: e.target.value})}
                  />
                ) : (
                  <div className="text-2xl font-bold">{detail.dueDate}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Progress</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Input 
                    type="number"
                    value={editForm.progress} 
                    onChange={(e) => setEditForm({...editForm, progress: parseInt(e.target.value)})}
                  />
                ) : (
                  <div className="text-2xl font-bold">{detail.progress}%</div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Order ID</label>
                  <p className="text-sm text-muted-foreground">{detail.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Item Name</label>
                  {isEditing ? (
                    <Input 
                      value={editForm.name} 
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{detail.name}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Customer</label>
                  {isEditing ? (
                    <Input 
                      value={editForm.customer} 
                      onChange={(e) => setEditForm({...editForm, customer: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{detail.customer}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Assignee</label>
                  {isEditing ? (
                    <Input 
                      value={editForm.assignee} 
                      onChange={(e) => setEditForm({...editForm, assignee: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{detail.assignee}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea 
                    value={editForm.notes} 
                    onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                    rows={6}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">{detail.notes}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="specifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Delivery Method</label>
                  {isEditing ? (
                    <Input 
                      value={editForm.specifications.deliveryMethod} 
                      onChange={(e) => setEditForm({
                        ...editForm, 
                        specifications: {...editForm.specifications, deliveryMethod: e.target.value}
                      })}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{detail.specifications.deliveryMethod}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Contact Person</label>
                  {isEditing ? (
                    <Input 
                      value={editForm.specifications.contactPerson} 
                      onChange={(e) => setEditForm({
                        ...editForm, 
                        specifications: {...editForm.specifications, contactPerson: e.target.value}
                      })}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{detail.specifications.contactPerson}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Delivery Time</label>
                  {isEditing ? (
                    <Input 
                      value={editForm.specifications.deliveryTime} 
                      onChange={(e) => setEditForm({
                        ...editForm, 
                        specifications: {...editForm.specifications, deliveryTime: e.target.value}
                      })}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{detail.specifications.deliveryTime}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Delivery Address</label>
                {isEditing ? (
                  <Textarea 
                    value={editForm.specifications.deliveryAddress} 
                    onChange={(e) => setEditForm({
                      ...editForm, 
                      specifications: {...editForm.specifications, deliveryAddress: e.target.value}
                    })}
                    rows={2}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">{detail.specifications.deliveryAddress}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Special Instructions</label>
                {isEditing ? (
                  <Textarea 
                    value={editForm.specifications.specialInstructions} 
                    onChange={(e) => setEditForm({
                      ...editForm, 
                      specifications: {...editForm.specifications, specialInstructions: e.target.value}
                    })}
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">{detail.specifications.specialInstructions}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {detail.timeline.map((event, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{event.event}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.date} by {event.user}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Files</CardTitle>
                <Button size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {detail.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {file.type} • {file.size} • Uploaded by {file.uploadedBy} on {file.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Checks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {detail.qualityChecks.map((check, index) => (
                  <div key={index} className="flex items-start space-x-4 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      {getStatusIcon(check.status)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{check.check}</p>
                      <p className="text-xs text-muted-foreground">{check.notes}</p>
                      <p className="text-xs text-muted-foreground">
                        Checked by {check.checkedBy} on {check.date}
                      </p>
                    </div>
                    <Badge variant="outline" className={
                      check.status === 'passed' ? 'bg-emerald-50 text-emerald-700' :
                      check.status === 'failed' ? 'bg-red-50 text-red-700' :
                      'bg-amber-50 text-amber-700'
                    }>
                      {check.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="related" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Related Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {detail.relatedOrders.map((order, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{order.name}</p>
                      <p className="text-xs text-muted-foreground">Order {order.id}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={
                        order.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                        order.status === 'in-progress' ? 'bg-blue-50 text-blue-700' :
                        'bg-amber-50 text-amber-700'
                      }>
                        {order.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 