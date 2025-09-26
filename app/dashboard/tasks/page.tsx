"use client";

import { useState } from "react";
import { User, Users, Briefcase, Search, Filter, Plus, Loader2, CheckCircle, AlertTriangle, X, ExternalLink, Sparkles, Gem, Clock, Target, TrendingUp, Calendar, CheckCircle2, AlertCircle, BarChart3, Crown } from "lucide-react";
import Link from "next/link";
import { Bar } from "react-chartjs-2";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// --- Mock Data Types ---
type TaskStage = "Design" | "Casting" | "Polishing" | "QC" | "Shipping";
type TaskStatus = "on-track" | "delayed" | "overdue";
interface Employee {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  available: boolean;
}
interface Partner {
  id: string;
  name: string;
  avatar?: string;
  specialty: string;
  available: boolean;
}
interface Task {
  id: string;
  orderNumber: string;
  item: string;
  customer: string;
  dueDate: string;
  stage: TaskStage;
  status: TaskStatus;
  assigneeType: "internal" | "external" | null;
  assigneeId: string | null;
  notes?: string;
}

// --- Mock Data ---
const mockEmployees: Employee[] = [
  { id: "e1", name: "Emma Johnson", role: "Designer", available: true },
  { id: "e2", name: "James Wilson", role: "Polisher", available: false },
  { id: "e3", name: "Noah Garcia", role: "QC Specialist", available: true },
  { id: "e4", name: "Olivia Lee", role: "Production Lead", available: true },
];
const mockPartners: Partner[] = [
  { id: "p1", name: "Swift Casting Co.", specialty: "Casting", available: true },
  { id: "p2", name: "Elite Polishers", specialty: "Polishing", available: false },
  { id: "p3", name: "Diamond QC Services", specialty: "QC", available: true },
];
const mockTasks: Task[] = [
  { id: "j1", orderNumber: "ORD-1003", item: "Topaz Brooch", customer: "Noah Garcia", dueDate: "2024-06-24", stage: "Design", status: "on-track", assigneeType: "internal", assigneeId: "e1" },
  { id: "j2", orderNumber: "ORD-1001", item: "Diamond Engagement Ring", customer: "William Kim", dueDate: "2024-06-25", stage: "Design", status: "delayed", assigneeType: "internal", assigneeId: "e2" },
  { id: "j3", orderNumber: "ORD-1004", item: "Silver Cufflinks", customer: "William Kim", dueDate: "2024-06-25", stage: "Polishing", status: "on-track", assigneeType: "external", assigneeId: "p2" },
  { id: "j4", orderNumber: "ORD-1005", item: "Gold Pendant", customer: "Emma Wilson", dueDate: "2024-06-26", stage: "QC", status: "overdue", assigneeType: "external", assigneeId: "p3" },
  { id: "j5", orderNumber: "ORD-1006", item: "Platinum Band", customer: "Lisa Chen", dueDate: "2024-06-27", stage: "Casting", status: "on-track", assigneeType: null, assigneeId: null },
];

const statusColors = {
  "on-track": "bg-green-100 text-green-700",
  "delayed": "bg-yellow-100 text-yellow-700",
  "overdue": "bg-red-100 text-red-700",
};

