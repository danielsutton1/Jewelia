"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Table } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { format, isBefore, parseISO } from "date-fns"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const STATUS_OPTIONS = ["open", "paid", "overdue", "void"]

// Validation schemas
const invoiceFormSchema = z.object({
  invoice_number: z.string().min(1, "Invoice number is required"),
  customer_id: z.string().min(1, "Customer is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  due_date: z.string().min(1, "Due date is required"),
  status: z.string().min(1, "Status is required"),
  notes: z.string().optional(),
})

const billFormSchema = z.object({
  bill_number: z.string().min(1, "Bill number is required"),
  vendor_id: z.string().min(1, "Vendor is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  due_date: z.string().min(1, "Due date is required"),
  status: z.string().min(1, "Status is required"),
  notes: z.string().optional(),
})

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>
type BillFormValues = z.infer<typeof billFormSchema>

function statusColor(status: string) {
  switch (status) {
    case "open": return "text-blue-600"
    case "paid": return "text-green-600"
    case "overdue": return "text-red-600"
    case "void": return "text-gray-400"
    default: return ""
  }
}

// Mock fallback for customers/vendors
const mockCustomers = [
  { id: "CUST-001", full_name: "Olivia Martin" },
  { id: "CUST-002", full_name: "Jackson Lee" },
  { id: "CUST-003", full_name: "Isabella Nguyen" },
]
const mockVendors = [
  { id: "V-001", name: "Stuller Inc." },
  { id: "V-002", name: "Rio Grande" },
]

export default function FinancePage() {
  // Tabs
  const [tab, setTab] = useState<"ar" | "ap">("ar")

  // Data
  const [ar, setAr] = useState<any[]>([])
  const [ap, setAp] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [search, setSearch] = useState("")
  const [dueFilter, setDueFilter] = useState<string>("")

  // Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<any>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Reporting
  const [totals, setTotals] = useState<any>({ open: 0, overdue: 0, paid: 0, void: 0, total: 0 })

  // Customers/Vendors
  const [customers, setCustomers] = useState<any[]>([])
  const [vendors, setVendors] = useState<any[]>([])

  // Fetch data
  async function fetchData() {
    setLoading(true)
    setError(null)
    try {
      if (tab === "ar") {
        const res = await fetch("/api/ar")
        const data = await res.json()
        setAr(data.data || [])
      } else {
        const res = await fetch("/api/ap")
        const data = await res.json()
        setAp(data.data || [])
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Calculate totals for reporting
  function calculateTotals(records: any[]) {
    const totals: { open: number; overdue: number; paid: number; void: number; total: number } = { open: 0, overdue: 0, paid: 0, void: 0, total: 0 }
    const today = new Date()
    for (const rec of records) {
      if (rec.status === "open" && rec.due_date && isBefore(parseISO(rec.due_date), today)) {
        totals.overdue += Number(rec.amount)
      } else if ((rec.status as keyof typeof totals) in totals) {
        totals[rec.status as keyof typeof totals] += Number(rec.amount)
      }
      totals.total += Number(rec.amount)
    }
    return totals
  }

  // Filtering
  function filterRecords(records: any[]) {
    let filtered = records
    if (statusFilter) filtered = filtered.filter(r => r.status === statusFilter)
    if (dueFilter) filtered = filtered.filter(r => r.due_date === dueFilter)
    if (search) {
      filtered = filtered.filter(r =>
        (r.invoice_number || r.bill_number || "").toLowerCase().includes(search.toLowerCase()) ||
        (r.notes || "").toLowerCase().includes(search.toLowerCase())
      )
    }
    return filtered
  }

  // Modal open/close
  function openModal(record?: any) {
    setEditing(record || null)
    setForm(record ? { ...record } : {})
    setFormError(null)
    setModalOpen(true)
  }
  function closeModal() {
    setModalOpen(false)
    setEditing(null)
    setForm({})
    setFormError(null)
  }

  // Save (create or update)
  async function handleSave() {
    setSaving(true)
    setFormError(null)
    // Validation
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      setFormError("Amount must be a positive number.")
      setSaving(false)
      return
    }
    if (!form.due_date) {
      setFormError("Due date is required.")
      setSaving(false)
      return
    }
    if (tab === "ar" && !form.invoice_number) {
      setFormError("Invoice number is required.")
      setSaving(false)
      return
    }
    if (tab === "ap" && !form.bill_number) {
      setFormError("Bill number is required.")
      setSaving(false)
      return
    }
    try {
      let res, data
      if (tab === "ar") {
        if (editing) {
          res = await fetch(`/api/ar/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
        } else {
          res = await fetch(`/api/ar`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
        }
      } else {
        if (editing) {
          res = await fetch(`/api/ap/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
        } else {
          res = await fetch(`/api/ap`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
        }
      }
      data = await res.json()
      if (!data.success) throw new Error(data.error)
      closeModal()
      fetchData()
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Delete
  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this record?")) return
    setLoading(true)
    try {
      let res
      if (tab === "ar") {
        res = await fetch(`/api/ar/${id}`, { method: "DELETE" })
      } else {
        res = await fetch(`/api/ap/${id}`, { method: "DELETE" })
      }
      await res.json()
      fetchData()
    } catch {}
    setLoading(false)
  }

  // Fetch on tab/filter/search change
  useEffect(() => { fetchData() }, [tab])
  useEffect(() => {
    const records = tab === "ar" ? ar : ap
    setTotals(calculateTotals(records))
  }, [ar, ap, tab])

  // Fetch customers/vendors
  useEffect(() => {
    fetch("/api/customers").then(res => res.json()).then(data => setCustomers(data.customers || data.data || mockCustomers)).catch(() => setCustomers(mockCustomers))
    fetch("/api/vendors").then(res => res.json()).then(data => setVendors(data.vendors || data.data || mockVendors)).catch(() => setVendors(mockVendors))
  }, [])

  // Render
  const records = filterRecords(tab === "ar" ? ar : ap)
  const isAR = tab === "ar"

  // Helper to get name by id
  function getCustomerName(id: string) {
    return customers.find((c) => c.id === id)?.full_name || id
  }
  function getVendorName(id: string) {
    return vendors.find((v) => v.id === id)?.name || id
  }

  // CSV Export
  function exportCSV(records: any[], type: "ar" | "ap") {
    const headers = type === "ar"
      ? ["Invoice #", "Customer", "Amount", "Due Date", "Status", "Notes"]
      : ["Bill #", "Vendor", "Amount", "Due Date", "Status", "Notes"]
    const rows = records.map((rec) => [
      type === "ar" ? rec.invoice_number : rec.bill_number,
      type === "ar" ? getCustomerName(rec.customer_id) : getVendorName(rec.vendor_id),
      rec.amount,
      rec.due_date,
      rec.status,
      rec.notes || ""
    ])
    const csv = [headers, ...rows].map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = type === "ar" ? "accounts-receivable.csv" : "accounts-payable.csv"
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 100)
  }

  return (
    <div className="container mx-auto py-4 sm:py-6 p-3 sm:p-4 md:p-6 max-w-7xl w-full space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight finance-heading">Accounts Receivable & Payable</h1>
      </div>
      <Tabs defaultValue="ar" value={tab} onValueChange={v => setTab(v as any)}>
        <TabsList className="grid w-full grid-cols-2 h-auto p-1 sm:p-2">
          <TabsTrigger value="ar" className="text-xs sm:text-sm min-h-[44px] px-2 sm:px-4 py-2 sm:py-3">Accounts Receivable</TabsTrigger>
          <TabsTrigger value="ap" className="text-xs sm:text-sm min-h-[44px] px-2 sm:px-4 py-2 sm:py-3">Accounts Payable</TabsTrigger>
        </TabsList>
        <TabsContent value="ar" className="mt-4 sm:mt-6">
          <ReportingWidget totals={totals} />
        </TabsContent>
        <TabsContent value="ap" className="mt-4 sm:mt-6">
          <ReportingWidget totals={totals} />
        </TabsContent>
      </Tabs>
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">{isAR ? "Accounts Receivable" : "Accounts Payable"}</CardTitle>
          <CardDescription className="text-sm sm:text-base">Manage {isAR ? "customer invoices" : "vendor bills"}.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 flex-wrap">
            <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-full sm:w-48 min-h-[44px] text-sm" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-32 min-h-[44px] text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="date" value={dueFilter} onChange={e => setDueFilter(e.target.value)} className="w-full sm:w-40 min-h-[44px] text-sm" />
            <Button onClick={() => openModal()} variant="default" className="min-h-[44px] min-w-[44px] text-xs sm:text-sm">Add {isAR ? "Invoice" : "Bill"}</Button>
            <Button onClick={() => exportCSV(records, isAR ? "ar" : "ap")} variant="outline" className="min-h-[44px] min-w-[44px] text-xs sm:text-sm">Export CSV</Button>
          </div>
          <div className="overflow-x-auto">
            <Table className="min-w-[600px]">
              <thead>
                <tr>
                  <th className="text-xs sm:text-sm">{isAR ? "Invoice #" : "Bill #"}</th>
                  <th className="text-xs sm:text-sm">{isAR ? "Customer" : "Vendor"}</th>
                  <th className="text-xs sm:text-sm">Amount</th>
                  <th className="text-xs sm:text-sm">Due Date</th>
                  <th className="text-xs sm:text-sm">Status</th>
                  <th className="text-xs sm:text-sm">Notes</th>
                  <th className="text-xs sm:text-sm"></th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec: any) => (
                  <tr key={rec.id}>
                    <td className="text-xs sm:text-sm">{isAR ? rec.invoice_number : rec.bill_number}</td>
                    <td className="text-xs sm:text-sm">{isAR ? getCustomerName(rec.customer_id) : getVendorName(rec.vendor_id)}</td>
                    <td className="text-xs sm:text-sm">${Number(rec.amount).toFixed(2)}</td>
                    <td className="text-xs sm:text-sm">{rec.due_date ? format(parseISO(rec.due_date), "yyyy-MM-dd") : ""}</td>
                    <td className={`text-xs sm:text-sm ${statusColor(rec.status)}`}>{rec.status}</td>
                    <td className="text-xs sm:text-sm">{rec.notes}</td>
                    <td>
                      <div className="flex gap-1 sm:gap-2 flex-wrap">
                        <Button size="sm" variant="outline" onClick={() => openModal(rec)} className="min-h-[44px] min-w-[44px] text-xs">Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(rec.id)} className="min-h-[44px] min-w-[44px] text-xs">Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          {loading && <div className="mt-4 text-sm">Loading...</div>}
          {error && <div className="mt-4 text-red-600 text-sm">{error}</div>}
        </CardContent>
      </Card>
      <Dialog open={modalOpen} onOpenChange={v => { if (!v) closeModal() }}>
        <DialogContent className="max-w-md w-full mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">{editing ? `Edit ${isAR ? "Invoice" : "Bill"}` : `Add ${isAR ? "Invoice" : "Bill"}`}</DialogTitle>
          </DialogHeader>
          <FinanceForm 
            isAR={isAR}
            form={form}
            setForm={setForm}
            customers={customers}
            vendors={vendors}
            formError={formError}
            onSave={handleSave}
            saving={saving}
            onClose={closeModal}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ReportingWidget({ totals }: { totals: any }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-4">
      {/* Open */}
      <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-gray-900 truncate">Open</h4>
                <Badge variant="secondary" className="text-xs mt-1">
                  Financial
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
              ${totals.open.toFixed(2)}
            </div>
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>Pending payment</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-2 line-clamp-2">
            Outstanding invoices awaiting payment
          </p>
        </CardContent>
      </Card>

      {/* Overdue */}
      <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-gray-900 truncate">Overdue</h4>
                <Badge variant="secondary" className="text-xs mt-1">
                  Financial
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
              ${totals.overdue.toFixed(2)}
            </div>
            <div className="flex items-center gap-1 text-xs text-red-600">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
              <span>Past due date</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-2 line-clamp-2">
            Invoices past their due date
          </p>
        </CardContent>
      </Card>

      {/* Paid */}
      <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-gray-900 truncate">Paid</h4>
                <Badge variant="secondary" className="text-xs mt-1">
                  Financial
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
              ${totals.paid.toFixed(2)}
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>Payment received</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-2 line-clamp-2">
            Successfully paid invoices
          </p>
        </CardContent>
      </Card>

      {/* Void */}
      <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-gray-900 truncate">Void</h4>
                <Badge variant="secondary" className="text-xs mt-1">
                  Financial
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
              ${totals.void.toFixed(2)}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
              <span>Cancelled invoices</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-2 line-clamp-2">
            Cancelled or voided invoices
          </p>
        </CardContent>
      </Card>

      {/* Total */}
      <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-gray-900 truncate">Total</h4>
                <Badge variant="secondary" className="text-xs mt-1">
                  Financial
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
              ${totals.total.toFixed(2)}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>All invoices</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-2 line-clamp-2">
            Total value of all invoices
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Finance Form Component with proper validation
function FinanceForm({ 
  isAR, 
  form, 
  setForm, 
  customers, 
  vendors, 
  formError, 
  onSave, 
  saving, 
  onClose 
}: {
  isAR: boolean
  form: any
  setForm: (form: any) => void
  customers: any[]
  vendors: any[]
  formError: string | null
  onSave: () => void
  saving: boolean
  onClose: () => void
}) {
  const schema = isAR ? invoiceFormSchema : billFormSchema
  const formHook = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      [isAR ? 'invoice_number' : 'bill_number']: form[isAR ? 'invoice_number' : 'bill_number'] || '',
      [isAR ? 'customer_id' : 'vendor_id']: form[isAR ? 'customer_id' : 'vendor_id'] || '',
      amount: form.amount || '',
      due_date: form.due_date || '',
      status: form.status || 'open',
      notes: form.notes || '',
    }
  })

  const onSubmit = (data: any) => {
    setForm(data)
    onSave()
  }

  return (
    <Form {...formHook}>
      <form onSubmit={formHook.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={formHook.control}
          name={isAR ? 'invoice_number' : 'bill_number'}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isAR ? 'Invoice #' : 'Bill #'} *</FormLabel>
              <FormControl>
                <Input
                  placeholder={isAR ? "Invoice #" : "Bill #"}
                  {...field}
                  className="min-h-[44px] text-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={formHook.control}
          name={isAR ? 'customer_id' : 'vendor_id'}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isAR ? 'Customer' : 'Vendor'} *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full min-h-[44px] text-sm">
                    <SelectValue placeholder={isAR ? "Select Customer" : "Select Vendor"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(isAR ? customers : vendors).map((item: any) => (
                    <SelectItem key={item.id} value={item.id}>
                      {isAR ? item.full_name : item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={formHook.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Amount"
                  type="number"
                  step="0.01"
                  {...field}
                  className="min-h-[44px] text-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={formHook.control}
          name="due_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Due Date"
                  type="date"
                  {...field}
                  className="min-h-[44px] text-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={formHook.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full min-h-[44px] text-sm">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {STATUS_OPTIONS.map(s => (
                    <SelectItem key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={formHook.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Input
                  placeholder="Notes"
                  {...field}
                  className="min-h-[44px] text-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {formError && <div className="text-red-600 text-sm mt-2">{formError}</div>}

        <DialogFooter className="mt-4 gap-2">
          <Button type="submit" disabled={saving} className="min-h-[44px] min-w-[44px] text-sm">
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} className="min-h-[44px] min-w-[44px] text-sm">
            Cancel
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
} 