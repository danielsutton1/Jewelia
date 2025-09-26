"use client"

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter, useParams } from 'next/navigation'
import { useState } from 'react'
import { format } from 'date-fns'
import { CheckCircle, Mail, Printer, Copy, Edit, FileText, MessageSquare, ArrowLeft, AlertCircle } from 'lucide-react'

// Mock data for demonstration
const mockTradeIn = {
  id: 'TI-20240618-123456',
  status: 'pending',
  statusHistory: [
    { status: 'pending', at: '2024-06-18T10:00:00Z', by: 'Emma Wilson' },
  ],
  customer: {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '555-1234',
    tradeInCount: 2,
  },
  staff: 'Emma Wilson',
  date: '2024-06-18',
  notes: 'Customer requested expedited processing.',
  items: [
    {
      id: 'item1',
      itemType: 'ring',
      metalType: 'gold',
      metalPurity: '18k',
      weight: 5.2,
      weightUnit: 'grams',
      condition: 'excellent',
      acceptedValue: 1200,
      appraisalValue: 1500,
      description: 'Vintage gold ring with diamond.',
      photos: [],
    },
  ],
  newItems: [
    {
      id: 'inv1',
      name: 'Gold Ring',
      sku: 'R-1001',
      price: 1200,
      quantity: 1,
      status: 'delivered',
    },
  ],
  documents: [
    { id: 'doc1', name: 'Receipt.pdf', type: 'receipt', date: '2024-06-18' },
    { id: 'doc2', name: 'Appraisal.pdf', type: 'appraisal', date: '2024-06-18' },
  ],
  commLog: [
    { type: 'email', date: '2024-06-18', subject: 'Trade-In Confirmation', notes: 'Sent confirmation email.' },
    { type: 'call', date: '2024-06-19', subject: 'Follow-up Call', notes: 'Discussed delivery.' },
  ],
  financial: {
    tradeInCredit: 1200,
    newItemsCost: 1200,
    tax: 96,
    netDifference: 96,
    paymentMethod: 'credit_card',
  },
}
const statusColors: any = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-destructive/20 text-destructive',
}
const statusOptions = ['pending', 'approved', 'completed', 'cancelled']

