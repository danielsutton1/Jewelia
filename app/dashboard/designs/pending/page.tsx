"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Mail, User, CheckCircle, Clock, AlertCircle, Paperclip, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as UICalendar } from "@/components/ui/calendar";
import { format, parseISO, isWithinInterval } from "date-fns";
import { Dialog } from "@/components/ui/dialog";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

const mockDesigns = [
  {
    designId: "DS-2024-0001",
    client: "Sophia Chen",
    designer: "Sarah Johnson",
    dueDate: "2024-07-15",
    status: "in-progress",
    clientEmail: "sophia.chen@email.com",
    files: ["design-specs.pdf", "reference-images.zip"],
    notes: "Client wants vintage-inspired setting with emerald accents. Need to confirm stone sizes.",
  },
  {
    designId: "DS-2024-0003",
    client: "Ethan Davis",
    designer: "David Chen",
    dueDate: "2024-07-18",
    status: "pending",
    clientEmail: "ethan.davis@email.com",
    files: [],
    notes: "Modern minimalist design requested. Client prefers platinum setting.",
  },
  {
    designId: "DS-2024-0004",
    client: "Ava Martinez",
    designer: "Sarah Johnson",
    dueDate: "2024-07-20",
    status: "in-progress",
    clientEmail: "ava.martinez@email.com",
    files: ["sketch-draft.jpg", "stone-specs.pdf"],
    notes: "Art deco style engagement ring. Client approved initial sketch, proceeding with detailed design.",
  },
];

const designers = ["All Designers", ...Array.from(new Set(mockDesigns.map(d => d.designer)))];

// Helper to slugify client name for URL
function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
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

  // Sync internal state with external changes
  React.useEffect(() => {
    setInternalRange(dateRange);
  }, [dateRange]);

  // When user selects a range, update both internal and external state
  const handleRangeSelect = (range: DateRange | undefined) => {
    setInternalRange(range);
    // Only close if both from and to are selected (full range)
    if (range?.from && range?.to) {
      setDateRange(range);
      setOpen(false);
    }
    // If only one date is picked, do not close the popover
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1 luxury-date-btn min-w-[140px] sm:min-w-[170px] min-h-[44px] text-xs sm:text-sm" aria-label="Filter by due date">
          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
          {dateRange?.from && dateRange?.to ? `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}` : "Due Date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] sm:w-[520px] p-3 sm:p-4 rounded-2xl shadow-2xl bg-white border-emerald-100" align="end">
        <div className="mb-2 sm:mb-3 font-semibold text-emerald-900 text-base sm:text-lg">Filter by Due Date</div>
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
          {presets.map((preset) => (
            <Button key={preset.label} size="sm" variant="secondary" className="rounded-full border border-emerald-200 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition text-xs sm:text-sm min-h-[44px]" onClick={() => { setDateRange(preset.range); setOpen(false); }}>
              {preset.label}
            </Button>
          ))}
        </div>
        <UICalendar
          mode="range"
          selected={internalRange}
          onSelect={handleRangeSelect}
          numberOfMonths={1}
          className="border rounded-xl shadow-lg p-2 bg-white luxury-calendar"
        />
        <Button variant="ghost" size="sm" className="w-full mt-3 sm:mt-4 text-emerald-700 hover:bg-emerald-50 min-h-[44px] text-xs sm:text-sm" onClick={() => { setDateRange(undefined); setInternalRange(undefined); setOpen(false); }}>
          Clear Date Filter
        </Button>
      </PopoverContent>
    </Popover>
  );
}

