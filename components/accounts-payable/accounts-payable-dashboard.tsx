"use client"

import { useState, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Building2, Receipt, CreditCard, Calculator, TrendingUp, AlertCircle, Clock, Calendar, DollarSign, Search, Filter, Download, Plus, Eye, Edit, Trash2, MoreHorizontal, CheckCircle, XCircle, Clock3, Zap, Target, BarChart3, Sparkles, Gem, Crown, ShoppingBag } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const initialPOs = [
  {
    id: "PO-001",
    vendor: "Stuller Inc.",
    date: "2024-05-01",
    status: "Open",
    total: 5000,
    items: [
      { sku: "RM-001", name: "18K Gold Sheet", qty: 2, price: 2500 },
    ],
    notes: "Urgent order."
  },
  {
    id: "PO-002",
    vendor: "Rio Grande",
    date: "2024-05-03",
    status: "Received",
    total: 3000,
    items: [
      { sku: "LS-001", name: "Loose Diamond", qty: 1, price: 3000 },
    ],
    notes: "Regular restock."
  },
]

// Mock data for items purchased and backorders
const itemsPurchased = [
  { sku: "RM-001", name: "18K Gold Sheet", vendor: "Stuller Inc.", date: "2024-05-01", qty: 2, price: 2500, po: "PO-001" },
  { sku: "LS-001", name: "Loose Diamond", vendor: "Rio Grande", date: "2024-05-03", qty: 1, price: 3000, po: "PO-002" },
  { sku: "RM-002", name: "14K Gold Wire", vendor: "Stuller Inc.", date: "2024-05-04", qty: 5, price: 500, po: "PO-003" },
]
const backorders = [
  { sku: "RM-003", name: "Platinum Sheet", vendor: "Stuller Inc.", date: "2024-05-05", qty: 1, po: "PO-004", status: "Backordered" },
  { sku: "LS-002", name: "Loose Sapphire", vendor: "Rio Grande", date: "2024-05-06", qty: 2, po: "PO-005", status: "Backordered" },
]

// Add mock vendors data
const vendors = [
  { id: "V-001", name: "Stuller Inc.", contact: "support@stuller.com", phone: "800-877-7777", address: "302 Rue Louis XIV, Lafayette, LA" },
  { id: "V-002", name: "Rio Grande", contact: "service@riogrande.com", phone: "800-545-6566", address: "7500 Bluewater Rd NW, Albuquerque, NM" },
]

// Mock data for invoice distribution
type Distribution = { account: string; amount: number }[];
type Invoice = { id: string; vendor: string; date: string; amount: number; distribution: Distribution; notes?: string; attachments?: string[] };
const initialInvoices: Invoice[] = [
  { id: "AP-INV-001", vendor: "Stuller Inc.", date: "2024-05-10", amount: 5000, distribution: [], notes: "", attachments: [] },
  { id: "AP-INV-002", vendor: "Rio Grande", date: "2024-05-12", amount: 3000, distribution: [], notes: "", attachments: [] },
]
const glAccounts = [
  { code: "5000", name: "Inventory" },
  { code: "5100", name: "Supplies" },
  { code: "5200", name: "Repairs" },
]

