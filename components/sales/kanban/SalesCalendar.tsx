import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Phone, PenTool, Send, ClipboardList, CheckCircle } from "lucide-react";
// import { mockCalls } from "@/app/dashboard/call-log/page";
import { mockCompletedDesigns } from "@/data/mock-designs";
import { mockQuotes } from "@/data/mock-quotes";
import { orders } from "@/components/orders/orders-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const EVENT_TYPES = [
  { key: "logCall", label: "Log Call", color: "bg-emerald-100 text-emerald-800", icon: <Phone className="w-4 h-4 mr-1" /> },
  { key: "designStatus", label: "Design Status", color: "bg-blue-100 text-blue-800", icon: <PenTool className="w-4 h-4 mr-1" /> },
  { key: "quoteSent", label: "Quote Sent", color: "bg-blue-50 text-blue-700", icon: <Send className="w-4 h-4 mr-1" /> },
  { key: "clientResponseAccepted", label: "Client Response (Accepted)", color: "bg-emerald-50 text-emerald-700", icon: <ClipboardList className="w-4 h-4 mr-1" /> },
  { key: "clientResponseDeclined", label: "Client Response (Declined)", color: "bg-red-50 text-red-700", icon: <ClipboardList className="w-4 h-4 mr-1" /> },
  { key: "orderCreated", label: "Order Created", color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-4 h-4 mr-1" /> },
];

function getDaysInMonth(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
  return days;
}