export default function DesignsPendingPage() {
  const [designer, setDesigner] = useState("All Designers");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [contactDialog, setContactDialog] = useState<{ open: boolean; designer: string | null }>({ open: false, designer: null });
  const [activeCard, setActiveCard] = useState<string>("Total Designs");
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [designs, setDesigns] = useState(mockDesigns);

  // Status options for the dropdown
  const statusOptions = [
    "pending",
    "in-progress", 
    "completed",
    "on-hold",
    "cancelled"
  ];

  // Get status color function (matching the completed page pattern)
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'on-hold': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle status update
  const handleStatusUpdate = (designId: string, newStatus: string) => {
    setDesigns(prevDesigns => 
      prevDesigns.map(design => 
        design.designId === designId 
          ? { ...design, status: newStatus }
          : design
      )
    );
    setEditingStatus(null);
  };

  // Analytics
  const totalDesigns = designs.length;
  const inProgress = designs.filter(d => d.status === "in-progress").length;
  const waiting = designs.filter(d => d.status === "pending").length;
  const dueSoon = designs.filter(d => {
    const due = parseISO(d.dueDate);
    const now = new Date();
    return due > now && (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 7;
  }).length;

  const summaryCards = [
    { label: "Total Designs", value: totalDesigns, color: "bg-emerald-100 text-emerald-800", icon: User },
    { label: "In Progress", value: inProgress, color: "bg-yellow-100 text-yellow-800", icon: CheckCircle },
    { label: "Waiting", value: waiting, color: "bg-gray-100 text-gray-800", icon: Clock },
    { label: "Due Soon", value: dueSoon, color: "bg-red-100 text-red-800", icon: AlertCircle },
  ];

  const filteredDesigns = designs.filter(d => {
    const matchesDesigner = designer === "All Designers" || d.designer === designer;
    const matchesSearch = !search || d.client.toLowerCase().includes(search.toLowerCase()) || d.designId.toLowerCase().includes(search.toLowerCase());
    let matchesDate = true;
    const due = parseISO(d.dueDate);
    if (dateRange?.from && dateRange?.to) {
      matchesDate = isWithinInterval(due, { start: dateRange.from, end: dateRange.to });
    }
    let matchesStatus = true;
    if (activeCard === "In Progress") matchesStatus = d.status === "in-progress";
    else if (activeCard === "Waiting") matchesStatus = d.status === "pending";
    else if (activeCard === "Due Soon") {
      const now = new Date();
      matchesStatus = due > now && (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 7;
    }
    return matchesDesigner && matchesSearch && matchesDate && matchesStatus;
  });

  // Analytics bar
  const avgDaysToDue = filteredDesigns.length
    ? (
        filteredDesigns.reduce((sum, d) => sum + ((parseISO(d.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)), 0) / filteredDesigns.length
      ).toFixed(1)
    : 0;

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-6 md:py-10 px-3 sm:px-4 md:px-6 lg:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 md:mb-8 gap-3 sm:gap-4">
        <div className="flex flex-col items-start gap-2">
          <Link href="/dashboard/call-log">
            <Button variant="outline" size="sm" className="text-xs text-gray-600 hover:text-gray-800 border-gray-300 hover:border-gray-400 flex items-center min-h-[44px]">
              <ArrowLeft className="w-3 h-3 mr-1" /> Back: Call Log
            </Button>
          </Link>
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2 text-emerald-900">
          <Calendar className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-emerald-600" /> Designs Pending
        </h1>
        <div className="flex flex-col gap-2">
          <Link href="/dashboard/designs/status">
            <Button variant="outline" size="sm" className="text-xs text-gray-600 hover:text-gray-800 border-gray-300 hover:border-gray-400 min-h-[44px]">
              <ArrowRight className="w-3 h-3 mr-1" /> Next: Completed
            </Button>
          </Link>
        </div>
      </div>
      <Card className="mb-4 sm:mb-6 md:mb-8 p-3 sm:p-4 md:p-6 shadow-xl rounded-2xl bg-white/80 border-emerald-100 flex flex-col md:flex-row md:items-end md:justify-between gap-3 sm:gap-4">
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <Input
            placeholder="Search by client or design ID..."
            className="w-full md:w-56 luxury-input min-h-[44px] text-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="border rounded px-2 py-1 text-sm luxury-input min-h-[44px]"
            value={designer}
            onChange={e => setDesigner(e.target.value)}
          >
            {designers.map(d => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <LuxuryDateFilter dateRange={dateRange} setDateRange={setDateRange} />
        </div>
      </Card>
      <div className="mb-4 sm:mb-6 md:mb-8 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        {summaryCards.map((s, i) => (
          <Card
            key={i}
            className={cn(`${s.color} flex flex-col items-center justify-center p-3 sm:p-4 cursor-pointer border-2 transition-all`, activeCard === s.label ? 'border-emerald-600 ring-2 ring-emerald-200' : 'border-transparent')}
            onClick={() => setActiveCard(s.label)}
          >
            <CardContent className="flex flex-col items-center justify-center p-0">
              <s.icon className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2" />
              <div className="text-base sm:text-lg font-bold">{s.value}</div>
              <div className="text-xs font-medium mt-1">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 items-start sm:items-center">
        <div className="text-base sm:text-lg font-semibold text-emerald-700">{filteredDesigns.length} designs</div>
        <div className="text-xs sm:text-sm text-muted-foreground">Avg. Days to Due: <span className="font-bold text-emerald-800">{avgDaysToDue}</span></div>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-lg luxury-table-wrapper">
            <table className="min-w-full bg-white luxury-table">
              <thead className="sticky top-0 z-20 shadow-md bg-emerald-50">
                <tr>
                  <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap">Build</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap">Design ID</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap">Client</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap">Designer</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap">Due Date</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-center min-w-[80px] text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap">Files</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap">Notes</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap sticky right-0 bg-white z-10">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDesigns.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-6 sm:py-8 text-gray-400 text-sm">No pending designs found.</td>
                  </tr>
                ) : (
                  filteredDesigns.map(d => (
                    <tr key={d.designId} className="border-b hover:bg-emerald-50/60 transition luxury-row">
                      <td className="px-2 sm:px-3 py-3 sm:py-4 text-center">
                        <Link href={`/dashboard/designs/${d.designId}?edit=1`}>
                          <Button size="sm" variant="outline" className="text-xs border-emerald-600 text-emerald-700 hover:bg-emerald-50 min-h-[44px] min-w-[44px]" title="Build Design">
                            <span className="hidden sm:inline">Build Design</span>
                            <span className="sm:hidden">Build</span>
                          </Button>
                        </Link>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-emerald-900 whitespace-nowrap text-sm">
                        <Link href={`/dashboard/designs/${d.designId}`} className="hover:text-emerald-600 hover:underline transition-colors">
                          {d.designId}
                        </Link>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm">
                        <Link href={`/dashboard/customers/${slugify(d.client)}`} className="hover:text-emerald-600 hover:underline transition-colors font-medium">
                          {d.client}
                        </Link>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm">{d.designer}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm">{format(parseISO(d.dueDate), "PP")}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <select
                          className={`border rounded px-2 py-1 text-xs font-semibold ${getStatusColor(d.status)} min-h-[44px]`}
                          value={d.status}
                          onChange={(e) => handleStatusUpdate(d.designId, e.target.value)}
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>{status.replace(/-/g, ' ')}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-center min-w-[80px] whitespace-nowrap">
                        {Array.isArray(d.files) && d.files.length > 0 ? (
                          <Paperclip className="h-4 w-4 text-emerald-600 inline-block" />
                        ) : (
                          <span className="text-gray-400 text-xs">No file</span>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs truncate" title={d.notes}>
                        {d.notes.length > 40 ? d.notes.slice(0, 40) + "..." : d.notes}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap flex gap-1 sm:gap-2 sticky right-0 bg-white z-10 luxury-actions">
                        <Button size="sm" variant="outline" className="text-xs min-h-[44px] min-w-[44px]" title="Contact Designer" onClick={() => setContactDialog({ open: true, designer: d.designer })}>
                          <Mail className="w-4 h-4" />
                        </Button>
                        <Link href={`/dashboard/designs/${d.designId}`}>
                          <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700 rounded shadow min-h-[44px] text-xs">
                            <span className="hidden sm:inline">Confirm Design</span>
                            <span className="sm:hidden">Confirm</span>
                          </Button>
                        </Link>
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
  );
} 