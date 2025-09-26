"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar as UICalendar } from "@/components/ui/calendar";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Phone, 
  Calendar,
  Clock,
  User,
  FileText,
  Eye,
  Edit,
  History,
  ArrowLeft,
  CheckCircle,
  XCircle,
  ArrowDownCircle
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import type { DateRange } from "react-day-picker";

interface CallLog {
  id: string;
  callNumber?: string;
  customer?: string;
  customer_name?: string;
  customerId?: string;
  customer_id?: string;
  staff?: string;
  staff_name?: string;
  callType?: string;
  call_type?: string;
  callDuration?: string;
  duration?: string;
  callOutcome?: string;
  outcome?: string;
  notes?: string;
  additionalNotes?: string;
  followUpDate?: string;
  follow_up_date?: string;
  fileAttachment?: string;
  file_attachment?: string;
  clientEmail?: string;
  client_email?: string;
  clientPhone?: string;
  client_phone?: string;
  files: any[];
  sentiment?: string;
  status?: string;
  design_id?: string;
  created_at: string;
  updated_at: string;
}

// Date filter component
function DateFilter({ dateRange, setDateRange }: { dateRange: DateRange | undefined, setDateRange: (range: DateRange | undefined) => void }) {
  const [open, setOpen] = useState(false);
  const [internalRange, setInternalRange] = useState<DateRange | undefined>(dateRange);
  
  const presets = [
    { label: "Last 7 days", range: { from: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), to: new Date() } },
    { label: "This Month", range: { from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), to: new Date() } },
    { label: "Last 30 days", range: { from: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000), to: new Date() } },
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
        <Button variant="outline" size="sm" className="flex items-center gap-1 min-w-[170px]" aria-label="Filter by date">
          <Calendar className="h-4 w-4 text-emerald-600" />
          {dateRange?.from && dateRange?.to ? `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}` : "Date Range"}
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
          className="border rounded-xl shadow-lg p-2 bg-white"
        />
        <Button variant="ghost" size="sm" className="w-full mt-4 text-emerald-700 hover:bg-emerald-50" onClick={() => { setDateRange(undefined); setInternalRange(undefined); setOpen(false); }}>
          Clear Date Filter
        </Button>
      </PopoverContent>
    </Popover>
  );
}

