"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { CuboidIcon as Cube, Calendar, Sparkles, Search, Download, Printer, ChevronDown, ChevronUp, Filter, Plus, CheckCircle, XCircle, Users, ArrowDownCircle, Paperclip, Clock, AlertTriangle, ArrowRight, ArrowLeft, MoreHorizontal, MessageSquare, Upload, FileText, X, Check, Move } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as UICalendar } from "@/components/ui/calendar";
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from "date-fns";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import Link from "next/link";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MessageAssigneeDialog } from "@/components/orders/message-assignee-dialog";
import jsPDF from "jspdf";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";

const staffList = ["Sarah Johnson", "David Chen", "Emily Rodriguez", "Michael Kim"];
const customerList = ["Sophia Lee", "Michael Chen", "Ava Patel", "Liam Smith", "Emma Wilson", "James Brown"];
const priorityList = ["High", "Medium", "Low"];
const statusList = ["Review", "Approved", "Revise"];

const mockCADOrders = [
  {
    cadId: 'CAD-2024-0001',
    customerName: 'Sophia Chen',
    customerId: '1',
    status: 'Review',
    priority: 'High',
    assignedTo: 'Sarah Johnson',
    dueDate: '2024-07-18T20:00:00Z',
    notes: '3D modeling for custom engagement ring with emerald center stone.',
    revisions: 1,
    files: [{ name: "design-sketch.pdf" }, { name: "reference-images.zip" }],
    orderNumber: 'ORD-1001',
    designId: 'DS-2024-0001',
  },
  {
    cadId: 'CAD-2024-0002',
    customerName: 'Ethan Davis',
    customerId: '2',
    status: 'Review',
    priority: 'Medium',
    assignedTo: 'David Chen',
    dueDate: '2024-07-25T20:00:00Z',
    notes: 'Sapphire pendant CAD model with diamond accents.',
    revisions: 2,
    files: [{ name: "cad-model.stl" }],
    orderNumber: 'ORD-1002',
    designId: 'DS-2024-0002',
  },
  {
    cadId: 'CAD-2024-0003',
    customerName: 'Ava Martinez',
    customerId: '3',
    status: 'Approved',
    priority: 'Low',
    assignedTo: 'Emily Rodriguez',
    dueDate: '2024-07-15T20:00:00Z',
    notes: 'Custom bracelet CAD with mixed metals design.',
    revisions: 0,
    files: [{ name: "final-cad.stl" }, { name: "renderings.pdf" }],
    orderNumber: 'ORD-1003',
    designId: 'DS-2024-0003',
  },
  {
    cadId: 'CAD-2024-0004',
    customerName: 'Liam Smith',
    customerId: '4',
    status: 'Revise',
    priority: 'High',
    assignedTo: 'Michael Kim',
    dueDate: '2024-07-30T20:00:00Z',
    notes: 'Wedding band CAD needs revision for comfort fit.',
    revisions: 3,
    files: [{ name: "revision-notes.pdf" }, { name: "updated-cad.stl" }],
    orderNumber: 'ORD-1004',
    designId: 'DS-2024-0004',
  },
];

const statusSummary = [
  { key: "all", label: "Total CAD Files", value: mockCADOrders.length, color: "bg-emerald-100 text-emerald-800", icon: Cube },
  { key: "Review", label: "Under Review", value: mockCADOrders.filter(c => c.status === "Review").length, color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle },
  { key: "Approved", label: "Approved", value: mockCADOrders.filter(c => c.status === "Approved").length, color: "bg-green-100 text-green-800", icon: CheckCircle },
  { key: "Revise", label: "Revise", value: mockCADOrders.filter(c => c.status === "Revise").length, color: "bg-red-100 text-red-800", icon: XCircle },
];

const statusColors: { [key: string]: string } = {
  "Review": "bg-yellow-100 text-yellow-800",
  "Approved": "bg-green-100 text-green-800",
  "Revise": "bg-red-100 text-red-800",
};

const assignees = Array.from(new Set(mockCADOrders.map(c => c.assignedTo)));

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

// Add CAD file upload interface
interface CADFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  notes?: string;
}

