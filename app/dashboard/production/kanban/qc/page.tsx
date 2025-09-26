"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { CheckCircle, Calendar, Search, Download, Printer, ChevronDown, ChevronUp, Filter, Plus, XCircle, Users, ArrowDownCircle, Paperclip, Clock, AlertTriangle, Eye, ArrowLeft, MessageSquare, MoreHorizontal } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as UICalendar } from "@/components/ui/calendar";
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from "date-fns";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import Link from "next/link";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MessageAssigneeDialog } from "@/components/orders/message-assignee-dialog";
import jsPDF from "jspdf";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

const staffList = ["Sarah Johnson", "David Chen", "Emily Rodriguez", "Michael Kim"];
const customerList = ["Sophia Lee", "Michael Chen", "Ava Patel", "Liam Smith", "Emma Wilson", "James Brown"];
const priorityList = ["High", "Medium", "Low"];
const statusList = ["In Progress", "Review", "Approved", "Revise"];

const mockQCOrders = [
  {
    qcId: 'QC-2024-0001',
    customerName: 'Sophia Chen',
    customerId: '1',
    status: 'In Progress',
    priority: 'High',
    assignedTo: 'Sarah Johnson',
    dueDate: '2024-07-25T20:00:00Z',
    notes: 'Final quality inspection for platinum engagement ring with diamond accents. Check stone security, finish quality, and overall craftsmanship.',
    revisions: 1,
    files: [{ name: "qc-checklist.pdf" }, { name: "inspection-photos.pdf" }],
    orderNumber: 'ORD-1001',
    polishingId: 'POL-2024-0001',
  },
  {
    qcId: 'QC-2024-0002',
    customerName: 'Ethan Davis',
    customerId: '2',
    status: 'Review',
    priority: 'Medium',
    assignedTo: 'David Chen',
    dueDate: '2024-07-29T20:00:00Z',
    notes: 'Quality control for gold pendant with sapphire center stone. Verify stone setting, metal finish, and chain integrity.',
    revisions: 2,
    files: [{ name: "qc-report.pdf" }],
    orderNumber: 'ORD-1002',
    polishingId: 'POL-2024-0002',
  },
  {
    qcId: 'QC-2024-0003',
    customerName: 'Ava Martinez',
    customerId: '3',
    status: 'Approved',
    priority: 'Low',
    assignedTo: 'Emily Rodriguez',
    dueDate: '2024-07-22T20:00:00Z',
    notes: 'Mixed metal bracelet passed all quality checks. Stone security, finish, and clasp mechanism all meet standards.',
    revisions: 0,
    files: [{ name: "final-qc-report.pdf" }, { name: "approval-certificate.pdf" }],
    orderNumber: 'ORD-1003',
    polishingId: 'POL-2024-0003',
  },
  {
    qcId: 'QC-2024-0004',
    customerName: 'Liam Smith',
    customerId: '4',
    status: 'Revise',
    priority: 'High',
    assignedTo: 'Michael Kim',
    dueDate: '2024-08-03T20:00:00Z',
    notes: 'Wedding band failed quality inspection - minor scratch on inner band surface. Requires re-polishing before final approval.',
    revisions: 3,
    files: [{ name: "rejection-report.pdf" }, { name: "issue-photos.pdf" }],
    orderNumber: 'ORD-1004',
    polishingId: 'POL-2024-0004',
  },
];

const statusSummary = [
  { key: "all", label: "Total QC Orders", value: mockQCOrders.length, color: "bg-emerald-100 text-emerald-800", icon: CheckCircle },
  { key: "In Progress", label: "In Progress", value: mockQCOrders.filter(q => q.status === "In Progress").length, color: "bg-blue-100 text-blue-800", icon: Clock },
  { key: "Review", label: "Under Review", value: mockQCOrders.filter(q => q.status === "Review").length, color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle },
  { key: "Approved", label: "Approved", value: mockQCOrders.filter(q => q.status === "Approved").length, color: "bg-green-100 text-green-800", icon: CheckCircle },
  { key: "Revise", label: "Revise", value: mockQCOrders.filter(q => q.status === "Revise").length, color: "bg-red-100 text-red-800", icon: XCircle },
];