export function SalesCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dialog, setDialog] = useState<{ open: boolean; date: Date | null; type: string | null }>({ open: false, date: null, type: null });
  const [assignee, setAssignee] = useState<string>("all");
  const [callLogs, setCallLogs] = useState<any[]>([]);
  const [callLogsLoading, setCallLogsLoading] = useState(true);

  // Fetch call logs data
  React.useEffect(() => {
    const fetchCallLogs = async () => {
      try {
        setCallLogsLoading(true);
        const response = await fetch('/api/call-log');
        const result = await response.json();
        
        if (result.success) {
          // Transform API data to match the expected format
          const transformedLogs = result.data.map((log: any) => ({
            callNumber: `CL-${new Date(log.created_at).getFullYear()}-${String(log.id).padStart(4, '0')}`,
            customer: log.customer_name,
            customerId: log.customer_id,
            status: log.status,
            type: log.call_type,
            assignee: log.staff_name,
            date: log.created_at,
            notes: log.notes,
            followUp: log.outcome === "follow-up-needed",
            duration: parseInt(log.duration) || 0,
            files: log.files || [],
            outcome: log.outcome,
          }));
          setCallLogs(transformedLogs);
        } else {
          console.error('Failed to fetch call logs:', result.error);
          setCallLogs([]);
        }
      } catch (error) {
        console.error('Error fetching call logs:', error);
        setCallLogs([]);
      } finally {
        setCallLogsLoading(false);
      }
    };

    fetchCallLogs();
  }, []);

  // Gather all unique assignees from mock data
  const assignees = Array.from(new Set([
    ...mockQuotes.map(q => q.assignee).filter((v): v is string => typeof v === 'string' && v.trim() !== ''),
    ...callLogs.map((c: any) => c.assignee).filter((v): v is string => typeof v === 'string' && v.trim() !== ''),
    ...mockCompletedDesigns.map(d => d.assignedTo).filter((v): v is string => typeof v === 'string' && v.trim() !== ''),
    // orders do not have assignee property in sample data
  ]));

  // Helper to parse dates using the calendar's current year
  function parseDate(date: string | Date) {
    if (date instanceof Date) return date;
    if (!date) return null;
    const d = new Date(date);
    if (!isNaN(d.getTime())) return d;
    // Try parsing 'Jul 8' as the current calendar year
    const match = date.match(/([A-Za-z]+) (\d{1,2})/);
    if (match) {
      const month = match[1];
      const day = parseInt(match[2], 10);
      return new Date(currentMonth.getFullYear(), ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].indexOf(month), day);
    }
    return null;
  }

  // Gather events for each day, filtered by assignee
  function getEventsForDate(date: Date) {
    const grouped: Record<string, { label: string; data: any[] }> = {};
    // Log Call
    callLogs.forEach((call: any) => {
      if (assignee !== "all" && call.assignee !== assignee) return;
      const callDate = parseDate(call.date);
      if (callDate && callDate.toDateString() === date.toDateString()) {
        if (!grouped.logCall) grouped.logCall = { label: "Log Call", data: [] };
        grouped.logCall.data.push(call);
      }
    });
    // Design Status (completed only)
    mockCompletedDesigns.forEach(design => {
      if (assignee !== "all" && design.assignedTo !== assignee) return;
      const completedDate = parseDate(design.completedDate || design.dueDate || "");
      if (completedDate && completedDate.toDateString() === date.toDateString()) {
        if (!grouped.designStatus) grouped.designStatus = { label: "Design Status", data: [] };
        grouped.designStatus.data.push(design);
      }
    });
    // Quote Sent
    mockQuotes.forEach(quote => {
      if (assignee !== "all" && quote.assignee !== assignee) return;
      const sentDate = parseDate(quote.sent);
      if (quote.status === "sent" && sentDate && sentDate.toDateString() === date.toDateString()) {
        if (!grouped.quoteSent) grouped.quoteSent = { label: "Quote Sent", data: [] };
        grouped.quoteSent.data.push(quote);
      }
    });
    // Client Response (accepted/declined)
    mockQuotes.forEach(quote => {
      if (assignee !== "all" && quote.assignee !== assignee) return;
      const responseDate = parseDate(quote.dueDate);
      if (["accepted", "declined"].includes(quote.status) && responseDate && responseDate.toDateString() === date.toDateString()) {
        const key = quote.status === "accepted" ? "clientResponseAccepted" : "clientResponseDeclined";
        if (!grouped[key]) grouped[key] = { label: `Client Response (${quote.status.charAt(0).toUpperCase() + quote.status.slice(1)})`, data: [] };
        grouped[key].data.push(quote);
      }
    });
    // Order Created (skip assignee filter for orders)
    orders.forEach(order => {
      const createdDate = parseDate(order.created_at);
      if (createdDate && createdDate.toDateString() === date.toDateString()) {
        if (!grouped.orderCreated) grouped.orderCreated = { label: "Order Created", data: [] };
        grouped.orderCreated.data.push(order);
      }
    });
    return grouped;
  }

  function navigateMonth(direction: 'prev' | 'next') {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') newMonth.setMonth(prev.getMonth() - 1);
      else newMonth.setMonth(prev.getMonth() + 1);
      return newMonth;
    });
  }

  return (
    <Card className="mt-10">
      <CardContent className="p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Select value={assignee} onValueChange={setAssignee}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Assignees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                {assignees.filter(person => person && person.trim() !== '').map(person => (
                  <SelectItem key={person} value={person}>{person}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setCurrentMonth(new Date())}>Today</Button>
          </div>
        </div>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">{day}</div>
          ))}
          {/* Calendar days */}
          {getDaysInMonth(currentMonth).map((date, idx) => (
            <div key={idx} className={`min-h-[120px] p-2 border rounded-md ${date ? 'bg-background hover:bg-muted/50' : 'bg-muted/20'}`}>
              {date && (
                <>
                  <div className="text-sm font-medium mb-2">
                    {date.getDate()}
                    {date.toDateString() === new Date().toDateString() && <span className="ml-1 text-primary">•</span>}
                  </div>
                  <div className="space-y-1">
                    {Object.entries(getEventsForDate(date)).map(([type, { label, data }], i) => {
                      const eventType = EVENT_TYPES.find(e => e.key === type);
                      return (
                        <button
                          key={i}
                          className={`flex items-center justify-between w-full text-xs px-2 py-1 rounded cursor-pointer transition-colors hover:opacity-80 ${eventType?.color}`}
                          onClick={() => setDialog({ open: true, date, type })}
                          title={label}
                        >
                          <span className="truncate">{label}</span>
                          <Badge variant="secondary" className="ml-2 text-xs">{data.length}</Badge>
                        </button>
                      );
                    })}
                  </div>
                  {Object.values(getEventsForDate(date)).reduce((sum, { data }) => sum + data.length, 0) > 3 && (
                    <div className="mt-1 text-xs text-muted-foreground">{Object.values(getEventsForDate(date)).reduce((sum, { data }) => sum + data.length, 0)} total</div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="mt-6 p-4 bg-muted/20 rounded-lg">
          <h3 className="text-sm font-medium mb-3">Sales Pipeline Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {EVENT_TYPES.map(type => (
              <div key={type.key} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${type.color.split(' ')[0]}`} />
                <span className="text-xs flex items-center">{type.icon}{type.label}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Dialog for event details */}
        <Dialog open={dialog.open} onOpenChange={open => setDialog(d => ({ ...d, open }))}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {dialog.date && `${dialog.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                {dialog.type && ` – ${EVENT_TYPES.find(e => e.key === dialog.type)?.label}`}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 text-muted-foreground">Event details coming soon...</div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default SalesCalendar; 