// Utility for CSV export
function exportToCSV(filename: string, rows: any[], headers: string[]) {
  const csv = [headers.join(",")].concat(
    rows.map(row => headers.map(h => `"${(row[h] ?? "").toString().replace(/"/g, '""')}"`).join(","))
  ).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function printTable(headers: string[], rows: any[], title = "") {
  const win = window.open('', '_blank');
  if (win) {
    win.document.write('<html><head><title>Print</title></head><body>');
    if (title) win.document.write(`<h2>${title}</h2>`);
    win.document.write('<table border="1" style="width:100%;margin-top:1em;"><tr>');
    headers.forEach(h => win.document.write(`<th>${h}</th>`));
    win.document.write('</tr>');
    rows.forEach(row => {
      win.document.write('<tr>');
      headers.forEach(h => win.document.write(`<td>${row[h] ?? ""}</td>`));
      win.document.write('</tr>');
    });
    win.document.write('</table></body></html>');
    win.document.close();
    win.print();
  }
}

// Utility: group by vendor
function groupByVendor<T extends { vendor: string }>(arr: T[]) {
  return arr.reduce((acc, item) => {
    acc[item.vendor] = acc[item.vendor] || [];
    acc[item.vendor].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

export function AccountsPayableDashboard() {
  const [activeTab, setActiveTab] = useState("purchase-orders")
  const [purchaseOrders, setPurchaseOrders] = useState(initialPOs)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [newPO, setNewPO] = useState({
    vendor: "",
    date: "",
    status: "Open",
    items: [{ sku: "", name: "", qty: 1, price: 0 }],
    notes: "",
  })
  const [viewPO, setViewPO] = useState<any | null>(null)
  const [itemsFilter, setItemsFilter] = useState({ date: "", vendor: "", sku: "" })
  const [backorderFilter, setBackorderFilter] = useState({ date: "", vendor: "", sku: "" })
  const [vendorSearch, setVendorSearch] = useState("")
  const [selectedVendor, setSelectedVendor] = useState<string>("")
  const [apInvoices, setApInvoices] = useState(initialInvoices)
  const [distDialog, setDistDialog] = useState<{ open: boolean; invoice: any | null }>({ open: false, invoice: null })
  const [distRows, setDistRows] = useState([{ account: "5000", amount: 0 }])
  const [poSearch, setPoSearch] = useState("")
  const [poStatus, setPoStatus] = useState("All")
  const [showNotes, setShowNotes] = useState<{ type: 'po'|'invoice', data: any }|null>(null)
  const [showPayment, setShowPayment] = useState<any|null>(null)
  const [showAttachment, setShowAttachment] = useState<any|null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [invoiceSearch, setInvoiceSearch] = useState("")
  const [invoiceStatus, setInvoiceStatus] = useState("All")

  const statusColors: { [key: string]: string } = {
    Open: "bg-yellow-100 text-yellow-800",
    Received: "bg-green-100 text-green-700",
    Overdue: "bg-red-100 text-red-700",
    Paid: "bg-blue-100 text-blue-700",
    All: "bg-gray-100 text-gray-700"
  }

  const filteredPOs = purchaseOrders.filter(po =>
    (poStatus === "All" || po.status === poStatus) &&
    (po.id.toLowerCase().includes(poSearch.toLowerCase()) ||
      po.vendor.toLowerCase().includes(poSearch.toLowerCase()))
  )

  // --- Summary & Aging Calculations ---
  // Outstanding = sum of all open POs and unpaid invoices
  const totalOutstanding = purchaseOrders.filter(po => po.status !== "Received").reduce((sum, po) => sum + po.total, 0) + apInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  // Overdue = POs or invoices past today (mock logic, real would use due date)
  const today = new Date().toISOString().slice(0, 10);
  const overdue = apInvoices.filter(inv => inv.date < today).reduce((sum, inv) => sum + inv.amount, 0);
  // Due this month (mock: invoices in current month)
  const thisMonth = new Date().toISOString().slice(0, 7);
  const dueThisMonth = apInvoices.filter(inv => inv.date.startsWith(thisMonth)).reduce((sum, inv) => sum + inv.amount, 0);
  // Avg days to pay (mock: difference between PO date and invoice date)
  const avgDaysToPay = apInvoices.length ? Math.round(
    apInvoices.reduce((sum, inv) => {
      const po = purchaseOrders.find(po => po.vendor === inv.vendor);
      if (!po) return sum;
      return sum + Math.abs((new Date(inv.date).getTime() - new Date(po.date).getTime()) / (1000*60*60*24));
    }, 0) / apInvoices.length
  ) : 0;

  // Aging buckets for invoices
  const agingBuckets = [
    { label: "0-30 days", min: 0, max: 30 },
    { label: "31-60 days", min: 31, max: 60 },
    { label: "61-90 days", min: 61, max: 90 },
    { label: "90+ days", min: 91, max: 9999 },
  ];
  function daysBetween(a: string, b: string) {
    return Math.floor((new Date(a).getTime() - new Date(b).getTime()) / (1000*60*60*24));
  }
  const aging = agingBuckets.map(bucket => ({
    ...bucket,
    total: apInvoices.filter(inv => {
      const po = purchaseOrders.find(po => po.vendor === inv.vendor);
      if (!po) return false;
      const days = daysBetween(today, inv.date);
      return days >= bucket.min && days <= bucket.max;
    }).reduce((sum, inv) => sum + inv.amount, 0)
  }));

  // --- Invoice Table Enhancements ---
  const enhancedInvoices = apInvoices.map(inv => ({
    ...inv,
    status: inv.distribution.length > 0 ? "Distributed" : "Pending",
    paid: false,
    notes: inv.notes || "",
    attachments: inv.attachments || [],
  }));
  const filteredInvoices = enhancedInvoices.filter(inv =>
    (invoiceStatus === "All" || inv.status === invoiceStatus) &&
    (inv.id.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      inv.vendor.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      inv.date.includes(invoiceSearch))
  );
  const invoiceStatusColors: { [key: string]: string } = {
    Distributed: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-800",
    Paid: "bg-blue-100 text-blue-700",
    All: "bg-gray-100 text-gray-700"
  };

  const handleAddPO = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPO.vendor || !newPO.date) return
    setPurchaseOrders([
      ...purchaseOrders,
      {
        id: `PO-${(purchaseOrders.length + 1).toString().padStart(3, "0")}`,
        ...newPO,
        total: newPO.items.reduce((sum, i) => sum + i.qty * i.price, 0),
      },
    ])
    setShowNewDialog(false)
    setNewPO({ vendor: "", date: "", status: "Open", items: [{ sku: "", name: "", qty: 1, price: 0 }], notes: "" })
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Aging Buckets */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        {aging.map(bucket => (
          <Card key={bucket.label} className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 group">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg">
                  <Clock className="h-3 w-3 text-white" />
                </div>
                {bucket.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-slate-800 mb-1">${bucket.total.toLocaleString()}</div>
              <div className="text-xs text-slate-500">
                {bucket.total > 0 ? `${Math.round((bucket.total / totalOutstanding) * 100)}% of total` : 'No outstanding'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 opacity-50"></div>
        <div className="relative z-10">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 h-auto p-2 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl shadow-lg border border-white/20 m-6">
              <TabsTrigger 
                value="purchase-orders" 
                className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
              >
                <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                Purchase Orders
              </TabsTrigger>
              <TabsTrigger 
                value="items-purchased" 
                className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
              >
                <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                  <ShoppingBag className="h-4 w-4 text-white" />
                </div>
                Items Purchased
              </TabsTrigger>
              <TabsTrigger 
                value="backorders" 
                className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
              >
                <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                  <AlertCircle className="h-4 w-4 text-white" />
                </div>
                Backorders
              </TabsTrigger>
              <TabsTrigger 
                value="vendors" 
                className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
              >
                <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                  <Building2 className="h-4 w-4 text-white" />
                </div>
                Vendors
              </TabsTrigger>
              <TabsTrigger 
                value="invoice-distribution" 
                className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
              >
                <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                  <Receipt className="h-4 w-4 text-white" />
                </div>
                Invoices
              </TabsTrigger>
              <TabsTrigger 
                value="vendor-analytics" 
                className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
              >
                <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="purchase-orders" className="p-6 space-y-8">
              {/* Enhanced Search and Filters */}
              <div className="flex flex-wrap gap-4 mb-6 items-center">
                <div className="relative flex-1 min-w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    type="text" 
                    placeholder="Search PO # or Vendor..." 
                    value={poSearch} 
                    onChange={e => setPoSearch(e.target.value)}
                    className="pl-10 bg-white/80 backdrop-blur-sm border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300"
                  />
                </div>
                <Select value={poStatus} onValueChange={setPoStatus}>
                  <SelectTrigger className="w-48 bg-white/80 backdrop-blur-sm border-slate-200">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Statuses</SelectItem>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="Received">Received</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => exportToCSV("purchase-orders.csv", purchaseOrders, ["id","vendor","date","status","total"])}
                    className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                    aria-label="Export CSV"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => printTable(["PO #","Vendor","Date","Status","Total"], purchaseOrders.map(po => ({"PO #": po.id, Vendor: po.vendor, Date: po.date, Status: po.status, Total: `$${po.total.toLocaleString()}` })), "Purchase Orders")}
                    className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                    aria-label="Print"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={() => setShowNewDialog(true)}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Purchase Order
                  </Button>
                </div>
              </div>

              {/* Enhanced Table */}
              <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100">
                      <TableHead className="font-semibold text-slate-700">PO #</TableHead>
                      <TableHead className="font-semibold text-slate-700">Vendor</TableHead>
                      <TableHead className="font-semibold text-slate-700">Date</TableHead>
                      <TableHead className="font-semibold text-slate-700">Status</TableHead>
                      <TableHead className="font-semibold text-slate-700">Total</TableHead>
                      <TableHead className="font-semibold text-slate-700">Notes</TableHead>
                      <TableHead className="font-semibold text-slate-700">Attachments</TableHead>
                      <TableHead className="font-semibold text-slate-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPOs.map(po => (
                      <TableRow key={po.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                        <TableCell className="font-medium text-slate-800">{po.id}</TableCell>
                        <TableCell className="text-slate-700">{po.vendor}</TableCell>
                        <TableCell className="text-slate-600">{po.date}</TableCell>
                        <TableCell>
                          <Badge 
                            className={`${
                              po.status === 'Open' 
                                ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
                                : po.status === 'Received' 
                                  ? 'bg-green-100 text-green-700 border-green-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {po.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-slate-800">${po.total.toLocaleString()}</TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => setShowNotes({ type: 'po', data: po })}
                            className="hover:bg-slate-100"
                          >
                            Notes
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => setShowAttachment(po)}
                            className="hover:bg-slate-100"
                          >
                            Attachments
                          </Button>
                        </TableCell>
                        <TableCell className="space-x-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                <span className="sr-only">Open actions</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setViewPO(po)}>
                                <Eye className="mr-2 h-4 w-4" /> View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => alert('Mock download for ' + po.id)}>
                                <Download className="mr-2 h-4 w-4" /> Download
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Enhanced Dialogs */}
              <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
                <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                        <Plus className="h-5 w-5 text-white" />
                      </div>
                      New Purchase Order
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddPO} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">Vendor</label>
                        <Input 
                          placeholder="Vendor" 
                          value={newPO.vendor} 
                          onChange={e => setNewPO({ ...newPO, vendor: e.target.value })} 
                          required 
                          className="bg-white/50 border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">Date</label>
                        <Input 
                          type="date" 
                          value={newPO.date} 
                          onChange={e => setNewPO({ ...newPO, date: e.target.value })} 
                          required 
                          className="bg-white/50 border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Notes</label>
                      <Input 
                        placeholder="Notes" 
                        value={newPO.notes} 
                        onChange={e => setNewPO({ ...newPO, notes: e.target.value })} 
                        className="bg-white/50 border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-3 block">Items</label>
                      {newPO.items.map((item, idx) => (
                        <div key={idx} className="flex gap-3 mb-3 p-4 bg-slate-50/50 rounded-lg border border-slate-200">
                          <Input 
                            placeholder="SKU" 
                            value={item.sku} 
                            onChange={e => setNewPO({ ...newPO, items: newPO.items.map((it, i) => i === idx ? { ...it, sku: e.target.value } : it) })} 
                            className="w-24 bg-white/50 border-slate-200" 
                            required 
                          />
                          <Input 
                            placeholder="Name" 
                            value={item.name} 
                            onChange={e => setNewPO({ ...newPO, items: newPO.items.map((it, i) => i === idx ? { ...it, name: e.target.value } : it) })} 
                            className="w-40 bg-white/50 border-slate-200" 
                            required 
                          />
                          <Input 
                            type="number" 
                            placeholder="Qty" 
                            value={item.qty} 
                            min={1} 
                            onChange={e => setNewPO({ ...newPO, items: newPO.items.map((it, i) => i === idx ? { ...it, qty: Number(e.target.value) } : it) })} 
                            className="w-20 bg-white/50 border-slate-200" 
                            required 
                          />
                          <Input 
                            type="number" 
                            placeholder="Price" 
                            value={item.price} 
                            min={0} 
                            onChange={e => setNewPO({ ...newPO, items: newPO.items.map((it, i) => i === idx ? { ...it, price: Number(e.target.value) } : it) })} 
                            className="w-24 bg-white/50 border-slate-200" 
                            required 
                          />
                          <Button 
                            type="button" 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => setNewPO({ ...newPO, items: newPO.items.filter((_, i) => i !== idx) })} 
                            disabled={newPO.items.length === 1}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setNewPO({ ...newPO, items: [...newPO.items, { sku: "", name: "", qty: 1, price: 0 }] })}
                        className="border-slate-200 hover:bg-slate-50"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </div>
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowNewDialog(false)}
                        className="border-slate-200 hover:bg-slate-50"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Add Purchase Order
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Enhanced View PO Dialog */}
              <Dialog open={!!viewPO} onOpenChange={open => !open && setViewPO(null)}>
                <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                      <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
                        <Eye className="h-5 w-5 text-white" />
                      </div>
                      Purchase Order Details
                    </DialogTitle>
                  </DialogHeader>
                  {viewPO && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-200">
                            <div className="text-sm font-medium text-slate-600">PO #</div>
                            <div className="text-lg font-semibold text-slate-800">{viewPO.id}</div>
                          </div>
                          <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-200">
                            <div className="text-sm font-medium text-slate-600">Vendor</div>
                            <div className="text-lg font-semibold text-slate-800">{viewPO.vendor}</div>
                          </div>
                          <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-200">
                            <div className="text-sm font-medium text-slate-600">Date</div>
                            <div className="text-lg font-semibold text-slate-800">{viewPO.date}</div>
                          </div>
                          <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-200">
                            <div className="text-sm font-medium text-slate-600">Status</div>
                            <Badge 
                              className={`${
                                viewPO.status === 'Open' 
                                  ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
                                  : 'bg-green-100 text-green-700 border-green-200'
                              }`}
                            >
                              {viewPO.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                            <div className="text-sm font-medium text-emerald-600">Total Amount</div>
                            <div className="text-2xl font-bold text-emerald-800">${viewPO.total.toLocaleString()}</div>
                          </div>
                          <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-200">
                            <div className="text-sm font-medium text-slate-600">Notes</div>
                            <div className="text-slate-800">{viewPO.notes || "No notes"}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100">
                              <TableHead className="font-semibold text-slate-700">SKU</TableHead>
                              <TableHead className="font-semibold text-slate-700">Name</TableHead>
                              <TableHead className="font-semibold text-slate-700">Qty</TableHead>
                              <TableHead className="font-semibold text-slate-700">Price</TableHead>
                              <TableHead className="font-semibold text-slate-700">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {viewPO.items.map((item: any, idx: number) => (
                              <TableRow key={idx} className="hover:bg-slate-50/50 transition-colors duration-200">
                                <TableCell className="font-medium text-slate-800">{item.sku}</TableCell>
                                <TableCell className="text-slate-700">{item.name}</TableCell>
                                <TableCell className="text-slate-600">{item.qty}</TableCell>
                                <TableCell className="text-slate-600">${item.price.toLocaleString()}</TableCell>
                                <TableCell className="font-semibold text-slate-800">${(item.qty * item.price).toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setViewPO(null)}
                      className="border-slate-200 hover:bg-slate-50"
                    >
                      Close
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Enhanced Notes Modal */}
              {showNotes && (
                <Dialog open={!!showNotes} onOpenChange={() => setShowNotes(null)}>
                  <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        Notes
                      </DialogTitle>
                    </DialogHeader>
                    <textarea 
                      className="w-full border border-slate-200 rounded-lg px-4 py-3 mb-4 bg-white/50 focus:bg-white focus:shadow-lg transition-all duration-300 resize-none" 
                      rows={6} 
                      defaultValue={showNotes.data.notes || ""} 
                      placeholder="Add notes..." 
                    />
                    <DialogFooter>
                      <Button 
                        onClick={() => setShowNotes(null)}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Save & Close
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {/* Enhanced Attachments Modal */}
              {showAttachment && (
                <Dialog open={!!showAttachment} onOpenChange={() => setShowAttachment(null)}>
                  <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        Attachments
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="w-full p-3 border border-slate-200 rounded-lg bg-white/50 focus:bg-white focus:shadow-lg transition-all duration-300" 
                      />
                      <div className="text-xs text-slate-500 bg-slate-50/50 p-3 rounded-lg border border-slate-200">
                        (Mock upload, not saved)
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        onClick={() => setShowAttachment(null)}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Upload & Close
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </TabsContent>

            {/* Continue with other tabs... */}
            <TabsContent value="items-purchased" className="p-6 space-y-8">
              {/* Enhanced Items Purchased Tab */}
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1 min-w-40">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="mm/dd/yyyy" 
                    value={itemsFilter.date} 
                    onChange={e => setItemsFilter(f => ({ ...f, date: e.target.value }))} 
                    className="pl-10 bg-white/80 backdrop-blur-sm border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300" 
                  />
                </div>
                <div className="relative flex-1 min-w-40">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Vendor" 
                    value={itemsFilter.vendor} 
                    onChange={e => setItemsFilter(f => ({ ...f, vendor: e.target.value }))} 
                    className="pl-10 bg-white/80 backdrop-blur-sm border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300" 
                  />
                </div>
                <div className="relative flex-1 min-w-40">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="SKU/Style" 
                    value={itemsFilter.sku} 
                    onChange={e => setItemsFilter(f => ({ ...f, sku: e.target.value }))} 
                    className="pl-10 bg-white/80 backdrop-blur-sm border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300" 
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const filtered = itemsPurchased.filter(item =>
                      (!itemsFilter.date || item.date === itemsFilter.date) &&
                      (!itemsFilter.vendor || item.vendor.toLowerCase().includes(itemsFilter.vendor.toLowerCase())) &&
                      (!itemsFilter.sku || item.sku.toLowerCase().includes(itemsFilter.sku.toLowerCase()) || item.name.toLowerCase().includes(itemsFilter.sku.toLowerCase()))
                    );
                    exportToCSV("items-purchased.csv", filtered, ["sku","name","vendor","date","qty","price","po"]);
                  }}
                  className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                  aria-label="Export CSV"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const filtered = itemsPurchased.filter(item =>
                      (!itemsFilter.date || item.date === itemsFilter.date) &&
                      (!itemsFilter.vendor || item.vendor.toLowerCase().includes(itemsFilter.vendor.toLowerCase())) &&
                      (!itemsFilter.sku || item.sku.toLowerCase().includes(itemsFilter.sku.toLowerCase()) || item.name.toLowerCase().includes(itemsFilter.sku.toLowerCase()))
                    );
                    printTable(["SKU","Name","Vendor","Date","Qty","Price","PO #"], filtered.map(item => ({SKU: item.sku, Name: item.name, Vendor: item.vendor, Date: item.date, Qty: item.qty, Price: `$${item.price.toLocaleString()}`, "PO #": item.po})), "Items Purchased");
                  }}
                  className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                  aria-label="Print"
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </div>

              <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100">
                      <TableHead className="font-semibold text-slate-700">SKU</TableHead>
                      <TableHead className="font-semibold text-slate-700">Name</TableHead>
                      <TableHead className="font-semibold text-slate-700">Vendor</TableHead>
                      <TableHead className="font-semibold text-slate-700">Date</TableHead>
                      <TableHead className="font-semibold text-slate-700">Qty</TableHead>
                      <TableHead className="font-semibold text-slate-700">Price</TableHead>
                      <TableHead className="font-semibold text-slate-700">PO #</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itemsPurchased.filter(item =>
                      (!itemsFilter.date || item.date === itemsFilter.date) &&
                      (!itemsFilter.vendor || item.vendor.toLowerCase().includes(itemsFilter.vendor.toLowerCase())) &&
                      (!itemsFilter.sku || item.sku.toLowerCase().includes(itemsFilter.sku.toLowerCase()) || item.name.toLowerCase().includes(itemsFilter.sku.toLowerCase()))
                    ).map((item, idx) => (
                      <TableRow key={idx} className="hover:bg-slate-50/50 transition-colors duration-200">
                        <TableCell className="font-medium text-slate-800">{item.sku}</TableCell>
                        <TableCell className="text-slate-700">{item.name}</TableCell>
                        <TableCell className="text-slate-600">{item.vendor}</TableCell>
                        <TableCell className="text-slate-600">{item.date}</TableCell>
                        <TableCell className="text-slate-600">{item.qty}</TableCell>
                        <TableCell className="font-semibold text-slate-800">${item.price.toLocaleString()}</TableCell>
                        <TableCell className="font-medium text-slate-800">{item.po}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Continue with remaining tabs... */}
            <TabsContent value="backorders" className="p-6 space-y-8">
              {/* Enhanced Backorders Tab */}
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1 min-w-40">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="mm/dd/yyyy" 
                    value={backorderFilter.date} 
                    onChange={e => setBackorderFilter(f => ({ ...f, date: e.target.value }))} 
                    className="pl-10 bg-white/80 backdrop-blur-sm border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300" 
                  />
                </div>
                <div className="relative flex-1 min-w-40">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Vendor" 
                    value={backorderFilter.vendor} 
                    onChange={e => setBackorderFilter(f => ({ ...f, vendor: e.target.value }))} 
                    className="pl-10 bg-white/80 backdrop-blur-sm border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300" 
                  />
                </div>
                <div className="relative flex-1 min-w-40">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="SKU/Style" 
                    value={backorderFilter.sku} 
                    onChange={e => setBackorderFilter(f => ({ ...f, sku: e.target.value }))} 
                    className="pl-10 bg-white/80 backdrop-blur-sm border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300" 
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const filtered = backorders.filter(item =>
                      (!backorderFilter.date || item.date === backorderFilter.date) &&
                      (!backorderFilter.vendor || item.vendor.toLowerCase().includes(backorderFilter.vendor.toLowerCase())) &&
                      (!backorderFilter.sku || item.sku.toLowerCase().includes(backorderFilter.sku.toLowerCase()) || item.name.toLowerCase().includes(backorderFilter.sku.toLowerCase()))
                    );
                    exportToCSV("backorders.csv", filtered, ["sku","name","vendor","date","qty","po","status"]);
                  }}
                  className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                  aria-label="Export CSV"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const filtered = backorders.filter(item =>
                      (!backorderFilter.date || item.date === backorderFilter.date) &&
                      (!backorderFilter.vendor || item.vendor.toLowerCase().includes(backorderFilter.vendor.toLowerCase())) &&
                      (!backorderFilter.sku || item.sku.toLowerCase().includes(backorderFilter.sku.toLowerCase()) || item.name.toLowerCase().includes(backorderFilter.sku.toLowerCase()))
                    );
                    printTable(["SKU","Name","Vendor","Date","Qty","PO #","Status"], filtered.map(item => ({SKU: item.sku, Name: item.name, Vendor: item.vendor, Date: item.date, Qty: item.qty, "PO #": item.po, Status: item.status})), "Backorder Report");
                  }}
                  className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                  aria-label="Print"
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </div>

              <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100">
                      <TableHead className="font-semibold text-slate-700">SKU</TableHead>
                      <TableHead className="font-semibold text-slate-700">Name</TableHead>
                      <TableHead className="font-semibold text-slate-700">Vendor</TableHead>
                      <TableHead className="font-semibold text-slate-700">Date</TableHead>
                      <TableHead className="font-semibold text-slate-700">Qty</TableHead>
                      <TableHead className="font-semibold text-slate-700">PO #</TableHead>
                      <TableHead className="font-semibold text-slate-700">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backorders.filter(item =>
                      (!backorderFilter.date || item.date === backorderFilter.date) &&
                      (!backorderFilter.vendor || item.vendor.toLowerCase().includes(backorderFilter.vendor.toLowerCase())) &&
                      (!backorderFilter.sku || item.sku.toLowerCase().includes(backorderFilter.sku.toLowerCase()) || item.name.toLowerCase().includes(backorderFilter.sku.toLowerCase()))
                    ).map((item, idx) => (
                      <TableRow key={idx} className="hover:bg-slate-50/50 transition-colors duration-200">
                        <TableCell className="font-medium text-slate-800">{item.sku}</TableCell>
                        <TableCell className="text-slate-700">{item.name}</TableCell>
                        <TableCell className="text-slate-600">{item.vendor}</TableCell>
                        <TableCell className="text-slate-600">{item.date}</TableCell>
                        <TableCell className="text-slate-600">{item.qty}</TableCell>
                        <TableCell className="font-medium text-slate-800">{item.po}</TableCell>
                        <TableCell>
                          <Badge className="bg-red-100 text-red-700 border-red-200">
                            {item.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="vendors" className="p-6 space-y-8">
              {/* Enhanced Vendors Tab */}
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1 min-w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Search Vendor" 
                    value={vendorSearch} 
                    onChange={e => setVendorSearch(e.target.value)} 
                    className="pl-10 bg-white/80 backdrop-blur-sm border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300" 
                  />
                </div>
                <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                  <SelectTrigger className="w-48 bg-white/80 backdrop-blur-sm border-slate-200">
                    <SelectValue placeholder="Select Vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.filter(v => v.name.toLowerCase().includes(vendorSearch.toLowerCase())).map(v => (
                      <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const vendor = vendors.find(v => v.id === selectedVendor)
                    if (!vendor) return
                    const purchased = itemsPurchased.filter(item => item.vendor === vendor.name)
                    exportToCSV(`${vendor.name.replace(/\s+/g, "-").toLowerCase()}-items.csv`, purchased, ["sku","name","date","qty","price","po"])
                  }} 
                  disabled={!selectedVendor}
                  className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                  aria-label="Export CSV"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const vendor = vendors.find(v => v.id === selectedVendor)
                    if (!vendor) return
                    const purchased = itemsPurchased.filter(item => item.vendor === vendor.name)
                    printTable(["SKU","Name","Date","Qty","Price","PO #"], purchased.map(item => ({SKU: item.sku, Name: item.name, Date: item.date, Qty: item.qty, Price: `$${item.price.toLocaleString()}`, "PO #": item.po})), `${vendor.name} - Items Purchased`)
                  }} 
                  disabled={!selectedVendor}
                  className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                  aria-label="Print"
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </div>

              {selectedVendor && (() => {
                const vendor = vendors.find(v => v.id === selectedVendor)
                if (!vendor) return null
                const purchased = itemsPurchased.filter(item => item.vendor === vendor.name)
                return (
                  <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl p-6">
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-slate-800 mb-2">{vendor.name}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
                        <div>Contact: {vendor.contact}</div>
                        <div>Phone: {vendor.phone}</div>
                        <div>Address: {vendor.address}</div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <h4 className="font-semibold text-slate-700 mb-3">Items Purchased:</h4>
                      <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100">
                              <TableHead className="font-semibold text-slate-700">SKU</TableHead>
                              <TableHead className="font-semibold text-slate-700">Name</TableHead>
                              <TableHead className="font-semibold text-slate-700">Date</TableHead>
                              <TableHead className="font-semibold text-slate-700">Qty</TableHead>
                              <TableHead className="font-semibold text-slate-700">Price</TableHead>
                              <TableHead className="font-semibold text-slate-700">PO #</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {purchased.map((item, idx) => (
                              <TableRow key={idx} className="hover:bg-slate-50/50 transition-colors duration-200">
                                <TableCell className="font-medium text-slate-800">{item.sku}</TableCell>
                                <TableCell className="text-slate-700">{item.name}</TableCell>
                                <TableCell className="text-slate-600">{item.date}</TableCell>
                                <TableCell className="text-slate-600">{item.qty}</TableCell>
                                <TableCell className="font-semibold text-slate-800">${item.price.toLocaleString()}</TableCell>
                                <TableCell className="font-medium text-slate-800">{item.po}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </TabsContent>

            <TabsContent value="invoice-distribution" className="p-6 space-y-8">
              {/* Enhanced Invoice Distribution Tab */}
              <div className="flex flex-wrap gap-4 mb-6 items-center">
                <div className="relative flex-1 min-w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    type="text" 
                    placeholder="Search Invoice #, Vendor, or Date..." 
                    value={invoiceSearch} 
                    onChange={e => setInvoiceSearch(e.target.value)}
                    className="pl-10 bg-white/80 backdrop-blur-sm border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300"
                  />
                </div>
                <Select value={invoiceStatus} onValueChange={setInvoiceStatus}>
                  <SelectTrigger className="w-48 bg-white/80 backdrop-blur-sm border-slate-200">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Statuses</SelectItem>
                    <SelectItem value="Distributed">Distributed</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => exportToCSV("invoice-distribution.csv", apInvoices, ["id","vendor","date","amount"])}
                    className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                    aria-label="Export CSV"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => printTable(["Invoice #","Vendor","Date","Amount"], apInvoices.map(inv => ({"Invoice #": inv.id, Vendor: inv.vendor, Date: inv.date, Amount: `$${inv.amount.toLocaleString()}`})), "Invoice Distribution")}
                    className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                    aria-label="Print"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100">
                      <TableHead className="font-semibold text-slate-700">Invoice #</TableHead>
                      <TableHead className="font-semibold text-slate-700">Vendor</TableHead>
                      <TableHead className="font-semibold text-slate-700">Date</TableHead>
                      <TableHead className="font-semibold text-slate-700">Amount</TableHead>
                      <TableHead className="font-semibold text-slate-700">Status</TableHead>
                      <TableHead className="font-semibold text-slate-700">Notes</TableHead>
                      <TableHead className="font-semibold text-slate-700">Attachments</TableHead>
                      <TableHead className="font-semibold text-slate-700">Distribution</TableHead>
                      <TableHead className="font-semibold text-slate-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map(inv => (
                      <TableRow key={inv.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                        <TableCell className="font-medium text-slate-800">{inv.id}</TableCell>
                        <TableCell className="text-slate-700">{inv.vendor}</TableCell>
                        <TableCell className="text-slate-600">{inv.date}</TableCell>
                        <TableCell className="font-semibold text-slate-800">${inv.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge 
                            className={`${
                              inv.status === 'Distributed' 
                                ? 'bg-green-100 text-green-700 border-green-200' 
                                : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            }`}
                          >
                            {inv.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => setShowNotes({ type: 'invoice', data: inv })}
                            className="hover:bg-slate-100"
                          >
                            Notes
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => setShowAttachment(inv)}
                            className="hover:bg-slate-100"
                          >
                            Attachments
                          </Button>
                        </TableCell>
                        <TableCell>
                          {inv.distribution.length > 0 ? (
                            <ul className="text-xs space-y-1">
                              {inv.distribution.map((d: any, idx: number) => (
                                <li key={idx} className="text-slate-600">
                                  {glAccounts.find(a => a.code === d.account)?.name || d.account}: ${d.amount.toLocaleString()}
                                </li>
                              ))}
                            </ul>
                          ) : <span className="text-slate-500">Not distributed</span>}
                        </TableCell>
                        <TableCell className="space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => {
                              setDistDialog({ open: true, invoice: inv })
                              setDistRows(inv.distribution.length > 0 ? inv.distribution : [{ account: "5000", amount: inv.amount }])
                            }}
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                          >
                            Distribute
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => alert(`Reminder sent to ${inv.vendor}`)}
                            className="border-slate-200 hover:bg-slate-50"
                          >
                            Send Reminder
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setShowPayment(inv)}
                            className="border-slate-200 hover:bg-slate-50"
                          >
                            Record Payment
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Enhanced Payment Modal */}
              {showPayment && (
                <Dialog open={!!showPayment} onOpenChange={() => setShowPayment(null)}>
                  <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                          <CreditCard className="h-5 w-5 text-white" />
                        </div>
                        Record Payment
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mb-4">
                      <div className="p-3 bg-slate-50/50 rounded-lg border border-slate-200">
                        <div className="text-sm font-medium text-slate-600">Invoice: <span className="font-semibold text-slate-800">{showPayment.id}</span></div>
                        <div className="text-sm font-medium text-slate-600">Vendor: <span className="font-semibold text-slate-800">{showPayment.vendor}</span></div>
                        <div className="text-sm font-medium text-slate-600">Amount: <span className="font-semibold text-slate-800">${showPayment.amount.toLocaleString()}</span></div>
                      </div>
                    </div>
                    <form onSubmit={e => { e.preventDefault(); setShowPayment(null); alert('Payment recorded (mock)'); }} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Amount</label>
                        <Input 
                          name="amount" 
                          type="number" 
                          min="1" 
                          max={showPayment.amount} 
                          required 
                          className="bg-white/50 border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300" 
                          placeholder="Amount" 
                          defaultValue={showPayment.amount} 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                        <Input 
                          name="date" 
                          type="date" 
                          required 
                          className="bg-white/50 border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300" 
                          defaultValue={new Date().toISOString().slice(0,10)} 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
                        <Select name="method" defaultValue="Bank Transfer">
                          <SelectTrigger className="bg-white/50 border-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                            <SelectItem value="Check">Check</SelectItem>
                            <SelectItem value="Credit Card">Credit Card</SelectItem>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Reference / Check # (optional)</label>
                        <Input 
                          name="reference" 
                          type="text" 
                          className="bg-white/50 border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300" 
                          placeholder="Reference or check #" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Notes (optional)</label>
                        <textarea 
                          name="notes" 
                          className="w-full bg-white/50 border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:shadow-lg transition-all duration-300 resize-none" 
                          rows={2} 
                          placeholder="Internal notes about this payment" 
                        />
                      </div>
                      <Button 
                        type="submit"
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Record Payment
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}

              {/* Enhanced Distribution Dialog */}
              {distDialog.open && (
                <Dialog open={distDialog.open} onOpenChange={(open) => setDistDialog({ open, invoice: distDialog.invoice })}>
                  <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                          <Calculator className="h-5 w-5 text-white" />
                        </div>
                        Distribute Invoice
                      </DialogTitle>
                    </DialogHeader>
                    {distDialog.invoice && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-200">
                              <div className="text-sm font-medium text-slate-600">Invoice #</div>
                              <div className="text-lg font-semibold text-slate-800">{distDialog.invoice.id}</div>
                            </div>
                            <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-200">
                              <div className="text-sm font-medium text-slate-600">Vendor</div>
                              <div className="text-lg font-semibold text-slate-800">{distDialog.invoice.vendor}</div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                              <div className="text-sm font-medium text-emerald-600">Total Amount</div>
                              <div className="text-2xl font-bold text-emerald-800">${distDialog.invoice.amount.toLocaleString()}</div>
                            </div>
                            <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-200">
                              <div className="text-sm font-medium text-slate-600">Date</div>
                              <div className="text-lg font-semibold text-slate-800">{distDialog.invoice.date}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-slate-700 mb-3 block">Distribution Lines</label>
                          {distRows.map((row: any, idx: number) => (
                            <div key={idx} className="flex gap-3 mb-3 p-4 bg-slate-50/50 rounded-lg border border-slate-200">
                              <Select 
                                value={row.account} 
                                onValueChange={(value) => setDistRows(distRows.map((r: any, i: number) => i === idx ? { ...r, account: value } : r))}
                              >
                                <SelectTrigger className="w-48 bg-white/50 border-slate-200">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {glAccounts.map(account => (
                                    <SelectItem key={account.code} value={account.code}>
                                      {account.code} - {account.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Input 
                                type="number" 
                                placeholder="Amount" 
                                value={row.amount} 
                                min={0} 
                                onChange={e => setDistRows(distRows.map((r: any, i: number) => i === idx ? { ...r, amount: Number(e.target.value) } : r))} 
                                className="w-32 bg-white/50 border-slate-200" 
                                required 
                              />
                              <Button 
                                type="button" 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => setDistRows(distRows.filter((_: any, i: number) => i !== idx))} 
                                disabled={distRows.length === 1}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setDistRows([...distRows, { account: "5000", amount: 0 }])}
                            className="border-slate-200 hover:bg-slate-50"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Line
                          </Button>
                        </div>
                        
                        <DialogFooter>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setDistDialog({ open: false, invoice: null })}
                            className="border-slate-200 hover:bg-slate-50"
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={() => {
                              const total = distRows.reduce((sum: number, row: any) => sum + row.amount, 0);
                              if (total !== distDialog.invoice.amount) {
                                alert(`Total distribution (${total}) must equal invoice amount (${distDialog.invoice.amount})`);
                                return;
                              }
                              setApInvoices(apInvoices.map(inv => 
                                inv.id === distDialog.invoice.id 
                                  ? { ...inv, distribution: distRows }
                                  : inv
                              ));
                              setDistDialog({ open: false, invoice: null });
                            }}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            Save Distribution
                          </Button>
                        </DialogFooter>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              )}
            </TabsContent>

            <TabsContent value="vendor-analytics" className="p-6 space-y-8">
              {/* Enhanced Vendor Analytics Tab */}
              <h3 className="text-2xl font-bold text-slate-800 mb-6">Vendor Analytics</h3>
              
              {/* Top Vendors by Spend */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {vendors.map(vendor => {
                  const totalSpend = purchaseOrders.filter(po => po.vendor === vendor.name).reduce((sum, po) => sum + po.total, 0);
                  const outstanding = apInvoices.filter(inv => inv.vendor === vendor.name).reduce((sum, inv) => sum + inv.amount, 0);
                  const payments = apInvoices.filter(inv => inv.vendor === vendor.name && inv.distribution.length > 0);
                  const avgPayTime = payments.length ? Math.round(
                    payments.reduce((sum, inv) => {
                      const po = purchaseOrders.find(po => po.vendor === vendor.name);
                      if (!po) return sum;
                      return sum + Math.abs((new Date(inv.date).getTime() - new Date(po.date).getTime()) / (1000*60*60*24));
                    }, 0) / payments.length
                  ) : 0;
                  return (
                    <Card key={vendor.id} className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 group">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-sm font-semibold text-slate-700">{vendor.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="relative z-10 space-y-2">
                        <div className="text-2xl font-bold text-emerald-700">${totalSpend.toLocaleString()}</div>
                        <div className="text-xs text-slate-500">Outstanding: <span className="text-red-600 font-bold">${outstanding.toLocaleString()}</span></div>
                        <div className="text-xs text-slate-500">Avg Days to Pay: <span className="text-blue-700 font-bold">{avgPayTime}</span></div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              {/* Bar Chart: Top Vendors by Spend */}
              <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-800">Top Vendors by Spend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {vendors
                      .map(vendor => ({
                        name: vendor.name,
                        spend: purchaseOrders.filter(po => po.vendor === vendor.name).reduce((sum, po) => sum + po.total, 0)
                      }))
                      .sort((a, b) => b.spend - a.spend)
                      .map((v, idx, arr) => {
                        const max = arr[0]?.spend || 1;
                        return (
                          <div key={v.name} className="flex items-center gap-3">
                            <div className="w-32 text-sm font-medium text-slate-700 truncate">{v.name}</div>
                            <div className="flex-1 bg-slate-100 rounded-full h-3 relative overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-500" 
                                style={{ width: `${Math.max(8, (v.spend / max) * 100)}%` }}
                              ></div>
                            </div>
                            <div className="w-24 text-right text-sm font-semibold text-slate-800">${v.spend.toLocaleString()}</div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  )
}