interface CADUploadData {
  cadId: string;
  files: CADFile[];
  notes: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export default function CADStagePage() {
  const router = useRouter();
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
  const [cadOrders, setCadOrders] = useState(mockCADOrders);
  
  // CAD Upload State
  const [uploadDialog, setUploadDialog] = useState<{ open: boolean; cadId: string | null }>({ open: false, cadId: null });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadNotes, setUploadNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [confirmMoveDialog, setConfirmMoveDialog] = useState<{ open: boolean; cadId: string | null; uploadData: CADUploadData | null }>({ open: false, cadId: null, uploadData: null });
  const [cadUploads, setCadUploads] = useState<{ [cadId: string]: CADUploadData }>({});

  const filteredCADFiles = cadOrders.filter(cad => {
    if (activeSummary !== "all" && cad.status !== activeSummary) return false;
    if (search && !cad.customerName.toLowerCase().includes(search.toLowerCase()) && !cad.cadId.toLowerCase().includes(search.toLowerCase())) return false;
    if (dateRange && dateRange.from && dateRange.to) {
      const cadDate = parseISO(cad.dueDate);
      if (!isWithinInterval(cadDate, { start: dateRange.from, end: dateRange.to })) return false;
    }
    if (assignee && cad.assignedTo !== assignee) return false;
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
  const sortedCADFiles = [...filteredCADFiles].sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (sortBy) {
      case "cadId":
        aValue = a.cadId;
        bValue = b.cadId;
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
  const totalCADFiles = sortedCADFiles.length;
  const cadFilesByStaff = staffList.map(staff => ({ staff, count: sortedCADFiles.filter(cad => cad.assignedTo === staff).length }));

  // Useful analytics
  const avgRevisions = sortedCADFiles.length ? (sortedCADFiles.reduce((sum, c) => sum + c.revisions, 0) / sortedCADFiles.length).toFixed(1) : 0;

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
  function handleDownloadPDF(cad: any) {
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(18);
    doc.text("CAD File Detail", 10, y);
    y += 10;
    doc.setFontSize(12);
    doc.text(`CAD ID: ${cad.cadId}`, 10, y); y += 8;
    doc.text(`Customer: ${cad.customerName} (${cad.customerId || ''})`, 10, y); y += 8;
    doc.text(`Status: ${cad.status}`, 10, y); y += 8;
    doc.text(`Priority: ${cad.priority}`, 10, y); y += 8;
    doc.text(`Assigned To: ${cad.assignedTo}`, 10, y); y += 8;
    doc.text(`Due Date: ${format(parseISO(cad.dueDate), "PPpp")}`, 10, y); y += 8;
    doc.text(`Revisions: ${cad.revisions}`, 10, y); y += 8;
    doc.text(`Order Number: ${cad.orderNumber}`, 10, y); y += 8;
    doc.text(`Design ID: ${cad.designId}`, 10, y); y += 8;
    doc.text("Notes:", 10, y); y += 6;
    doc.setFontSize(11);
    doc.text(doc.splitTextToSize(cad.notes || '', 180), 12, y); y += 12 + 6 * Math.ceil((cad.notes || '').length / 80);
    doc.save(`${cad.cadId}.pdf`);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Review': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Revise': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // CAD File Upload Handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadSubmit = async () => {
    if (!uploadDialog.cadId || selectedFiles.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    setUploading(true);
    
    // Simulate file upload process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const uploadedFiles: CADFile[] = selectedFiles.map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
      notes: uploadNotes
    }));

    const uploadData: CADUploadData = {
      cadId: uploadDialog.cadId,
      files: uploadedFiles,
      notes: uploadNotes,
      uploadedBy: "Current User", // In real app, get from auth
      uploadedAt: new Date()
    };

    // Save upload data
    setCadUploads(prev => ({
      ...prev,
      [uploadDialog.cadId!]: uploadData
    }));

    // Update CAD order status
    setCadOrders(prev => prev.map(cad => 
      cad.cadId === uploadDialog.cadId 
        ? { ...cad, status: 'Approved', files: uploadedFiles }
        : cad
    ));

    setUploading(false);
    setUploadDialog({ open: false, cadId: null });
    setSelectedFiles([]);
    setUploadNotes("");
    
    // Show confirmation dialog
    setConfirmMoveDialog({ open: true, cadId: uploadDialog.cadId, uploadData });
    
    toast.success("CAD files uploaded successfully!");
  };

  const handleMoveToCasting = async () => {
    if (!confirmMoveDialog.cadId) return;
    
    setUploading(true);
    
    // Simulate moving to casting
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In real app, this would create a casting order
    toast.success(`CAD ${confirmMoveDialog.cadId} moved to casting phase!`);
    
    setConfirmMoveDialog({ open: false, cadId: null, uploadData: null });
    setUploading(false);
    
    // Optionally redirect to casting kanban
    router.push('/dashboard/production/kanban/casting');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Header */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-0 pt-10 pb-4">
        <div className="flex items-center justify-between mb-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-emerald-200/50 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
              <Cube className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent tracking-tight">CAD Stage Management</h1>
              <p className="text-md text-emerald-600 font-medium">Track and manage all CAD stage orders</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 min-w-[160px]">
            <Button className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:from-emerald-700 hover:to-green-700 hover:shadow-xl transition-all duration-300 flex items-center gap-2 w-full">
              <Plus className="w-5 h-5" /> New CAD
            </Button>
            <div className="flex gap-2 mt-1">
              <Link href="/dashboard/production/kanban/design">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-full" title="Go to Design">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/dashboard/production/kanban/casting">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-full" title="Go to Casting">
                  <ArrowRight className="w-4 h-4" />
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
              placeholder="Search by customer or CAD #..."
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
                      onClick={() => handleSort("cadId")}
                    >
                      <div className="flex items-center justify-between">
                        CAD #
                        <div className="flex flex-col">
                          {sortBy === "cadId" && (
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
                    <th className="px-2 py-3 text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap text-center align-middle w-[12%]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCADFiles.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-emerald-400">No CAD files found.</td>
                    </tr>
                  ) : (
                    sortedCADFiles.map(cad => (
                      <tr key={cad.cadId} className="border-b border-emerald-100 hover:bg-emerald-50/60 transition luxury-row">
                        <td className="px-2 py-3 font-semibold text-emerald-900 whitespace-nowrap">
                          <Link href={`/dashboard/production/kanban/cad/${cad.cadId}`} className="hover:text-emerald-600 transition">
                            {cad.cadId}
                          </Link>
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap">
                          <Link href={`/dashboard/customers/${cad.customerId}`} className="hover:text-emerald-600 transition">
                            {cad.customerName}
                          </Link>
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap">
                          <select
                            className={`border rounded-xl px-2 py-1 text-xs font-semibold focus:border-emerald-400 focus:ring-emerald-400/20 
                              ${cad.status === 'Review' ? 'bg-yellow-100 text-yellow-800' : ''}
                              ${cad.status === 'Approved' ? 'bg-green-100 text-green-800' : ''}
                              ${cad.status === 'Revise' ? 'bg-red-300 text-red-900' : ''}
                              ${cad.status === 'all' ? 'bg-gray-100 text-emerald-700' : ''}`}
                            value={cad.status}
                            onChange={e => {
                              const newStatus = e.target.value;
                              setCadOrders(prev => prev.map(c =>
                                c.cadId === cad.cadId ? { ...c, status: newStatus } : c
                              ));
                            }}
                          >
                            <option value="Review">Review</option>
                            <option value="Approved">Approved</option>
                            <option value="Revise">Revise</option>
                          </select>
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap">
                          <select
                            className={`border rounded-xl px-2 py-1 text-xs font-semibold focus:border-emerald-400 focus:ring-emerald-400/20 
                              ${cad.priority === 'High' ? 'bg-red-300 text-red-900' : ''}
                              ${cad.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : ''}
                              ${cad.priority === 'Low' ? 'bg-green-100 text-green-800' : ''}`}
                            value={cad.priority}
                            onChange={e => {
                              const newPriority = e.target.value;
                              setCadOrders(prev => prev.map(c =>
                                c.cadId === cad.cadId ? { ...c, priority: newPriority } : c
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
                            <span>{cad.assignedTo}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-emerald-100 rounded-full"
                              onClick={() => handleContactAssignee(cad.assignedTo)}
                            >
                              <Users className="h-3 w-3 text-emerald-600" />
                            </Button>
                          </div>
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap text-sm">
                          <DateCell date={cad.dueDate} />
                        </td>
                        <td className="px-2 py-3 text-center whitespace-nowrap">
                          {cadUploads[cad.cadId] ? (
                            <div className="flex flex-col items-center gap-1">
                              <div className="flex items-center gap-1">
                                <Paperclip className="h-4 w-4 text-emerald-600" />
                                <span className="text-xs text-emerald-600 font-semibold">{cadUploads[cad.cadId].files.length}</span>
                              </div>
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                Uploaded
                              </Badge>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-emerald-300 text-xs">No files</span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 px-2 text-xs bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-xl"
                                onClick={() => setUploadDialog({ open: true, cadId: cad.cadId })}
                              >
                                <Upload className="h-3 w-3 mr-1" />
                                Upload
                              </Button>
                            </div>
                          )}
                        </td>
                        <td className="px-2 py-3 text-center whitespace-nowrap">
                          <Link href={`/dashboard/production/kanban/cad/${cad.cadId}/revisions`}>
                            <Badge variant="outline" className="text-xs cursor-pointer hover:bg-emerald-100 hover:text-emerald-800 transition-colors rounded-xl">
                              {cad.revisions}
                            </Badge>
                          </Link>
                        </td>
                        <td className="px-2 py-3 text-center align-middle">
                          <div className="flex items-center gap-2 justify-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="default" className="text-xs bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-2 rounded-xl shadow-md">
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl bg-white/95 border-emerald-200">
                                <div className="px-2 py-1.5 text-sm font-semibold text-emerald-700 border-b">Required Actions</div>
                                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setUploadDialog({ open: true, cadId: cad.cadId })}>
                                  <Upload className="h-4 w-4" /> Upload CAD Files
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
                                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => router.push(`/dashboard/production/kanban/cad/${cad.cadId}/review`)}>
                                  <AlertTriangle className="h-4 w-4" /> Review
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => router.push(`/dashboard/production/kanban/cad/${cad.cadId}/revisions`)}>
                                  <MessageSquare className="h-4 w-4" /> Revisions
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleContactAssignee(cad.assignedTo)}>
                                  <Users className="h-4 w-4" /> Contact Assignee
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleDownloadPDF(cad)}>
                                  <Download className="h-4 w-4" /> Download PDF
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

      {/* CAD File Upload Dialog */}
      <Dialog open={uploadDialog.open} onOpenChange={(open) => setUploadDialog({ open, cadId: null })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-emerald-600" />
              Upload CAD Files
            </DialogTitle>
            <DialogDescription>
              Upload CAD files for {uploadDialog.cadId} and add any notes before moving to casting phase.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* File Upload Area */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold">CAD Files</Label>
              <div className="border-2 border-dashed border-emerald-200 rounded-lg p-6 text-center hover:border-emerald-300 transition-colors">
                <Upload className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">Drop CAD files here or click to browse</p>
                <input
                  type="file"
                  multiple
                  accept=".stl,.obj,.step,.stp,.iges,.igs,.dwg,.dxf,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="cad-file-upload"
                />
                <label htmlFor="cad-file-upload">
                  <Button variant="outline" className="cursor-pointer">
                    Choose Files
                  </Button>
                </label>
              </div>
              
              {/* Selected Files List */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Selected Files ({selectedFiles.length})</Label>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-medium">{file.name}</span>
                          <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Upload Notes</Label>
              <Textarea
                placeholder="Add any notes about the CAD files, specifications, or special requirements..."
                value={uploadNotes}
                onChange={(e) => setUploadNotes(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialog({ open: false, cadId: null })}>
              Cancel
            </Button>
            <Button 
              onClick={handleUploadSubmit}
              disabled={selectedFiles.length === 0 || uploading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move to Casting Confirmation Dialog */}
      <Dialog open={confirmMoveDialog.open} onOpenChange={(open) => setConfirmMoveDialog({ open, cadId: null, uploadData: null })}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Move className="h-5 w-5 text-emerald-600" />
              Move to Casting Phase
            </DialogTitle>
            <DialogDescription>
              Confirm that you want to move this CAD project to the casting phase.
            </DialogDescription>
          </DialogHeader>
          
          {confirmMoveDialog.uploadData && (
            <div className="space-y-4">
              <div className="bg-emerald-50 p-4 rounded-lg">
                <h4 className="font-semibold text-emerald-900 mb-2">Upload Summary</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">CAD ID:</span> {confirmMoveDialog.uploadData.cadId}</p>
                  <p><span className="font-medium">Files:</span> {confirmMoveDialog.uploadData.files.length} uploaded</p>
                  <p><span className="font-medium">Uploaded by:</span> {confirmMoveDialog.uploadData.uploadedBy}</p>
                  <p><span className="font-medium">Date:</span> {format(confirmMoveDialog.uploadData.uploadedAt, "PPpp")}</p>
                </div>
              </div>
              
              {confirmMoveDialog.uploadData.notes && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Notes</h4>
                  <p className="text-sm text-blue-800">{confirmMoveDialog.uploadData.notes}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmMoveDialog({ open: false, cadId: null, uploadData: null })}>
              Cancel
            </Button>
            <Button 
              onClick={handleMoveToCasting}
              disabled={uploading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Moving...
                </>
              ) : (
                <>
                  <Move className="h-4 w-4 mr-2" />
                  Move to Casting
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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