const stages: TaskStage[] = ["Design", "Casting", "Polishing", "QC", "Shipping"];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [filter, setFilter] = useState({ search: "", stage: "All", status: "All", assignee: "All", urgent: false, sort: "newest" });
  const [assignModal, setAssignModal] = useState<{ open: boolean; taskId: string | null }>({ open: false, taskId: null });
  const [assignTab, setAssignTab] = useState<"internal" | "external">("internal");
  const [assignLoading, setAssignLoading] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState<Task | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Filtered tasks
  let filteredTasks = tasks.filter(j =>
    (filter.stage === "All" || j.stage === filter.stage) &&
    (filter.status === "All" || j.status === filter.status) &&
    (filter.assignee === "All" || (j.assigneeId && (getAssignee(j)?.name === filter.assignee))) &&
    (!filter.urgent || (j.notes && j.notes.includes("urgent"))) &&
    (j.orderNumber.toLowerCase().includes(filter.search.toLowerCase()) ||
      j.item.toLowerCase().includes(filter.search.toLowerCase()) ||
      j.customer.toLowerCase().includes(filter.search.toLowerCase()))
  );
  filteredTasks = filteredTasks.sort((a, b) => {
    if (filter.sort === "oldest") return a.dueDate.localeCompare(b.dueDate);
    return b.dueDate.localeCompare(a.dueDate);
  });

  // Analytics
  const total = tasks.length;
  const overdue = tasks.filter(j => j.status === "overdue").length;
  const delayed = tasks.filter(j => j.status === "delayed").length;
  const unassigned = tasks.filter(j => !j.assigneeId).length;
  const completed = tasks.filter(j => j.status === "on-track").length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Assignment logic
  const handleOpenAssign = (taskId: string) => {
    setAssignModal({ open: true, taskId });
    setAssignTab("internal");
    setSelectedAssignee(null);
  };
  const handleAssign = () => {
    if (!assignModal.taskId || !selectedAssignee) return;
    setAssignLoading(true);
    setTimeout(() => {
      setTasks(tasks => tasks.map(j =>
        j.id === assignModal.taskId
          ? {
              ...j,
              assigneeType: assignTab,
              assigneeId: selectedAssignee,
            }
          : j
      ));
      setAssignLoading(false);
      setAssignModal({ open: false, taskId: null });
      setSelectedAssignee(null);
    }, 1000);
  };

  // Bulk actions
  const handleBulkAssign = () => {
    if (!selectedAssignee || selectedTasks.length === 0) return;
    setAssignLoading(true);
    setTimeout(() => {
      setTasks(tasks => tasks.map(j =>
        selectedTasks.includes(j.id)
          ? { ...j, assigneeType: assignTab, assigneeId: selectedAssignee }
          : j
      ));
      setAssignLoading(false);
      setSelectedTasks([]);
      setSelectedAssignee(null);
    }, 1000);
  };
  const handleBulkUrgent = () => {
    setTasks(tasks => tasks.map(j =>
      selectedTasks.includes(j.id)
        ? { ...j, notes: (j.notes || "") + " urgent" }
        : j
    ));
    setSelectedTasks([]);
  };
  const handleBulkExport = () => {
    // Mock export
    alert("Exported " + selectedTasks.length + " tasks as CSV");
  };

  // Get assignee info
  function getAssignee(task: Task) {
    if (!task.assigneeId) return null;
    if (task.assigneeType === "internal") return mockEmployees.find(e => e.id === task.assigneeId);
    if (task.assigneeType === "external") return mockPartners.find(p => p.id === task.assigneeId);
    return null;
  }

  // Analytics chart data (mocked)
  const tasksPerStage = stages.map(stage => tasks.filter(j => j.stage === stage).length);
  const analyticsData = {
    labels: stages,
    datasets: [
      {
        label: "Tasks per Stage",
        data: tasksPerStage,
        backgroundColor: ["#10b981", "#f59e42", "#3b82f6", "#f43f5e", "#6366f1"],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/50 relative overflow-hidden">
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
          <div className="relative p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-lg">
                    <Target className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 via-green-700 to-emerald-800 bg-clip-text text-transparent tracking-tight tasks-heading">
                      Task Management
                    </h1>
                    <p className="text-sm sm:text-base lg:text-lg text-slate-600 font-medium tasks-subtext">Premium task pipeline for managing production workflows</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                    <span>Premium Features Enabled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gem className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
                    <span>Advanced Analytics</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 sm:gap-3 items-center">
                <Button 
                  variant="outline" 
                  size="icon"
                  className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300 min-h-[44px] min-w-[44px]"
                  aria-label="Analytics"
                  title="Analytics"
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="icon"
                  className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300 min-h-[44px] min-w-[44px]"
                  aria-label="Filters"
                  title="Filters"
                >
                  <Filter className="h-4 w-4" />
                </Button>
                
                <Button className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm min-h-[44px]">
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">New Task</span>
                  <span className="sm:hidden">New</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Task Analytics Cards */}
        <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 overflow-x-auto">
          <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group min-w-[280px] sm:min-w-0">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 truncate">Total Tasks</h4>
                    <Badge variant="secondary" className="text-xs mt-1">
                      Tasks
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                  {total}
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>{completionRate}% completion rate</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                Total number of tasks in the system
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group min-w-[280px] sm:min-w-0">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 truncate">On Track</h4>
                    <Badge variant="secondary" className="text-xs mt-1">
                      Tasks
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                  {completed}
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  <span>tasks completed</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                Tasks that are on track for completion
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group min-w-[280px] sm:min-w-0">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 truncate">Delayed</h4>
                    <Badge variant="secondary" className="text-xs mt-1">
                      Tasks
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                  {delayed}
                </div>
                <div className="flex items-center gap-1 text-xs text-yellow-600">
                  <AlertCircle className="h-3 w-3" />
                  <span>need attention</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                Tasks that are behind schedule
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group min-w-[280px] sm:min-w-0">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                    <AlertTriangle className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 truncate">Overdue</h4>
                    <Badge variant="secondary" className="text-xs mt-1">
                      Tasks
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                  {overdue}
                </div>
                <div className="flex items-center gap-1 text-xs text-red-600">
                  <AlertTriangle className="h-3 w-3" />
                  <span>critical priority</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                Tasks that are past their due date
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Main Content */}
        <div className="relative">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-4 sm:p-6 lg:p-8">
            {/* Enhanced Filters */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-wrap items-start sm:items-center justify-start sm:justify-center mb-6 sm:mb-8">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search tasks, items, customers..."
                  value={filter.search}
                  onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
                  className="w-full sm:w-80 pl-10 bg-white/80 backdrop-blur-sm border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300 text-xs sm:text-sm min-h-[44px]"
                />
              </div>
              
              <Select value={filter.stage} onValueChange={(value) => setFilter(f => ({ ...f, stage: value }))}>
                <SelectTrigger className="w-full sm:w-48 bg-white/80 backdrop-blur-sm border-slate-200 text-xs sm:text-sm min-h-[44px]">
                  <SelectValue placeholder="All Stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Stages</SelectItem>
                  {stages.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              
              <Select value={filter.status} onValueChange={(value) => setFilter(f => ({ ...f, status: value }))}>
                <SelectTrigger className="w-full sm:w-48 bg-white/80 backdrop-blur-sm border-slate-200 text-xs sm:text-sm min-h-[44px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="on-track">On Track</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filter.assignee} onValueChange={(value) => setFilter(f => ({ ...f, assignee: value }))}>
                <SelectTrigger className="w-full sm:w-48 bg-white/80 backdrop-blur-sm border-slate-200 text-xs sm:text-sm min-h-[44px]">
                  <SelectValue placeholder="All Assignees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Assignees</SelectItem>
                  {[...mockEmployees.map(e => ({ id: e.id, name: e.name })), ...mockPartners.map(p => ({ id: p.id, name: p.name }))].map(a => (
                    <SelectItem key={a.id} value={a.name}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filter.sort} onValueChange={(value) => setFilter(f => ({ ...f, sort: value }))}>
                <SelectTrigger className="w-full sm:w-48 bg-white/80 backdrop-blur-sm border-slate-200 text-xs sm:text-sm min-h-[44px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest to Oldest</SelectItem>
                  <SelectItem value="oldest">Oldest to Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Enhanced Tasks Table */}
            <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
              <div className="grid grid-cols-10 gap-2 sm:gap-4 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 font-medium text-slate-700 text-xs sm:text-sm bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 overflow-x-auto">
                <div>
                  <input type="checkbox" checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0} onChange={e => setSelectedTasks(e.target.checked ? filteredTasks.map(j => j.id) : [])} className="min-h-[44px] min-w-[44px]" />
                </div>
                <div>Order #</div>
                <div>Item</div>
                <div>Customer</div>
                <div>Due</div>
                <div>Status</div>
                <div>Stage</div>
                <div>Assignee</div>
                <div>Type</div>
              </div>
              <div className="overflow-x-auto">
                {filteredTasks.map(task => {
                  const assignee = getAssignee(task);
                  return (
                    <div key={task.id} className="grid grid-cols-10 gap-2 sm:gap-4 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 items-center group hover:bg-emerald-50/50 transition cursor-pointer border-b border-slate-100 last:border-b-0" onClick={() => setShowDetails(task)}>
                      <div>
                        <input type="checkbox" checked={selectedTasks.includes(task.id)} onChange={e => { e.stopPropagation(); setSelectedTasks(sel => e.target.checked ? [...sel, task.id] : sel.filter(id => id !== task.id)); }} className="min-h-[44px] min-w-[44px]" />
                      </div>
                      <div className="font-mono text-xs">
                        <Link 
                          href={`/dashboard/orders/${task.orderNumber}`}
                          className="text-emerald-700 hover:underline font-semibold"
                          onClick={e => e.stopPropagation()}
                        >
                          {task.orderNumber}
                        </Link>
                      </div>
                      <div className="truncate text-xs sm:text-sm font-medium">{task.item}</div>
                      <div className="truncate text-xs sm:text-sm">{task.customer}</div>
                      <div className="text-xs font-mono">{task.dueDate}</div>
                      <div>
                        <Badge className={`${statusColors[task.status]} border-0 text-xs`}>
                          {task.status.replace("-", " ")}
                        </Badge>
                      </div>
                      <div className="text-xs sm:text-sm font-medium">{task.stage}</div>
                      <div className="flex flex-col items-center justify-center min-w-[100px] sm:min-w-[120px]">
                        {assignee ? (
                          <>
                            <span className="text-xs font-medium whitespace-nowrap mb-1">{assignee.name}</span>
                            <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 text-xs min-h-[44px]" onClick={e => { e.stopPropagation(); handleOpenAssign(task.id); }}>
                              Reassign
                            </Button>
                          </>
                        ) : (
                          <Button className="px-2 sm:px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 transform hover:scale-105 min-h-[44px]" onClick={e => { e.stopPropagation(); handleOpenAssign(task.id); }}>
                            Assign
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center justify-center">
                        <Badge variant="outline" className={
                          task.assigneeType === "internal"
                            ? "border-green-200 bg-green-50 text-green-700 text-xs"
                            : task.assigneeType === "external"
                            ? "border-blue-200 bg-blue-50 text-blue-700 text-xs"
                            : "border-slate-200 bg-slate-50 text-slate-500 text-xs"
                        }>
                          {task.assigneeType === "internal"
                            ? "Internal"
                            : task.assigneeType === "external"
                            ? "External"
                            : "Unassigned"}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
              {filteredTasks.length === 0 && (
                <div className="text-center py-8 sm:py-12 text-slate-400">
                  <Target className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-slate-300" />
                  <p className="text-base sm:text-lg font-medium">No tasks found</p>
                  <p className="text-xs sm:text-sm">Try adjusting your filters or create a new task</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Assign Modal */}
      {(assignModal.open || (selectedTasks.length > 0 && selectedAssignee !== null)) && (
        <Dialog open={assignModal.open || (selectedTasks.length > 0 && selectedAssignee !== null)} onOpenChange={() => { setAssignModal({ open: false, taskId: null }); setSelectedAssignee(null); }}>
          <DialogContent className="max-w-lg bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl font-semibold text-slate-800">
                {selectedTasks.length > 0 ? "Bulk Assign Tasks" : "Assign Task"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant={assignTab === "internal" ? "default" : "outline"}
                  className={`${assignTab === "internal" ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white" : "bg-white/80 backdrop-blur-sm border-slate-200"} text-xs sm:text-sm min-h-[44px]`}
                  onClick={() => setAssignTab("internal")}
                >
                  Internal Employee
                </Button>
                <Button 
                  variant={assignTab === "external" ? "default" : "outline"}
                  className={`${assignTab === "external" ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white" : "bg-white/80 backdrop-blur-sm border-slate-200"} text-xs sm:text-sm min-h-[44px]`}
                  onClick={() => setAssignTab("external")}
                >
                  External Provider
                </Button>
              </div>
              <div>
                <Input
                  type="text"
                  className="bg-white/50 border-slate-200 mb-3 sm:mb-4 text-xs sm:text-sm min-h-[44px]"
                  placeholder={assignTab === "internal" ? "Search employees..." : "Search partners..."}
                  onChange={e => setSelectedAssignee(null)}
                />
                <div className="max-h-48 overflow-y-auto divide-y border border-slate-200 rounded-lg">
                  {(assignTab === "internal" ? mockEmployees : mockPartners).map(person => (
                    <div
                      key={person.id}
                      className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 cursor-pointer hover:bg-emerald-50 transition ${selectedAssignee === person.id ? "bg-emerald-100" : ""}`}
                      onClick={() => setSelectedAssignee(person.id)}
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-sm sm:text-lg font-bold text-white">
                        {person.avatar ? <img src={person.avatar} alt={person.name} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover" /> : person.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs sm:text-sm">{person.name}</div>
                        <div className="text-xs text-slate-500">{assignTab === "internal" ? (person as Employee).role : (person as Partner).specialty}</div>
                      </div>
                      <Badge variant={person.available ? "default" : "secondary"} className={`${person.available ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"} text-xs`}>
                        {person.available ? "Available" : "Busy"}
                      </Badge>
                      {selectedAssignee === person.id && <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-3">
              <Button variant="outline" onClick={() => { setAssignModal({ open: false, taskId: null }); setSelectedAssignee(null); }} className="border-slate-200 text-xs sm:text-sm min-h-[44px]">
                Cancel
              </Button>
              <Button 
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm min-h-[44px]"
                onClick={selectedTasks.length > 0 ? handleBulkAssign : handleAssign}
                disabled={!selectedAssignee || assignLoading}
              >
                {assignLoading ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1 sm:mr-2" /> : <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />}
                Assign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Enhanced Task Details Modal */}
      {showDetails && (
        <Dialog open={!!showDetails} onOpenChange={() => setShowDetails(null)}>
          <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl font-semibold text-slate-800">
                {showDetails.item} <span className="text-xs sm:text-sm text-slate-400">({showDetails.orderNumber})</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-slate-700">Customer</label>
                  <p className="text-xs sm:text-sm text-slate-900 font-medium">{showDetails.customer}</p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-slate-700">Stage</label>
                  <p className="text-xs sm:text-sm text-slate-900 font-medium">{showDetails.stage}</p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-slate-700">Due Date</label>
                  <p className="text-xs sm:text-sm text-slate-900 font-medium">{showDetails.dueDate}</p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-slate-700">Status</label>
                  <Badge className={`${statusColors[showDetails.status]} border-0 text-xs`}>
                    {showDetails.status.replace("-", " ")}
                  </Badge>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-slate-700">Assignee</label>
                  <p className="text-xs sm:text-sm text-slate-900 font-medium">{getAssignee(showDetails)?.name || "Unassigned"}</p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-slate-700">Type</label>
                  <Badge variant="outline" className={
                    showDetails.assigneeType === "internal"
                      ? "border-green-200 bg-green-50 text-green-700 text-xs"
                      : showDetails.assigneeType === "external"
                      ? "border-blue-200 bg-blue-50 text-blue-700 text-xs"
                      : "border-slate-200 bg-slate-50 text-slate-500 text-xs"
                  }>
                    {showDetails.assigneeType === "internal" ? "Internal" : showDetails.assigneeType === "external" ? "External" : "Unassigned"}
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className="text-xs sm:text-sm font-medium text-slate-700 mb-2 block">Notes</label>
                <textarea className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs sm:text-sm bg-white/50 min-h-[44px]" rows={3} defaultValue={showDetails.notes || ""} placeholder="Add notes..." />
              </div>
              
              <div>
                <label className="text-xs sm:text-sm font-medium text-slate-700 mb-2 block">Timeline</label>
                <div className="space-y-2 text-xs sm:text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>2024-06-20: Assigned to {getAssignee(showDetails)?.name || "Unassigned"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>2024-06-18: Stage changed to {showDetails.stage}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                    <span>2024-06-15: Task created</span>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-3">
              <Button variant="outline" className="border-slate-200 text-xs sm:text-sm min-h-[44px]">Export</Button>
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs sm:text-sm min-h-[44px]">Mark Urgent</Button>
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs sm:text-sm min-h-[44px]">Mark Complete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 