export default function CallLogHistoryPage() {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Fetch all call logs (including those sent to design)
  const fetchCallLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/call-log?limit=1000'); // Get more records for history
      const result = await response.json();
      
      if (result.success) {
        setCallLogs(result.data);
      } else {
        console.error('Failed to fetch call logs:', result.error);
        toast.error('Failed to load call log history');
      }
    } catch (error) {
      console.error('Error fetching call logs:', error);
      toast.error('Failed to load call log history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCallLogs();
  }, []);

  // Helper function to get normalized field values
  const getFieldValue = (callLog: CallLog, field: string) => {
    const fieldMap: { [key: string]: string[] } = {
      customer: ['customer', 'customer_name'],
      staff: ['staff', 'staff_name'],
      callType: ['callType', 'call_type'],
      callDuration: ['callDuration', 'duration'],
      callOutcome: ['callOutcome', 'outcome'],
      callNumber: ['callNumber', 'id'],
      notes: ['notes'],
      clientEmail: ['clientEmail', 'client_email'],
      clientPhone: ['clientPhone', 'client_phone']
    };

    const fields = fieldMap[field] || [field];
    for (const f of fields) {
      if (callLog[f as keyof CallLog]) {
        return callLog[f as keyof CallLog];
      }
    }
    return '';
  };

  // Filter call logs based on search term, status, and date range
  const filteredCallLogs = callLogs.filter(callLog => {
    // Search filter
    const searchFields = [
      getFieldValue(callLog, 'customer'),
      getFieldValue(callLog, 'staff'),
      getFieldValue(callLog, 'callNumber'),
      getFieldValue(callLog, 'notes')
    ].map(field => String(field).toLowerCase());

    const matchesSearch = searchTerm === "" || 
      searchFields.some(field => field.includes(searchTerm.toLowerCase()));

    // Status filter
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "design" && callLog.design_id) ||
      (statusFilter === "active" && !callLog.design_id);

    // Date filter
    let matchesDate = true;
    if (dateRange?.from && dateRange?.to) {
      try {
        const callDate = parseISO(callLog.created_at);
        matchesDate = isWithinInterval(callDate, { 
          start: startOfDay(dateRange.from), 
          end: endOfDay(dateRange.to) 
        });
      } catch (error) {
        console.error('Error parsing date:', callLog.created_at, error);
        matchesDate = false;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Get status summary based on filtered data
  const getStatusSummary = () => {
    const total = callLogs.length;
    const sentToDesign = callLogs.filter(call => call.design_id).length;
    const active = total - sentToDesign;

    return { total, sentToDesign, active };
  };

  const summary = getStatusSummary();

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getStatusBadge = (callLog: CallLog) => {
    if (callLog.design_id) {
      return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Sent to Design</Badge>;
    }
    return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">Active</Badge>;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'missed': return 'bg-red-300 text-red-900';
      case 'followup': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/call-log">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Call Logs
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Call Log History</h1>
            <p className="text-gray-600">Complete history of all call logs</p>
          </div>
        </div>
                        <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm text-gray-600">History View</span>
                  {callLogs.length === 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/call-log/sample-history-data', { method: 'POST' });
                          const result = await response.json();
                          if (result.success) {
                            toast.success('Sample data loaded successfully!');
                            fetchCallLogs();
                          } else {
                            toast.error('Failed to load sample data');
                          }
                        } catch (error) {
                          toast.error('Error loading sample data');
                        }
                      }}
                      className="ml-2"
                    >
                      Load Sample Data
                    </Button>
                  )}
                </div>
      </div>

                    {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-102 group hover:bg-white/80">
                  <CardHeader className="flex flex-col items-center justify-center space-y-0 pb-1 relative z-10 text-center">
                    <CardTitle className="text-xs font-semibold text-slate-700 group-hover:text-slate-700">Total Calls</CardTitle>
                    <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-md shadow-md mt-1">
                      <Phone className="h-3 w-3 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10 text-center pb-3">
                    {loading ? (
                      <div className="text-lg sm:text-xl font-bold text-slate-800 mb-1">Loading...</div>
                    ) : (
                      <>
                        <div className="text-lg sm:text-xl font-bold text-slate-800 mb-1">
                          {summary.total.toLocaleString()}
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <div className="flex items-center gap-1 text-xs">
                            <span className="text-emerald-600">All time</span>
                            <span className="text-slate-600">call logs</span>
                          </div>
                        </div>
                        {dateRange?.from && dateRange?.to && (
                          <div className="text-xs text-emerald-500 mt-1">
                            Filtered: {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-102 group hover:bg-white/80">
                  <CardHeader className="flex flex-col items-center justify-center space-y-0 pb-1 relative z-10 text-center">
                    <CardTitle className="text-xs font-semibold text-slate-700 group-hover:text-slate-700">Active Calls</CardTitle>
                    <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-md shadow-md mt-1">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10 text-center pb-3">
                    {loading ? (
                      <div className="text-lg sm:text-xl font-bold text-slate-800 mb-1">Loading...</div>
                    ) : (
                      <>
                        <div className="text-lg sm:text-xl font-bold text-slate-800 mb-1">
                          {summary.active.toLocaleString()}
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <div className="flex items-center gap-1 text-xs">
                            <span className="text-emerald-600">
                              {summary.total > 0 ? Math.round((summary.active / summary.total) * 100) : 0}%
                            </span>
                            <span className="text-slate-600">of total calls</span>
                          </div>
                        </div>
                        <div className="text-xs text-slate-600 mt-1">
                          Not yet sent to design
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-102 group hover:bg-white/80">
                  <CardHeader className="flex flex-col items-center justify-center space-y-0 pb-1 relative z-10 text-center">
                    <CardTitle className="text-xs font-semibold text-slate-700 group-hover:text-slate-700">Sent to Design</CardTitle>
                    <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-md shadow-md mt-1">
                      <FileText className="h-3 w-3 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10 text-center pb-3">
                    {loading ? (
                      <div className="text-lg sm:text-xl font-bold text-slate-800 mb-1">Loading...</div>
                    ) : (
                      <>
                        <div className="text-lg sm:text-xl font-bold text-slate-800 mb-1">
                          {summary.sentToDesign.toLocaleString()}
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <div className="flex items-center gap-1 text-xs">
                            <span className="text-emerald-600">
                              {summary.total > 0 ? Math.round((summary.sentToDesign / summary.total) * 100) : 0}%
                            </span>
                            <span className="text-slate-600">of total calls</span>
                          </div>
                        </div>
                        <div className="text-xs text-slate-600 mt-1">
                          Converted to designs
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search calls, customers, staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <DateFilter dateRange={dateRange} setDateRange={setDateRange} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="design">Sent to Design</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call Logs Table */}
      <Card>
                        <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Call Log History ({filteredCallLogs.length} of {callLogs.length} records)
                  </CardTitle>
                </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-emerald-600">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                Loading call log history...
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Call #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCallLogs.length === 0 ? (
                    <TableRow>
                      <td colSpan={8} className="text-center py-8 text-gray-500">
                        No call logs found.
                      </td>
                    </TableRow>
                  ) : (
                    filteredCallLogs.map((callLog) => (
                      <TableRow key={callLog.id}>
                        <TableCell className="font-medium">
                          {getFieldValue(callLog, 'callNumber') || callLog.id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{getFieldValue(callLog, 'customer')}</div>
                            {getFieldValue(callLog, 'clientEmail') && (
                              <div className="text-sm text-gray-500">{getFieldValue(callLog, 'clientEmail')}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getFieldValue(callLog, 'staff')}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{getFieldValue(callLog, 'callType')}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getFieldValue(callLog, 'callOutcome')}</Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(callLog)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{formatDate(callLog.created_at)}</div>
                            {callLog.design_id && (
                              <div className="text-xs text-purple-600">
                                Design: {callLog.design_id}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/call-log/${getFieldValue(callLog, 'callNumber') || callLog.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/call-log/${getFieldValue(callLog, 'callNumber') || callLog.id}?edit=true`}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Call
                                </Link>
                              </DropdownMenuItem>
                              {callLog.design_id && (
                                <DropdownMenuItem asChild>
                                  <Link href="/dashboard/designs/status">
                                    <FileText className="h-4 w-4 mr-2" />
                                    View Design
                                  </Link>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 