export default function TradeInDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [tab, setTab] = useState('overview')
  const [status, setStatus] = useState(mockTradeIn.status)
  const [statusReason, setStatusReason] = useState('')
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [notes, setNotes] = useState(mockTradeIn.notes)
  const [editingNotes, setEditingNotes] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDuplicate, setShowDuplicate] = useState(false)
  const [showPrint, setShowPrint] = useState(false)
  const [showEmail, setShowEmail] = useState(false)

  // Permissions (mocked)
  const canEdit = status === 'pending' || status === 'approved'

  // Status badge
  function StatusBadge({ status }: { status: string }) {
    return <span className={`inline-block rounded px-2 py-1 text-xs font-semibold ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
  }

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/trade-ins">Trade-Ins</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{mockTradeIn.id}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Trade-In {mockTradeIn.id}</h1>
          <StatusBadge status={status} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {canEdit && <Button size="sm" variant="outline" onClick={() => setShowEdit(true)}><Edit className="h-4 w-4 mr-1" />Edit</Button>}
          <Button size="sm" variant="outline" onClick={() => setShowDuplicate(true)}><Copy className="h-4 w-4 mr-1" />Duplicate</Button>
          <Button size="sm" variant="outline" onClick={() => setShowPrint(true)}><Printer className="h-4 w-4 mr-1" />Print Receipt</Button>
          <Button size="sm" variant="outline" onClick={() => setShowEmail(true)}><Mail className="h-4 w-4 mr-1" />Email Customer</Button>
          <Button size="sm" variant="outline" onClick={() => setShowStatusDialog(true)}><FileText className="h-4 w-4 mr-1" />Change Status</Button>
          <Button size="sm" variant="outline" onClick={() => setEditingNotes(true)}><MessageSquare className="h-4 w-4 mr-1" />Add Notes</Button>
        </div>
      </div>
      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Customer Information Panel */}
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-semibold">{mockTradeIn.customer.name}</div>
              <div className="text-xs text-muted-foreground">{mockTradeIn.customer.email}</div>
              <div className="text-xs">{mockTradeIn.customer.phone}</div>
              <div className="text-xs mt-2">Trade-Ins: {mockTradeIn.customer.tradeInCount}</div>
              <Button variant="link" size="sm" className="mt-2 px-0" onClick={() => router.push(`/dashboard/customers/${mockTradeIn.customer.id}`)}>View Profile</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Trade-In History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs">Previous trade-ins: {mockTradeIn.customer.tradeInCount}</div>
              {/* Could list previous trade-ins here */}
            </CardContent>
          </Card>
        </div>
        {/* Details Tabs */}
        <div className="md:col-span-3">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="items">Items Traded</TabsTrigger>
              <TabsTrigger value="newitems">New Items</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            {/* Overview Tab */}
            <TabsContent value="overview">
              <Card>
                <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-xs">Date: <span className="font-semibold">{mockTradeIn.date}</span></div>
                    <div className="text-xs">Staff: <span className="font-semibold">{mockTradeIn.staff}</span></div>
                  </div>
                  <div className="font-semibold mt-2">Status History</div>
                  <ul className="text-xs ml-2">
                    {mockTradeIn.statusHistory.map((h, idx) => (
                      <li key={idx}>{h.status} by {h.by} at {format(new Date(h.at), 'yyyy-MM-dd HH:mm')}</li>
                    ))}
                  </ul>
                  <div className="font-semibold mt-2">Financial Summary</div>
                  <div className="text-xs">Trade-In Credit: <span className="font-semibold text-emerald-600">${mockTradeIn.financial.tradeInCredit.toLocaleString()}</span></div>
                  <div className="text-xs">New Items Cost: <span className="font-semibold">${mockTradeIn.financial.newItemsCost.toLocaleString()}</span></div>
                  <div className="text-xs">Tax: <span className="font-semibold">${mockTradeIn.financial.tax.toLocaleString()}</span></div>
                  <div className="text-xs">Net Difference: <span className={mockTradeIn.financial.netDifference >= 0 ? 'text-emerald-600 font-semibold' : 'text-destructive font-semibold'}>${mockTradeIn.financial.netDifference.toLocaleString()}</span></div>
                  <div className="font-semibold mt-2">Notes</div>
                  {editingNotes ? (
                    <div className="flex gap-2 items-center mt-1">
                      <Textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full" />
                      <Button size="sm" onClick={() => setEditingNotes(false)}>Save</Button>
                    </div>
                  ) : (
                    <div className="text-xs bg-gray-50 rounded p-2 mt-1 min-h-[32px]">{notes || 'No notes.'}</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            {/* Items Traded Tab */}
            <TabsContent value="items">
              <Card>
                <CardHeader><CardTitle>Items Traded</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {mockTradeIn.items.map(item => (
                    <Card key={item.id} className="border-2 border-emerald-200">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div className="font-semibold">{item.itemType} ({item.metalType}, {item.metalPurity})</div>
                        <div className="text-xs">Condition: {item.condition}</div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xs">Weight: {item.weight} {item.weightUnit}</div>
                        <div className="text-xs">Appraisal Value: ${item.appraisalValue}</div>
                        <div className="text-xs">Accepted Value: <span className="font-semibold text-emerald-600">${item.acceptedValue}</span></div>
                        <div className="text-xs">{item.description}</div>
                        {/* Photos/documents would be shown here */}
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            {/* New Items Tab */}
            <TabsContent value="newitems">
              <Card>
                <CardHeader><CardTitle>New Items</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {mockTradeIn.newItems.map(item => (
                    <Card key={item.id} className="border-2 border-blue-200">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-xs">SKU: {item.sku}</div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xs">Price: ${item.price}</div>
                        <div className="text-xs">Quantity: {item.quantity}</div>
                        <div className="text-xs">Status: {item.status}</div>
                        {/* Custom order specs, delivery status, etc. */}
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            {/* Documents Tab */}
            <TabsContent value="documents">
              <Card>
                <CardHeader><CardTitle>Documents & Communication</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="font-semibold">Documents</div>
                  {mockTradeIn.documents.map(doc => (
                    <div key={doc.id} className="flex items-center gap-2 text-xs">
                      <FileText className="h-4 w-4" />
                      <span>{doc.name}</span>
                      <span className="text-muted-foreground">({doc.type})</span>
                      <span className="ml-auto">{doc.date}</span>
                      <Button size="sm" variant="outline">View</Button>
                    </div>
                  ))}
                  <div className="font-semibold mt-4">Communication Log</div>
                  {mockTradeIn.commLog.map((log, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <MessageSquare className="h-4 w-4" />
                      <span>{log.type.toUpperCase()}</span>
                      <span>{log.date}</span>
                      <span>{log.subject}</span>
                      <span className="ml-auto">{log.notes}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          {/* Status Management */}
          {showStatusDialog && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <Card className="w-full max-w-md">
                <CardHeader><CardTitle>Change Status</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Select value={status} onValueChange={v => setStatus(v)}>
                    <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <div>
                    <label className="block text-xs mb-1">Reason for status change</label>
                    <Input value={statusReason} onChange={e => setStatusReason(e.target.value)} placeholder="Reason..." />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" onClick={() => setShowStatusDialog(false)}>Cancel</Button>
                    <Button onClick={() => setShowStatusDialog(false)}>Update Status</Button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">Automatic notifications will be sent to the customer.</div>
                  <div className="text-xs text-muted-foreground">All changes are logged in the audit trail.</div>
                </CardContent>
              </Card>
            </div>
          )}
          {/* Print/Email/Edit/Duplicate stubs */}
          {showPrint && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <Card className="w-full max-w-lg">
                <CardHeader><CardTitle>Print Receipt (Stub)</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-muted-foreground">This would generate a printable receipt.</div>
                  <Button className="mt-4" onClick={() => setShowPrint(false)}>Close</Button>
                </CardContent>
              </Card>
            </div>
          )}
          {showEmail && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <Card className="w-full max-w-lg">
                <CardHeader><CardTitle>Email Customer (Stub)</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-muted-foreground">This would send a summary to the customer via email.</div>
                  <Button className="mt-4" onClick={() => setShowEmail(false)}>Close</Button>
                </CardContent>
              </Card>
            </div>
          )}
          {showEdit && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <Card className="w-full max-w-lg">
                <CardHeader><CardTitle>Edit Trade-In (Stub)</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-muted-foreground">This would allow editing of the trade-in details.</div>
                  <Button className="mt-4" onClick={() => setShowEdit(false)}>Close</Button>
                </CardContent>
              </Card>
            </div>
          )}
          {showDuplicate && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <Card className="w-full max-w-lg">
                <CardHeader><CardTitle>Duplicate Trade-In (Stub)</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-muted-foreground">This would duplicate the trade-in for a new transaction.</div>
                  <Button className="mt-4" onClick={() => setShowDuplicate(false)}>Close</Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 