"use client";

import { useState } from "react";
import { Search, Filter, Download, AlertTriangle, User, Calendar, Plus, X, Paperclip, Crown, Sparkles, Gem, RefreshCw, ArrowLeft, TrendingUp, Clock, DollarSign, ShoppingBag, Zap, Award, Globe, Briefcase, Database, Warehouse, Diamond, Circle, Square, Hexagon, Upload, Eye, Edit, Trash2, Folder, File, Wrench, Cog, Activity, Shield, Package, Truck, Scale, Factory, Building, Hammer, Drill, Compass, Ruler, Microscope, Thermometer, Gauge, Battery, Power, Lightbulb, Monitor, Printer, Camera, Phone, Tablet, Laptop, Server, Router, Cable, Plug, Keyboard, Mouse, Headphones, Speaker, Webcam, Projector, MessageSquare, CreditCard, Receipt, Calculator, PiggyBank, TrendingDown, Percent, Target, BarChart3, PieChart, LineChart, AreaChart, ScatterChart, Kanban, CalendarDays, CalendarRange, CalendarCheck, CalendarX, CalendarPlus, CalendarMinus, CalendarClock, CalendarHeart, CalendarSearch } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, FileText, Mail, CheckCircle, XCircle } from "lucide-react"

// --- Mock Data Types ---
type Status = "Paid" | "Unpaid" | "Partial" | "Overdue";
interface Invoice {
  id: string;
  invoiceNumber: string;
  orderNumber: string;
  customer: string;
  customerEmail: string;
  issued: string;
  due: string;
  amount: number;
  paid: number;
  status: Status;
  lastPayment?: string;
  lastReminder?: string;
  notes?: string;
  attachments?: string[];
}

// --- Mock Data ---
const mockInvoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-1001",
    orderNumber: "ORD-1001",
    customer: "William Kim",
    customerEmail: "william.kim@email.com",
    issued: "2024-06-01",
    due: "2024-06-15",
    amount: 12000,
    paid: 12000,
    status: "Paid",
    lastPayment: "2024-06-10",
    notes: "Paid early. VIP customer.",
    attachments: [],
  },
  {
    id: "2",
    invoiceNumber: "INV-1002",
    orderNumber: "ORD-1002",
    customer: "Emma Wilson",
    customerEmail: "emma.wilson@email.com",
    issued: "2024-06-05",
    due: "2024-06-20",
    amount: 8000,
    paid: 4000,
    status: "Partial",
    lastPayment: "2024-06-18",
    notes: "Waiting for balance.",
    attachments: [],
  },
  {
    id: "3",
    invoiceNumber: "INV-1003",
    orderNumber: "ORD-1003",
    customer: "Noah Garcia",
    customerEmail: "noah.garcia@email.com",
    issued: "2024-05-20",
    due: "2024-06-10",
    amount: 15000,
    paid: 0,
    status: "Overdue",
    notes: "Sent reminder 2 days ago.",
    attachments: [],
  },
  {
    id: "4",
    invoiceNumber: "INV-1004",
    orderNumber: "ORD-1004",
    customer: "Lisa Chen",
    customerEmail: "lisa.chen@email.com",
    issued: "2024-06-10",
    due: "2024-06-30",
    amount: 5000,
    paid: 0,
    status: "Unpaid",
    attachments: [],
  },
];

const statusColors = {
  Paid: "bg-green-100 text-green-700",
  Unpaid: "bg-gray-100 text-gray-700",
  Partial: "bg-blue-100 text-blue-700",
  Overdue: "bg-red-100 text-red-700",
};

const agingBuckets = [
  { label: "0-30 days", min: 0, max: 30 },
  { label: "31-60 days", min: 31, max: 60 },
  { label: "61-90 days", min: 61, max: 90 },
  { label: "90+ days", min: 91, max: 9999 },
];

