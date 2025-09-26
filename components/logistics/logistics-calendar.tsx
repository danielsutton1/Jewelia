import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogisticsItem, mockPackingData, mockShippingData, mockDeliveryData } from "@/data/logistics-mock-data";

const ALL_STAGES = [
  { id: "orders", name: "Orders" },
  { id: "packing", name: "Pack & Ship" },
  { id: "pickup", name: "Pick Up" },
  { id: "delivery", name: "Delivery" },
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

function getAllLogisticsItems(): LogisticsItem[] {
  return [
    ...mockPackingData,
    ...mockShippingData,
    ...mockDeliveryData,
  ];
}

export function LogisticsCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [assignee, setAssignee] = useState<string>("all");

  // Gather all unique assignees from logistics data
  const allItems = useMemo(() => getAllLogisticsItems(), []);
  const assignees = useMemo(() => Array.from(new Set(allItems.map(i => i.assignee).filter((v): v is string => typeof v === 'string'))), [allItems]);

  // Gather events for each day, filtered by assignee
  function getEventsForDate(date: Date) {
    const grouped: Record<string, LogisticsItem[]> = {};
    ALL_STAGES.forEach(stage => grouped[stage.id] = []);
    allItems.forEach(item => {
      if (assignee !== "all" && item.assignee !== assignee) return;
      const dueDate = new Date(item.dueDate);
      if (!isNaN(dueDate.getTime()) && dueDate.getMonth() === date.getMonth() && dueDate.getDate() === date.getDate() && dueDate.getFullYear() === date.getFullYear()) {
        // Determine stage by presence in mock data
        if (mockPackingData.some(i => i.id === item.id)) grouped["packing"].push(item);
        else if (mockShippingData.some(i => i.id === item.id)) grouped["pickup"].push(item);
        else if (mockDeliveryData.some(i => i.id === item.id)) grouped["delivery"].push(item);
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
    <Card className="mb-8">
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
                {assignees.map(person => (
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
                    {ALL_STAGES.map(stage => (
                      getEventsForDate(date)[stage.id].length > 0 && (
                        <div key={stage.id} className="flex items-center justify-between w-full text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-800 mb-1">
                          <span className="truncate">{stage.name}</span>
                          <Badge variant="secondary" className="ml-2 text-xs">{getEventsForDate(date)[stage.id].length}</Badge>
                        </div>
                      )
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 