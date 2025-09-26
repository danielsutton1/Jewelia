"use client"

import { useState, useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Download, Calendar as CalendarIcon, RefreshCw, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { DateRange } from "react-day-picker"
import { format, subDays } from "date-fns"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { ReworksDataTable, ReworkTicket } from "./reworks-data-table"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock data for individual rework tickets
const mockReworkTickets: ReworkTicket[] = [
  { id: "RW-001", workOrderId: "WO-12345", status: "Resolved", priority: "High", category: "Production Error", dateLogged: "2023-05-10" },
  { id: "RW-002", workOrderId: "WO-12348", status: "Resolved", priority: "Medium", category: "Material Defect", dateLogged: "2023-05-12" },
  { id: "RW-003", workOrderId: "WO-12350", status: "Open", priority: "High", category: "Design Error", dateLogged: "2023-06-01" },
  { id: "RW-004", workOrderId: "WO-12351", status: "In Progress", priority: "Low", category: "Production Error", dateLogged: "2023-06-02" },
  { id: "RW-005", workOrderId: "WO-12355", status: "Open", priority: "Medium", category: "Measurement Error", dateLogged: "2023-06-05" },
  { id: "RW-006", workOrderId: "WO-12360", status: "Resolved", priority: "High", category: "Production Error", dateLogged: "2023-04-15" },
  { id: "RW-007", workOrderId: "WO-12361", status: "Resolved", priority: "Low", category: "Communication Error", dateLogged: "2023-04-20" },
  { id: "RW-008", workOrderId: "WO-12365", status: "Open", priority: "High", category: "Design Error", dateLogged: "2023-06-10" },
  { id: "RW-009", workOrderId: "WO-12370", status: "In Progress", priority: "Medium", category: "Material Defect", dateLogged: "2023-06-11" },
  { id: "RW-010", workOrderId: "WO-12375", status: "Resolved", priority: "Low", category: "Production Error", dateLogged: "2023-03-05" },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export function TrackingDashboard() {
  const [tickets] = useState<ReworkTicket[]>(mockReworkTickets);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 90),
    to: new Date(),
  });

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const ticketDate = new Date(ticket.dateLogged);
      const isAfterFrom = date?.from ? ticketDate >= date.from : true;
      const isBeforeTo = date?.to ? ticketDate <= date.to : true;
      const inDateRange = isAfterFrom && isBeforeTo;

      const statusMatch = statusFilter === 'all' || ticket.status === statusFilter;
      const priorityMatch = priorityFilter === 'all' || ticket.priority === priorityFilter;
      const categoryMatch = categoryFilter === 'all' || ticket.category === categoryFilter;

      return inDateRange && statusMatch && priorityMatch && categoryMatch;
    });
  }, [tickets, date, statusFilter, priorityFilter, categoryFilter]);

  const stats = useMemo(() => {
    const totalReworks = filteredTickets.length;
    const openReworks = filteredTickets.filter(t => t.status === 'Open').length;
    const resolvedReworks = filteredTickets.filter(t => t.status === 'Resolved').length;
    
    const reworksByCategory = filteredTickets.reduce((acc, ticket) => {
        const category = acc.find(c => c.category === ticket.category);
        if (category) {
            category.count++;
        } else {
            acc.push({ category: ticket.category, count: 1 });
        }
        return acc;
    }, [] as { category: string, count: number }[]);

    return { totalReworks, openReworks, resolvedReworks, reworksByCategory };
  }, [filteredTickets]);

  const allCategories = useMemo(() => ['all', ...Array.from(new Set(tickets.map(t => t.category)))], [tickets]);

  const handleDownload = () => {
    if (filteredTickets.length === 0) {
      alert("No data to download.");
      return;
    }
    
    // Create CSV content manually
    const headers = Object.keys(filteredTickets[0]).join(',');
    const rows = filteredTickets.map(ticket => 
      Object.values(ticket).map(value => `"${value}"`).join(',')
    );
    const csvContent = [headers, ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "reworks_export.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Filters Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl"></div>
        <div className="relative p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-800">Reworks Dashboard</h2>
              <p className="text-slate-600">
                Monitor rework trends, identify common issues, and analyze cost impact.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
               <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-[260px] justify-start text-left font-normal bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300",
                      !date && "text-slate-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "LLL dd, y")} -{" "}
                          {format(date.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] bg-white/80 backdrop-blur-sm border-slate-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px] bg-white/80 backdrop-blur-sm border-slate-200">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl">
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
               <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px] bg-white/80 backdrop-blur-sm border-slate-200">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl">
                  {allCategories.map(cat => <SelectItem key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleDownload}
                className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-slate-700">Total Reworks</CardTitle>
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg shadow-lg">
              <RefreshCw className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-slate-800">{stats.totalReworks}</div>
            <p className="text-xs text-slate-600">in selected period</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-slate-700">Open Reworks</CardTitle>
            <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg shadow-lg">
              <AlertCircle className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-slate-800">{stats.openReworks}</div>
            <p className="text-xs text-slate-600">
              {stats.totalReworks > 0 ? ((stats.openReworks / stats.totalReworks) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-slate-700">Resolved Reworks</CardTitle>
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg shadow-lg">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-slate-800">{stats.resolvedReworks}</div>
             <p className="text-xs text-slate-600">
              {stats.totalReworks > 0 ? ((stats.resolvedReworks / stats.totalReworks) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 group">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-slate-700">Avg. Resolution Time</CardTitle>
            <div className="p-2 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg shadow-lg">
              <Clock className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-slate-800">3.2 days</div>
            <p className="text-xs text-slate-600">(mock data)</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Charts Card */}
      <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
          <CardHeader className="relative z-10">
              <CardTitle className="text-slate-800">Reworks by Category</CardTitle>
              <CardDescription className="text-slate-600">Distribution of reworks across different categories for the selected period.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ChartContainer
                  config={{
                  count: {
                      label: "Rework Count",
                  },
                  }}
                  className="h-[300px]"
              >
                  <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.reworksByCategory} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="category" type="category" width={120} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} barSize={32}>
                        {stats.reworksByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                  </BarChart>
                  </ResponsiveContainer>
              </ChartContainer>

              <div className="flex items-center justify-center h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                      <Pie
                        data={stats.reworksByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="category"
                      >
                        {stats.reworksByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                  </PieChart>
                  </ResponsiveContainer>
              </div>
              </div>
          </CardContent>
      </Card>
      
      {/* Enhanced Data Table Card */}
      <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
        <CardHeader className="relative z-10">
          <CardTitle className="text-slate-800">All Rework Tickets</CardTitle>
          <CardDescription className="text-slate-600">
            A detailed list of all rework tickets in the selected period. Use the filters above to refine this list.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <ReworksDataTable data={filteredTickets} />
        </CardContent>
      </Card>
    </div>
  )
} 
 