function daysBetween(a: string, b: string) {
  return Math.floor((new Date(a).getTime() - new Date(b).getTime()) / (1000 * 60 * 60 * 24));
}

export default function AccountsReceivablePage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<Status | "All">("All");
  const [sort, setSort] = useState("due-desc");
  const [showPayment, setShowPayment] = useState<Invoice | null>(null);
  const [showNotes, setShowNotes] = useState<Invoice | null>(null);
  const [showCustomer, setShowCustomer] = useState<Invoice | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [showPDF, setShowPDF] = useState<Invoice | null>(null);
  const [paymentForm, setPaymentForm] = useState({ amount: "", date: new Date().toISOString().slice(0,10), method: "Bank Transfer", reference: "", notes: "" });

  // Summary
  const totalOutstanding = invoices.filter(i => i.status !== "Paid").reduce((sum, i) => sum + (i.amount - i.paid), 0);
  const totalOverdue = invoices.filter(i => i.status === "Overdue").reduce((sum, i) => sum + (i.amount - i.paid), 0);
  const paidThisMonth = invoices.filter(i => i.lastPayment && new Date(i.lastPayment).getMonth() === new Date().getMonth()).reduce((sum, i) => sum + (i.paid), 0);
  const avgDaysToPay = Math.round(
    invoices.filter(i => i.status === "Paid").reduce((sum, i) => sum + daysBetween(i.lastPayment!, i.issued), 0) /
    (invoices.filter(i => i.status === "Paid").length || 1)
  );

  // Table data
  let filtered = invoices.filter(i =>
    (status === "All" || i.status === status) &&
    (i.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      i.customer.toLowerCase().includes(search.toLowerCase()) ||
      i.orderNumber.toLowerCase().includes(search.toLowerCase()))
  );
  filtered = filtered.sort((a, b) => {
    if (sort === "due-desc") return b.due.localeCompare(a.due);
    if (sort === "due-asc") return a.due.localeCompare(b.due);
    if (sort === "amount-desc") return b.amount - a.amount;
    if (sort === "amount-asc") return a.amount - b.amount;
    return 0;
  });

  // Aging buckets
  const today = new Date().toISOString().slice(0, 10);
  const aging = agingBuckets.map(bucket => ({
    ...bucket,
    total: invoices.filter(i => i.status !== "Paid" && daysBetween(today, i.due) >= bucket.min && daysBetween(today, i.due) <= bucket.max).reduce((sum, i) => sum + (i.amount - i.paid), 0)
  }));

  // Handlers
  const handleRecordPayment = (invoice: Invoice, amount: number, date: string) => {
    setInvoices(inv => inv.map(i =>
      i.id === invoice.id
        ? {
            ...i,
            paid: i.paid + amount,
            lastPayment: date,
            status: i.paid + amount >= i.amount ? "Paid" : "Partial"
          }
        : i
    ));
    setShowPayment(null);
  };
  const handleSendReminder = (invoice: Invoice) => {
    setInvoices(inv => inv.map(i =>
      i.id === invoice.id
        ? { ...i, lastReminder: new Date().toISOString().slice(0, 10) }
        : i
    ));
    alert(`Reminder sent to ${invoice.customerEmail}`);
  };
  const handleExport = () => {
    alert("Exported as CSV");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/50 relative overflow-hidden">
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
          <div className="relative p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-lg">
                    <Receipt className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent tracking-tight">
                      Accounts Receivable
                    </h1>
                    <p className="text-slate-600 text-lg font-medium">Manage invoices, track payments, and monitor cash flow</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-green-500" />
                    <span>Advanced Payment Tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gem className="h-4 w-4 text-emerald-500" />
                    <span>Automated Reminders</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 items-center">
                <Button 
                  variant="outline" 
                  size="icon"
                  className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                  aria-label="Refresh"
                  title="Refresh"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleExport}
                  className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                  aria-label="Export"
                  title="Export"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Analytics Cards - Matching Dashboard Style */}
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
                          <DollarSign className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Total Outstanding</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Receivables
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        ${totalOutstanding.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>{invoices.filter(i => i.status !== "Paid").length} invoices pending</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Total amount outstanding from customers
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <AlertTriangle className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Overdue Amount</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Critical
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        ${totalOverdue.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <TrendingDown className="h-3 w-3" />
                        <span>{invoices.filter(i => i.status === "Overdue").length} overdue invoices</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Amount overdue beyond due date
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Paid This Month</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Collections
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        ${paidThisMonth.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <Clock className="h-3 w-3" />
                        <span>{avgDaysToPay} days avg to pay</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Total payments received this month
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <Percent className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Collection Rate</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Performance
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        94.2%
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>+2.1% from last month</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Success rate of payment collections
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Main Content */}
        <div className="relative">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-8">
            {/* Enhanced Aging Buckets */}
            <div className="flex gap-4 mb-8 flex-wrap">
              {aging.map(bucket => (
                <div key={bucket.label} className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative p-4 flex flex-col items-center min-w-[110px] z-10">
                    <div className="text-xs text-slate-500 mb-1">{bucket.label}</div>
                    <div className="text-lg font-bold text-slate-800">${bucket.total.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced Filters & Actions */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl"></div>
              <div className="relative p-6">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search invoices, customers, orders..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="pl-10 bg-white/80 backdrop-blur-sm border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300"
                    />
                  </div>
                  <Select value={status} onValueChange={(value) => setStatus(value as Status | "All")}>
                    <SelectTrigger className="w-[140px] bg-white/80 backdrop-blur-sm border-slate-200">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl">
                      <SelectItem value="All">All Statuses</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Unpaid">Unpaid</SelectItem>
                      <SelectItem value="Partial">Partial</SelectItem>
                      <SelectItem value="Overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger className="w-[140px] bg-white/80 backdrop-blur-sm border-slate-200">
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl">
                      <SelectItem value="due-desc">Due: Newest</SelectItem>
                      <SelectItem value="due-asc">Due: Oldest</SelectItem>
                      <SelectItem value="amount-desc">Amount: High-Low</SelectItem>
                      <SelectItem value="amount-asc">Amount: Low-High</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleExport}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Download className="mr-2 h-4 w-4" /> Export
                  </Button>
                </div>
              </div>
            </div>

            {/* Enhanced Table */}
            <div className="overflow-x-auto w-full">
              <Table className="w-full table-fixed min-w-[900px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[110px]">Invoice #</TableHead>
                    <TableHead className="w-[140px]">Order #</TableHead>
                    <TableHead className="w-[140px]">Customer</TableHead>
                    <TableHead className="w-[140px]">Issued</TableHead>
                    <TableHead className="w-[110px]">Due</TableHead>
                    <TableHead className="w-[100px]">Amount</TableHead>
                    <TableHead className="w-[100px]">Paid</TableHead>
                    <TableHead className="w-[90px]">Status</TableHead>
                    <TableHead className="w-[120px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono text-xs text-slate-800">{inv.invoiceNumber}</TableCell>
                      <TableCell className="font-mono text-xs">
                        <Link href={`/dashboard/orders/${inv.orderNumber}`} className="text-emerald-700 hover:underline">
                          {inv.orderNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-emerald-700 hover:underline cursor-pointer" onClick={() => setShowCustomer(inv)}>{inv.customer}</div>
                      </TableCell>
                      <TableCell>{inv.issued}</TableCell>
                      <TableCell>{inv.due}</TableCell>
                      <TableCell>${inv.amount.toLocaleString()}</TableCell>
                      <TableCell>${inv.paid.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[inv.status]}`}>{inv.status}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setShowPayment(inv)}>
                              <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" /> Record Payment
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendReminder(inv)}>
                              <Mail className="mr-2 h-4 w-4 text-yellow-500" /> Send Reminder
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setShowPDF(inv)}>
                              <FileText className="mr-2 h-4 w-4" /> View PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setShowNotes(inv)}>
                              <FileText className="mr-2 h-4 w-4" /> View Notes
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Modals */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl max-w-md w-full p-6 relative border border-white/20">
            <button className="absolute top-2 right-2 p-2 rounded-full hover:bg-slate-100 transition-colors duration-200" onClick={() => { setShowPayment(null); setPaymentForm({ amount: "", date: new Date().toISOString().slice(0,10), method: "Bank Transfer", reference: "", notes: "" }); }} aria-label="Close"><X className="h-5 w-5" /></button>
            <h2 className="text-lg font-bold mb-4 text-slate-800">Record Payment</h2>
            <div className="mb-2 text-sm text-slate-600">Invoice: <b className="text-slate-800">{showPayment.invoiceNumber}</b></div>
            <div className="mb-2 text-sm text-slate-600">Customer: <b className="text-slate-800">{showPayment.customer}</b></div>
            <div className="mb-2 text-sm text-slate-600">Due: <b className="text-slate-800">{showPayment.due}</b></div>
            <div className="mb-2 text-sm text-slate-600">Amount Due: <b className="text-slate-800">${(showPayment.amount - showPayment.paid).toLocaleString()}</b></div>
            <form onSubmit={e => {
              e.preventDefault();
              const amount = Number(paymentForm.amount);
              const date = paymentForm.date;
              handleRecordPayment(showPayment, amount, date);
              setPaymentForm({ amount: "", date: new Date().toISOString().slice(0,10), method: "Bank Transfer", reference: "", notes: "" });
            }}>
              <div className="mb-2">
                <label className="block text-xs font-semibold mb-1 text-slate-700">Amount</label>
                <Input name="amount" type="number" min="1" max={showPayment.amount - showPayment.paid} required className="bg-white/80 backdrop-blur-sm border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300" placeholder="Amount"
                  value={paymentForm.amount} onChange={e => setPaymentForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
              <div className="mb-2">
                <label className="block text-xs font-semibold mb-1 text-slate-700">Date</label>
                <Input name="date" type="date" required className="bg-white/80 backdrop-blur-sm border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300" value={paymentForm.date} onChange={e => setPaymentForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="mb-2">
                <label className="block text-xs font-semibold mb-1 text-slate-700">Payment Method</label>
                <Select name="method" value={paymentForm.method} onValueChange={(value) => setPaymentForm(f => ({ ...f, method: value }))}>
                  <SelectTrigger className="bg-white/80 backdrop-blur-sm border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl">
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Check">Check</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="mb-2">
                <label className="block text-xs font-semibold mb-1 text-slate-700">Reference / Check # (optional)</label>
                <Input name="reference" type="text" className="bg-white/80 backdrop-blur-sm border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300" value={paymentForm.reference} onChange={e => setPaymentForm(f => ({ ...f, reference: e.target.value }))} placeholder="Reference or check #" />
              </div>
              <div className="mb-2">
                <label className="block text-xs font-semibold mb-1 text-slate-700">Notes (optional)</label>
                <textarea name="notes" className="w-full border border-slate-200 rounded px-3 py-2 bg-white/80 backdrop-blur-sm focus:bg-white focus:shadow-lg transition-all duration-300" rows={2} value={paymentForm.notes} onChange={e => setPaymentForm(f => ({ ...f, notes: e.target.value }))} placeholder="Internal notes about this payment" />
              </div>
              {/* Payment summary */}
              <div className="bg-slate-50 rounded p-2 mb-3 text-xs">
                <div className="flex justify-between"><span>Amount Due:</span><span>${(showPayment.amount - showPayment.paid).toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Payment:</span><span>{paymentForm.amount ? `$${Number(paymentForm.amount).toLocaleString()}` : '-'}</span></div>
                <div className="flex justify-between"><span>Remaining:</span><span>{paymentForm.amount ? `$${Math.max(0, showPayment.amount - showPayment.paid - Number(paymentForm.amount)).toLocaleString()}` : '-'}</span></div>
              </div>
              <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">Record Payment</Button>
            </form>
          </div>
        </div>
      )}
      {showNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl max-w-md w-full p-6 relative border border-white/20">
            <button className="absolute top-2 right-2 p-2 rounded-full hover:bg-slate-100 transition-colors duration-200" onClick={() => setShowNotes(null)} aria-label="Close"><X className="h-5 w-5" /></button>
            <h2 className="text-lg font-bold mb-4 text-slate-800">Notes for {showNotes.invoiceNumber}</h2>
            <textarea className="w-full border border-slate-200 rounded px-3 py-2 mb-3 bg-white/80 backdrop-blur-sm focus:bg-white focus:shadow-lg transition-all duration-300" rows={4} defaultValue={showNotes.notes || ""} placeholder="Add notes..." />
            <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" onClick={() => setShowNotes(null)}>Save</Button>
          </div>
        </div>
      )}
      {showCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl max-w-md w-full p-6 relative border border-white/20">
            <button className="absolute top-2 right-2 p-2 rounded-full hover:bg-slate-100 transition-colors duration-200" onClick={() => setShowCustomer(null)} aria-label="Close"><X className="h-5 w-5" /></button>
            <h2 className="text-lg font-bold mb-4 text-slate-800">Customer: {showCustomer.customer}</h2>
            <div className="mb-2 text-sm text-slate-600">Email: {showCustomer.customerEmail}</div>
            <div className="mb-2 text-sm text-slate-600">Total Outstanding: <b className="text-slate-800">${invoices.filter(i => i.customer === showCustomer.customer && i.status !== "Paid").reduce((sum, i) => sum + (i.amount - i.paid), 0).toLocaleString()}</b></div>
            <div className="mb-2 text-sm text-slate-600">Last Payment: {showCustomer.lastPayment || "-"}</div>
            <div className="mb-2 text-sm text-slate-600">Notes: {showCustomer.notes || "-"}</div>
            <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 mt-4" onClick={() => alert('Send email to customer')}>Send Email</Button>
          </div>
        </div>
      )}
      {showPDF && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl max-w-2xl w-full p-6 relative border border-white/20">
            <button className="absolute top-2 right-2 p-2 rounded-full hover:bg-slate-100 transition-colors duration-200" onClick={() => setShowPDF(null)} aria-label="Close"><X className="h-5 w-5" /></button>
            <h2 className="text-lg font-bold mb-4 text-slate-800">Invoice PDF Preview</h2>
            <div className="bg-slate-100 rounded p-4 mb-4 text-xs max-h-96 overflow-auto">
              {/* Mock PDF preview */}
              <div className="text-center text-lg font-bold mb-2">INVOICE</div>
              <div className="flex justify-between mb-2">
                <div>
                  <div className="font-semibold">Invoice #: {showPDF.invoiceNumber}</div>
                  <div>Order #: {showPDF.orderNumber}</div>
                  <div>Issued: {showPDF.issued}</div>
                  <div>Due: {showPDF.due}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">Customer:</div>
                  <div>{showPDF.customer}</div>
                  <div className="text-xs text-slate-500">{showPDF.customerEmail}</div>
                </div>
              </div>
              <div className="border-t border-b py-2 my-2 flex justify-between">
                <span>Amount:</span>
                <span>${showPDF.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Paid:</span>
                <span>${showPDF.paid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Status:</span>
                <span>{showPDF.status}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Last Payment:</span>
                <span>{showPDF.lastPayment || '-'}</span>
              </div>
              <div className="mt-2 text-xs text-slate-500">Note: {showPDF.notes || '-'}</div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" onClick={() => alert('Download PDF')}>Download PDF</Button>
              <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" onClick={() => alert(`Sent to ${showPDF.customerEmail}`)}>Send to Customer</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 
 