const statusColors: { [key: string]: string } = {
  "In Progress": "bg-blue-100 text-blue-800",
  "Review": "bg-yellow-100 text-yellow-800",
  "Approved": "bg-green-100 text-green-800",
  "Revise": "bg-red-100 text-red-800",
};

const assignees = Array.from(new Set(mockQCOrders.map(q => q.assignedTo)));

function DateCell({ date }: { date: string }) {
  const [formatted, setFormatted] = useState("");
  useEffect(() => {
    setFormatted(format(parseISO(date), "PPpp"));
  }, [date]);
  return <span>{formatted}</span>;
}

// Inline luxury date filter component
function LuxuryDateFilter({ dateRange, setDateRange }: { dateRange: DateRange | undefined, setDateRange: (range: DateRange | undefined) => void }) {
  const [open, setOpen] = useState(false);
  const [internalRange, setInternalRange] = useState<DateRange | undefined>(dateRange);
  const presets = [
    { label: "Last 7 days", range: { from: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), to: new Date() } },
    { label: "This Month", range: { from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), to: new Date() } },
    { label: "Next 30 days", range: { from: new Date(), to: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000) } },
    { label: "Year to Date", range: { from: new Date(new Date().getFullYear(), 0, 1), to: new Date() } },
  ];
  React.useEffect(() => { setInternalRange(dateRange); }, [dateRange]);
  const handleRangeSelect = (range: DateRange | undefined) => {
    setInternalRange(range);
    if (range?.from && range?.to) {
      setDateRange(range);
      setOpen(false);
    }
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1 luxury-date-btn min-w-[170px]" aria-label="Filter by date">
          <Calendar className="h-4 w-4 text-emerald-600" />
          {dateRange?.from && dateRange?.to ? `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}` : "Date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[520px] p-4 rounded-2xl shadow-2xl bg-white border-emerald-100" align="end">
        <div className="mb-3 font-semibold text-emerald-900 text-lg">Filter by Date</div>
        <div className="flex flex-wrap gap-2 mb-4">
          {presets.map((preset) => (
            <Button key={preset.label} size="sm" variant="secondary" className="rounded-full border border-emerald-200 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition" onClick={() => { setDateRange(preset.range); setOpen(false); }}>
              {preset.label}
            </Button>
          ))}
        </div>
        <UICalendar
          mode="range"
          selected={internalRange}
          onSelect={handleRangeSelect}
          numberOfMonths={2}
          className="border rounded-xl shadow-lg p-2 bg-white luxury-calendar"
        />
        <Button variant="ghost" size="sm" className="w-full mt-4 text-emerald-700 hover:bg-emerald-50" onClick={() => { setDateRange(undefined); setInternalRange(undefined); setOpen(false); }}>
          Clear Date Filter
        </Button>
      </PopoverContent>
    </Popover>
  );
}

