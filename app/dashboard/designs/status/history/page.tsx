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
  ArrowDownCircle,
  ChevronUp,
  ChevronDown,
  Gem,
  Star,
  AlertCircle,
  Download,
  Printer,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import type { DateRange } from "react-day-picker";
import { mockCompletedDesigns, type CompletedDesign } from "@/data/mock-designs";

interface Design {
  designId: string;
  client: string;
  designer: string;
  completedDate: string;
  designStatus: 'not-started' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  complexity: 'simple' | 'moderate' | 'complex' | 'expert';
  budget: number;
  notes?: string;
  files?: string[];
  created_at?: string;
  updated_at?: string;
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
        <Button variant="outline" className="bg-white border-gray-200 hover:bg-gray-100 hover:border-gray-300 rounded-xl">
          <Calendar className="h-4 w-4 mr-2" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}
              </>
            ) : (
              format(dateRange.from, "MMM dd")
            )
          ) : (
            "Filter by date"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="p-3 border-b">
          <div className="space-y-2">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                className="w-full justify-start text-left"
                onClick={() => handleRangeSelect(preset.range)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
        <UICalendar
          initialFocus
          mode="range"
          defaultMonth={dateRange?.from}
          selected={internalRange}
          onSelect={handleRangeSelect}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}

export default function DesignHistoryPage() {
  const [designs, setDesigns] = useState<(Design | CompletedDesign)[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [sortBy, setSortBy] = useState<string>("completedDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [exporting, setExporting] = useState(false);
  const [printing, setPrinting] = useState(false);

  const fetchDesigns = async () => {
    try {
      if (!loading) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const response = await fetch('/api/designs');
      const result = await response.json();
      
      if (result.success) {
        // Transform the API data from snake_case to camelCase to match the Design interface
        const transformedDesigns = result.data.map((design: any) => ({
          designId: design.design_id,
          client: design.client_name,
          designer: design.designer,
          completedDate: design.completed_date || design.created_date,
          designStatus: design.design_status || design.quote_status || 'not-started',
          priority: design.priority || 'medium',
          complexity: design.complexity || 'moderate',
          budget: design.budget || 0,
          notes: design.notes || '',
          files: design.files || [],
          created_at: design.created_date,
          updated_at: design.updated_at
        }));
        
        console.log('📊 Transformed designs for history:', transformedDesigns);
        console.log('🔍 Filtering for completed designs...');
        const completedDesigns = transformedDesigns.filter((d: any) => d.designStatus === 'completed');
        console.log('✅ Found completed designs:', completedDesigns.length, completedDesigns);
        setDesigns(transformedDesigns);
      } else {
        // Fallback to mock data
        console.log('⚠️ API failed, falling back to mock data');
        setDesigns(mockCompletedDesigns);
      }
    } catch (error) {
      console.error('Error fetching designs:', error);
      // Fallback to mock data
      setDesigns(mockCompletedDesigns);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  // Refresh data when user returns to the page
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 History page focused, refreshing designs data...');
      fetchDesigns();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Force refresh when page loads to ensure we get the latest data
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('🔄 Force refreshing designs data on page load...');
      fetchDesigns();
    }, 1000); // Refresh after 1 second to ensure any pending updates are processed

    return () => clearTimeout(timer);
  }, []);

  const getFieldValue = (design: Design | CompletedDesign, field: string) => {
    switch (field) {
      case 'designId':
        return design.designId;
      case 'client':
        return design.client;
      case 'designer':
        return design.designer;
      case 'completedDate':
        return design.completedDate;
      case 'designStatus':
        return design.designStatus;
      case 'priority':
        return design.priority;
      case 'complexity':
        return design.complexity;
      case 'budget':
        return design.budget;
      default:
        return '';
    }
  };

  const filteredDesigns = designs.filter(design => {
    // Only show completed designs in history
    if (design.designStatus !== 'completed') {
      return false;
    }
    
    const matchesSearch = search === "" || 
      design.designId.toLowerCase().includes(search.toLowerCase()) ||
      design.client.toLowerCase().includes(search.toLowerCase()) ||
      design.designer.toLowerCase().includes(search.toLowerCase()) ||
      design.designStatus.toLowerCase().includes(search.toLowerCase()) ||
      design.priority.toLowerCase().includes(search.toLowerCase());

    const matchesDateRange = !dateRange?.from || !dateRange?.to || 
      (design.completedDate && isWithinInterval(
        parseISO(design.completedDate), 
        { start: startOfDay(dateRange.from), end: endOfDay(dateRange.to) }
      ));

    return matchesSearch && matchesDateRange;
  });

  const sortedDesigns = [...filteredDesigns].sort((a, b) => {
    const aValue = getFieldValue(a, sortBy);
    const bValue = getFieldValue(b, sortBy);
    
          if (sortBy === 'budget') {
      const aNum = Number(aValue);
      const bNum = Number(bValue);
      return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
    }
    
    if (sortBy === 'completedDate') {
      const aDate = new Date(aValue).getTime();
      const bDate = new Date(bValue).getTime();
      return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
    }
    
    const comparison = String(aValue).localeCompare(String(bValue));
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getStatusSummary = () => {
    const total = designs.length;
    const notStarted = designs.filter(d => d.designStatus === 'not-started').length;
    const inProgress = designs.filter(d => d.designStatus === 'in-progress').length;
    const completed = designs.filter(d => d.designStatus === 'completed').length;
    
    return { total, notStarted, inProgress, completed };
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (design: Design | CompletedDesign) => {
    const status = design.designStatus || 'not-started';
    const color = getStatusColor(status);
    return (
      <Badge className={`${color} text-xs font-medium`}>
        {status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not-started':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplexityIcon = (complexity: string) => {
    switch (complexity) {
      case 'simple':
        return <Star className="h-4 w-4 text-green-600" />;
      case 'moderate':
        return <Star className="h-4 w-4 text-yellow-600" />;
      case 'complex':
        return <Star className="h-4 w-4 text-red-600" />;
      default:
        return <Star className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? 
      <ChevronUp className="h-4 w-4 ml-1" /> : 
      <ChevronDown className="h-4 w-4 ml-1" />;
  };

  function handleExport(type: 'csv' | 'pdf') {
    setExporting(true);
    
    try {
      if (type === 'csv') {
        // Create CSV content
        const headers = ['Design ID', 'Client', 'Designer', 'Completed Date', 'Design Status', 'Priority', 'Complexity', 'Estimated Value', 'Notes'];
        const csvContent = [
          headers.join(','),
          ...sortedDesigns.map(design => [
            design.designId,
            `"${design.client}"`,
            `"${design.designer}"`,
            design.completedDate,
            design.designStatus,
            design.priority,
            design.complexity,
            design.budget,
            `"${design.notes || ''}"`
          ].join(','))
        ].join('\n');

        // Create and download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `design-history-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (type === 'pdf') {
        // For PDF, we'll create a printable version and trigger print
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>Design History Report</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; }
                h1 { color: #059669; }
                .summary { margin-bottom: 20px; }
                .summary-item { display: inline-block; margin-right: 20px; }
              </style>
            </head>
            <body>
              <h1>Design History Report</h1>
              <div class="summary">
                <div class="summary-item"><strong>Not Started:</strong> ${summary.notStarted}</div>
                <div class="summary-item"><strong>In Progress:</strong> ${summary.inProgress}</div>
                <div class="summary-item"><strong>Completed:</strong> ${summary.completed}</div>
                <div class="summary-item"><strong>Total Value:</strong> $${summary.total.toLocaleString()}</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Design ID</th>
                    <th>Client</th>
                    <th>Designer</th>
                    <th>Completed Date</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Complexity</th>
                    <th>Estimated Value</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  ${sortedDesigns.map(design => `
                    <tr>
                      <td>${design.designId}</td>
                      <td>${design.client}</td>
                      <td>${design.designer}</td>
                      <td>${design.completedDate}</td>
                      <td>${design.designStatus}</td>
                      <td>${design.priority}</td>
                      <td>${design.complexity}</td>
                      <td>$${(design.budget || 0).toLocaleString()}</td>
                      <td>${design.notes || ''}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </body>
            </html>
          `;
          printWindow.document.write(printContent);
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
          printWindow.close();
        }
      }
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  }

  function handlePrint() {
    setPrinting(true);
    
    try {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const printContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Design History Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              h1 { color: #059669; }
              .summary { margin-bottom: 20px; }
              .summary-item { display: inline-block; margin-right: 20px; }
              @media print {
                body { margin: 0; }
                table { font-size: 12px; }
              }
            </style>
          </head>
          <body>
            <h1>Design History Report</h1>
            <div class="summary">
              <div class="summary-item"><strong>Not Started:</strong> ${summary.notStarted}</div>
              <div class="summary-item"><strong>In Progress:</strong> ${summary.inProgress}</div>
              <div class="summary-item"><strong>Completed:</strong> ${summary.completed}</div>
              <div class="summary-item"><strong>Total Value:</strong> $${summary.total.toLocaleString()}</div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Design ID</th>
                  <th>Client</th>
                  <th>Designer</th>
                  <th>Completed Date</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Complexity</th>
                  <th>Estimated Value</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                ${sortedDesigns.map(design => `
                  <tr>
                    <td>${design.designId}</td>
                    <td>${design.client}</td>
                    <td>${design.designer}</td>
                    <td>${design.completedDate}</td>
                    <td>${design.designStatus}</td>
                    <td>${design.priority}</td>
                    <td>${design.complexity}</td>
                    <td>$${(design.budget || 0).toLocaleString()}</td>
                    <td>${design.notes || ''}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
          </html>
        `;
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    } catch (error) {
      console.error('Print error:', error);
    } finally {
      setPrinting(false);
    }
  }

  const summary = getStatusSummary();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Header */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-0 pt-10 pb-4">
        <div className="flex items-center justify-between mb-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-emerald-200/50 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
              <History className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent tracking-tight">Design History</h1>
              <p className="text-md text-emerald-600 font-medium">Complete history of all design activities</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={fetchDesigns} 
              variant="outline" 
              size="sm" 
              className="text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border-emerald-200"
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link href="/dashboard/designs/status">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-full" title="Back to Designs Status">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="relative z-10 max-w-7xl mx-auto mb-8 flex justify-center">
        <div className="flex justify-center gap-4 flex-wrap px-4 md:px-0">
          <Card className="w-52 flex flex-col items-center justify-center p-4 cursor-pointer border-2 shadow-xl rounded-2xl bg-red-100 transition-all duration-300 hover:border-red-200 hover:scale-105">
            <CardContent className="flex flex-col items-center justify-center p-0">
              <AlertCircle className="w-7 h-7 mb-2 text-red-600" />
              <div className="text-2xl font-extrabold text-red-900">
                {loading ? '...' : summary.notStarted}
              </div>
              <div className="text-xs font-medium mt-1 text-red-700">Not Started</div>
            </CardContent>
          </Card>
          <Card className="w-52 flex flex-col items-center justify-center p-4 cursor-pointer border-2 shadow-xl rounded-2xl bg-blue-100 transition-all duration-300 hover:border-blue-200 hover:scale-105">
            <CardContent className="flex flex-col items-center justify-center p-0">
              <Clock className="w-7 h-7 mb-2 text-blue-600" />
              <div className="text-2xl font-extrabold text-blue-900">
                {loading ? '...' : summary.inProgress}
              </div>
              <div className="text-xs font-medium mt-1 text-blue-700">In Progress</div>
            </CardContent>
          </Card>
          <Card className="w-52 flex flex-col items-center justify-center p-4 cursor-pointer border-2 shadow-xl rounded-2xl bg-emerald-100 transition-all duration-300 hover:border-emerald-200 hover:scale-105">
            <CardContent className="flex flex-col items-center justify-center p-0">
              <CheckCircle className="w-7 h-7 mb-2 text-emerald-600" />
              <div className="text-2xl font-extrabold text-emerald-900">
                {loading ? '...' : summary.completed}
              </div>
              <div className="text-xs font-medium mt-1 text-emerald-700">Completed</div>
            </CardContent>
          </Card>
          <Card className="w-52 flex flex-col items-center justify-center p-4 cursor-pointer border-2 shadow-xl rounded-2xl bg-purple-100 transition-all duration-300 hover:border-purple-200 hover:scale-105">
            <CardContent className="flex flex-col items-center justify-center p-0">
              <Gem className="w-7 h-7 mb-2 text-purple-600" />
              <div className="text-2xl font-extrabold text-purple-900">
                {loading ? '...' : summary.total}
              </div>
              <div className="text-xs font-medium mt-1 text-purple-700">Total Value</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div className="relative z-10 max-w-7xl mx-auto mb-6 px-4 md:px-0">
        <Card className="shadow-xl rounded-2xl bg-white/80 border-emerald-100">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 items-center flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search designs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-emerald-400 focus:ring-emerald-400/20 rounded-xl"
                  />
                </div>
                <DateFilter dateRange={dateRange} setDateRange={setDateRange} />
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="bg-white border-gray-200 hover:bg-gray-100 hover:border-gray-300 rounded-xl">
                      <Download className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl bg-white/95 border-emerald-200">
                    <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleExport('csv')}>
                      <Download className="h-4 w-4" /> Export
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer" onClick={handlePrint}>
                      <Printer className="h-4 w-4" /> Print
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-0 mb-12">
        <Card className="shadow-2xl rounded-2xl bg-white/80 border-emerald-100">
          <CardContent className="p-0">
            <div className="rounded-2xl overflow-hidden luxury-table-wrapper">
              <table className="min-w-full bg-white/60 luxury-table">
                <thead className="sticky top-0 z-20 shadow-md bg-gradient-to-r from-emerald-50 to-green-50">
                  <tr>
                    <th 
                      className="px-4 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider cursor-pointer hover:bg-emerald-100 transition-colors"
                      onClick={() => handleSort("designId")}
                    >
                      <div className="flex items-center">
                        Design ID
                        {getSortIcon("designId")}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider cursor-pointer hover:bg-emerald-100 transition-colors"
                      onClick={() => handleSort("client")}
                    >
                      <div className="flex items-center">
                        Client
                        {getSortIcon("client")}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider cursor-pointer hover:bg-emerald-100 transition-colors"
                      onClick={() => handleSort("designer")}
                    >
                      <div className="flex items-center">
                        Designer
                        {getSortIcon("designer")}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider cursor-pointer hover:bg-emerald-100 transition-colors"
                      onClick={() => handleSort("completedDate")}
                    >
                      <div className="flex items-center">
                        Completed Date
                        {getSortIcon("completedDate")}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider cursor-pointer hover:bg-emerald-100 transition-colors"
                      onClick={() => handleSort("designStatus")}
                    >
                      <div className="flex items-center">
                        Status
                        {getSortIcon("designStatus")}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider cursor-pointer hover:bg-emerald-100 transition-colors"
                      onClick={() => handleSort("priority")}
                    >
                      <div className="flex items-center">
                        Priority
                        {getSortIcon("priority")}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider cursor-pointer hover:bg-emerald-100 transition-colors"
                      onClick={() => handleSort("complexity")}
                    >
                      <div className="flex items-center">
                        Complexity
                        {getSortIcon("complexity")}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider cursor-pointer hover:bg-emerald-100 transition-colors"
                      onClick={() => handleSort("budget")}
                    >
                      <div className="flex items-center">
                        Budget
                        {getSortIcon("budget")}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                          <span className="ml-2">Loading designs...</span>
                        </div>
                      </td>
                    </tr>
                  ) : sortedDesigns.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                        No designs found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    sortedDesigns.map((design, idx) => (
                      <tr key={design.designId || idx} className="hover:bg-emerald-50/50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{design.designId}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{design.client}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{design.designer}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {design.completedDate ? formatDate(design.completedDate) : 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {getStatusBadge(design)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge className={`${getPriorityColor(design.priority)} text-xs font-medium`}>
                            {design.priority.charAt(0).toUpperCase() + design.priority.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getComplexityIcon(design.complexity)}
                            <span className="text-sm text-gray-900 capitalize">{design.complexity}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ${(design.budget || 0).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl bg-white/95 border-emerald-200">
                              <DropdownMenuItem className="gap-2 cursor-pointer">
                                <Eye className="h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 cursor-pointer">
                                <Edit className="h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 cursor-pointer">
                                <FileText className="h-4 w-4" /> View Files
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
    </div>
  );
} 