export default function QCStagePage() {
  const [activeSummary, setActiveSummary] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("dueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterStaff, setFilterStaff] = useState<string | null>(null);
  const [filterCustomer, setFilterCustomer] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({ from: undefined, to: undefined });
  const [showFilter, setShowFilter] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [assignee, setAssignee] = useState("");
  const [contactDialog, setContactDialog] = useState<{ open: boolean; assignee: string | null }>({ open: false, assignee: null });
  const [qcOrders, setQCOrders] = useState(mockQCOrders);
  const router = useRouter();

  const filteredQCOrders = mockQCOrders.filter(qc => {
    if (activeSummary !== "all" && qc.status !== activeSummary) return false;
    if (search && !qc.customerName.toLowerCase().includes(search.toLowerCase()) && !qc.qcId.toLowerCase().includes(search.toLowerCase())) return false;
    if (dateRange && dateRange.from && dateRange.to) {
      const qcDate = parseISO(qc.dueDate);
      if (!isWithinInterval(qcDate, { start: dateRange.from, end: dateRange.to })) return false;
    }
    if (assignee && qc.assignedTo !== assignee) return false;
    return true;
  });

  // Sorting function
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };
  
  // Sort the filtered data
  const sortedQCOrders = [...filteredQCOrders].sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (sortBy) {
      case "qcId":
        aValue = a.qcId;
        bValue = b.qcId;
        break;
      case "customerName":
        aValue = a.customerName;
        bValue = b.customerName;
        break;
      case "status":
        aValue = a.status;
        bValue = b.status;
        break;
      case "priority":
        aValue = a.priority;
        bValue = b.priority;
        break;
      case "assignedTo":
        aValue = a.assignedTo;
        bValue = b.assignedTo;
        break;
      case "dueDate":
        aValue = new Date(a.dueDate);
        bValue = new Date(b.dueDate);
        break;
      case "revisions":
        aValue = a.revisions;
        bValue = b.revisions;
        break;
      default:
        aValue = a[sortBy as keyof typeof a];
        bValue = b[sortBy as keyof typeof b];
    }
    
    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Analytics
  const totalQCOrders = sortedQCOrders.length;
  const qcOrdersByStaff = staffList.map(staff => ({ staff, count: sortedQCOrders.filter(qc => qc.assignedTo === staff).length }));

  // Useful analytics
  const avgRevisions = sortedQCOrders.length ? (sortedQCOrders.reduce((sum, q) => sum + q.revisions, 0) / sortedQCOrders.length).toFixed(1) : 0;

  function handleExport(type: 'csv' | 'pdf') {
    setExporting(true);
    setTimeout(() => setExporting(false), 1200);
  }

  function handlePrint() {
    setPrinting(true);
    setTimeout(() => setPrinting(false), 1200);
  }

  // Handler for Contact Assignee
  function handleContactAssignee(assignee: string) {
    setContactDialog({ open: true, assignee });
  }

  // Handler for Download PDF
  function handleDownloadPDF(qc: any) {
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(18);
    doc.text("Quality Control Order Detail", 10, y);
    y += 10;
    doc.setFontSize(12);
    doc.text(`QC ID: ${qc.qcId}`, 10, y); y += 8;
    doc.text(`Customer: ${qc.customerName} (${qc.customerId || ''})`, 10, y); y += 8;
    doc.text(`Status: ${qc.status}`, 10, y); y += 8;
    doc.text(`Priority: ${qc.priority}`, 10, y); y += 8;
    doc.text(`Assigned To: ${qc.assignedTo}`, 10, y); y += 8;
    doc.text(`Due Date: ${format(parseISO(qc.dueDate), "PPpp")}`, 10, y); y += 8;
    doc.text(`Revisions: ${qc.revisions}`, 10, y); y += 8;
    doc.text(`Order Number: ${qc.orderNumber}`, 10, y); y += 8;
    doc.text(`Polishing ID: ${qc.polishingId}`, 10, y); y += 8;
    doc.text("Notes:", 10, y); y += 6;
    doc.setFontSize(11);
    doc.text(doc.splitTextToSize(qc.notes || '', 180), 12, y); y += 12 + 6 * Math.ceil((qc.notes || '').length / 80);
    doc.save(`${qc.qcId}.pdf`);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Review': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Revise': return 'bg-red-300 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-300 text-red-900 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Header */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-0 pt-10 pb-4">
        <div className="flex items-center justify-between mb-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-emerald-200/50 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent tracking-tight">Quality Control Stage Management</h1>
              <p className="text-md text-emerald-600 font-medium">Track and manage all quality control orders</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 min-w-[160px]">
            <Button className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:from-emerald-700 hover:to-green-700 hover:shadow-xl transition-all duration-300 flex items-center gap-2 w-full">
              <Plus className="w-5 h-5" /> New QC Order
            </Button>
            <div className="flex gap-2 mt-1">
              <Link href="/dashboard/production/kanban/polishing">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-full" title="Back to Polishing">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="relative z-10 max-w-7xl mx-auto mb-8 flex justify-center">
        <div className="flex justify-center gap-4 flex-wrap px-4 md:px-0">
          {statusSummary.map((s) => {
            let bg = '';
            let text = 'text-emerald-700';
            if (s.key === 'all') bg = 'bg-gray-100';
            else if (s.key === 'In Progress') bg = 'bg-blue-100';
            else if (s.key === 'Review') bg = 'bg-yellow-100';
            else if (s.key === 'Approved') bg = 'bg-green-100';
            else if (s.key === 'Revise') { bg = 'bg-red-300'; text = 'text-red-900'; }
            return (
              <Card key={s.key} className={cn(`w-52 flex flex-col items-center justify-center p-4 cursor-pointer border-2 shadow-xl rounded-2xl ${bg} transition-all duration-300`, activeSummary === s.key ? 'border-emerald-600 ring-2 ring-emerald-200 scale-105' : 'border-transparent hover:border-emerald-200 hover:scale-105')}
                onClick={() => setActiveSummary(s.key)}>
                <CardContent className="flex flex-col items-center justify-center p-0">
                  <s.icon className="w-7 h-7 mb-2 text-emerald-600" />
                  <div className="text-2xl font-extrabold text-emerald-900">{s.value}</div>
                  <div className={`text-xs font-medium mt-1 ${text}`}>{s.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="relative z-10 max-w-7xl mx-auto mb-8 px-4 md:px-0">
        <Card className="p-6 shadow-xl rounded-2xl bg-white/80 border-emerald-100 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <Input
              placeholder="Search by customer or QC #..."
              className="w-full md:w-56 bg-white/70 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 rounded-xl"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select
              className="border rounded-xl px-2 py-1 text-sm bg-white/70 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20"
              value={activeSummary || ""}
              onChange={e => setActiveSummary(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Revise">Revise</option>
            </select>
            <select
              className="border rounded-xl px-2 py-1 text-sm bg-white/70 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20"
              value={assignee || ""}
              onChange={e => setAssignee(e.target.value)}
            >
              <option value="">All Assignees</option>
              {assignees.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <LuxuryDateFilter dateRange={dateRange} setDateRange={setDateRange} />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="bg-white border-gray-200 hover:bg-gray-100 hover:border-gray-300 rounded-xl">
                  <Download className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl bg-white/95 border-emerald-200">
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setExporting(true)}>
                  <Download className="h-4 w-4" /> Export
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setPrinting(true)}>
                  <Printer className="h-4 w-4" /> Print
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      </div>

      {/* Table */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-0 mb-12">
        <Card className="shadow-2xl rounded-2xl bg-white/80 border-emerald-100">
          <CardContent className="p-0">
            <div className="rounded-2xl overflow-hidden luxury-table-wrapper">
              <table className="w-full bg-white/60 luxury-table">
                <thead className="sticky top-0 z-20 shadow-md bg-gradient-to-r from-emerald-50 to-green-50">
                  <tr>
                    <th 
                      className="px-2 py-3 text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap w-[10%] cursor-pointer hover:bg-emerald-100 transition-colors"
                      onClick={() => handleSort("qcId")}
                    >
                      <div className="flex items-center justify-between">
                        QC #
                        <div className="flex flex-col">
                          {sortBy === "qcId" && (
                            <>
                              {sortOrder === "asc" ? (
                                <ChevronUp className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <ChevronDown className="h-3 w-3 text-emerald-600" />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </th>
                    <th 
                      className="px-2 py-3 text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap w-[12%] cursor-pointer hover:bg-emerald-100 transition-colors"
                      onClick={() => handleSort("customerName")}
                    >
                      <div className="flex items-center justify-between">
                        Customer
                        <div className="flex flex-col">
                          {sortBy === "customerName" && (
                            <>
                              {sortOrder === "asc" ? (
                                <ChevronUp className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <ChevronDown className="h-3 w-3 text-emerald-600" />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </th>
                    <th 
                      className="px-2 py-3 text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap w-[10%] cursor-pointer hover:bg-emerald-100 transition-colors"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center justify-between">
                        Status
                        <div className="flex flex-col">
                          {sortBy === "status" && (
                            <>
                              {sortOrder === "asc" ? (
                                <ChevronUp className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <ChevronDown className="h-3 w-3 text-emerald-600" />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </th>
                    <th 
                      className="px-2 py-3 text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap w-[8%] cursor-pointer hover:bg-emerald-100 transition-colors"
                      onClick={() => handleSort("priority")}
                    >
                      <div className="flex items-center justify-between">
                        Priority
                        <div className="flex flex-col">
                          {sortBy === "priority" && (
                            <>
                              {sortOrder === "asc" ? (
                                <ChevronUp className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <ChevronDown className="h-3 w-3 text-emerald-600" />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </th>
                    <th 
                      className="px-2 py-3 text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap w-[12%] cursor-pointer hover:bg-emerald-100 transition-colors"
                      onClick={() => handleSort("assignedTo")}
                    >
                      <div className="flex items-center justify-between">
                        Assignee
                        <div className="flex flex-col">
                          {sortBy === "assignedTo" && (
                            <>
                              {sortOrder === "asc" ? (
                                <ChevronUp className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <ChevronDown className="h-3 w-3 text-emerald-600" />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </th>
                    <th 
                      className="px-2 py-3 text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap w-[12%] cursor-pointer hover:bg-emerald-100 transition-colors"
                      onClick={() => handleSort("dueDate")}
                    >
                      <div className="flex items-center justify-between">
                        Due Date
                        <div className="flex flex-col">
                          {sortBy === "dueDate" && (
                            <>
                              {sortOrder === "asc" ? (
                                <ChevronUp className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <ChevronDown className="h-3 w-3 text-emerald-600" />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap w-[6%]">Files</th>
                    <th 
                      className="px-2 py-3 text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap w-[8%] cursor-pointer hover:bg-emerald-100 transition-colors"
                      onClick={() => handleSort("revisions")}
                    >
                      <div className="flex items-center justify-between">
                        Revisions
                        <div className="flex flex-col">
                          {sortBy === "revisions" && (
                            <>
                              {sortOrder === "asc" ? (
                                <ChevronUp className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <ChevronDown className="h-3 w-3 text-emerald-600" />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </th>
                    <th className="px-2 py-3 text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap text-center align-middle w-[22%]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedQCOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-emerald-400">No QC orders found.</td>
                    </tr>
                  ) : (
                    sortedQCOrders.map(qc => (
                      <tr key={qc.qcId} className="border-b border-emerald-100 hover:bg-emerald-50/60 transition luxury-row">
                        <td className="px-2 py-3 font-semibold text-emerald-900 whitespace-nowrap">
                          <Link href={`/dashboard/production/kanban/qc/${qc.qcId}`} className="hover:text-emerald-600 transition">
                            {qc.qcId}
                          </Link>
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap">
                          <Link href={`/dashboard/customers/${qc.customerId}`} className="hover:text-emerald-600 transition">
                            {qc.customerName}
                          </Link>
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap">
                          <select
                            className={`border rounded-xl px-2 py-1 text-xs font-semibold focus:border-emerald-400 focus:ring-emerald-400/20 
                              ${qc.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : ''}
                              ${qc.status === 'Review' ? 'bg-yellow-100 text-yellow-800' : ''}
                              ${qc.status === 'Approved' ? 'bg-green-100 text-green-800' : ''}
                              ${qc.status === 'Revise' ? 'bg-red-300 text-red-900' : ''}`}
                            value={qc.status}
                            onChange={e => {
                              const newStatus = e.target.value;
                              setQCOrders(prev => prev.map(q =>
                                q.qcId === qc.qcId ? { ...q, status: newStatus } : q
                              ));
                            }}
                          >
                            <option value="In Progress">In Progress</option>
                            <option value="Review">Review</option>
                            <option value="Approved">Approved</option>
                            <option value="Revise">Revise</option>
                          </select>
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap">
                          <select
                            className={`border rounded-xl px-2 py-1 text-xs font-semibold focus:border-emerald-400 focus:ring-emerald-400/20 
                              ${qc.priority === 'High' ? 'bg-red-300 text-red-900' : ''}
                              ${qc.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : ''}
                              ${qc.priority === 'Low' ? 'bg-green-100 text-green-800' : ''}`}
                            value={qc.priority}
                            onChange={e => {
                              const newPriority = e.target.value;
                              setQCOrders(prev => prev.map(q =>
                                q.qcId === qc.qcId ? { ...q, priority: newPriority } : q
                              ));
                            }}
                          >
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                          </select>
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span>{qc.assignedTo}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-emerald-100 rounded-full"
                              onClick={() => handleContactAssignee(qc.assignedTo)}
                            >
                              <Users className="h-3 w-3 text-emerald-600" />
                            </Button>
                          </div>
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap text-sm">
                          <DateCell date={qc.dueDate} />
                        </td>
                        <td className="px-2 py-3 text-center whitespace-nowrap">
                          {qc.files && qc.files.length > 0 ? (
                            <div className="flex items-center justify-center gap-1">
                              <Paperclip className="h-4 w-4 text-emerald-600" />
                              <span className="text-xs text-emerald-600">{qc.files.length}</span>
                            </div>
                          ) : (
                            <span className="text-emerald-300 text-xs">No file</span>
                          )}
                        </td>
                        <td className="px-2 py-3 text-center whitespace-nowrap">
                          <Badge variant="outline" className="text-xs rounded-xl">
                            {qc.revisions}
                          </Badge>
                        </td>
                        <td className="px-2 py-3 text-center align-middle">
                          <div className="flex items-center gap-2 justify-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="default" className="text-xs bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-2 rounded-xl shadow-md">
                                  <Eye className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl bg-white/95 border-emerald-200">
                                <div className="px-2 py-1.5 text-sm font-semibold text-emerald-700 border-b">Required Actions</div>
                                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => router.push(`/dashboard/production/kanban/qc/${qc.qcId}/inspect`)}>
                                  <Eye className="h-4 w-4" /> Inspect
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline" className="text-xs px-2 rounded-xl border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 shadow-md">
                                  <MoreHorizontal className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl bg-white/95 border-emerald-200">
                                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setQCOrders(prev => prev.map(q => q.qcId === qc.qcId ? { ...q, status: 'Revise' } : q))}>
                                  <AlertTriangle className="h-4 w-4" /> Revise
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => router.push(`/dashboard/production/kanban/qc/${qc.qcId}/revisions`)}>
                                  <MessageSquare className="h-4 w-4" /> Revisions
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleDownloadPDF(qc)}>
                                  <Download className="h-4 w-4" /> Download PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleContactAssignee(qc.assignedTo)}>
                                  <Users className="h-4 w-4" /> Contact Assignee
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Assignee Dialog */}
      <MessageAssigneeDialog
        open={contactDialog.open}
        onOpenChange={(open) => setContactDialog({ open, assignee: null })}
        orderId={contactDialog.assignee || ""}
        assigneeName={contactDialog.assignee || ""}
        assignee={contactDialog.assignee || ""}
      />
    </div>
  );
} 