"use client"

import * as React from "react"
import { DndContext, DragOverlay, closestCorners, useSensor, useSensors, PointerSensor, useDraggable, useDroppable } from "@dnd-kit/core"
import { restrictToParentElement } from "@dnd-kit/modifiers"
import { AlertTriangle, Filter, Settings, Search, Calendar, Clock, Users, Target, ChevronLeft, ChevronRight, Eye, Download, Mail, Edit, MessageSquare, RefreshCw, Plus, Pencil, Trash2, GripVertical } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { KanbanColumn } from "./kanban-column"
import { WorkOrderCard } from "./work-order-card"
import { ProductionMetrics } from "./production-metrics"
import { generateSampleWorkOrders, type WorkOrder, type ProductionStage } from "./data"
import { ProductionPipeline } from "@/components/production/production-pipeline"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { DesignLogTable } from "./design-log-table"
import Link from "next/link"
import { DateRange } from "react-day-picker"

const ALL_STAGES: ProductionStage[] = [
  { id: "design", name: "Design", wipLimit: 5 },
  { id: "cad", name: "CAD", wipLimit: 4 },
  { id: "casting", name: "Casting", wipLimit: 8 },
  { id: "setting", name: "Setting", wipLimit: 6 },
  { id: "polishing", name: "Polishing", wipLimit: 7 },
  { id: "qc", name: "QC", wipLimit: 5 },
]

interface StageFilter {
  search: string
  dueDateSort: "oldest" | "newest"
  priority: string | null
  assignedTo: string | null
  showOverdue: boolean
  showUrgent: boolean
}

function ProductionPipelineCustomizer({ steps: initialSteps, removedSteps: initialRemovedSteps, onSave, onCancel, onUpdate }: { 
  steps: string[]; 
  removedSteps: string[];
  onSave: (steps: string[], removedStages: string[]) => void; 
  onCancel: () => void; 
  onUpdate?: (steps: string[], removedStages: string[]) => void;
}) {
  const [steps, setSteps] = React.useState(initialSteps);
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [newStep, setNewStep] = React.useState("");
  const [removedSteps, setRemovedSteps] = React.useState<string[]>(initialRemovedSteps);
  const [editingValue, setEditingValue] = React.useState("");

  // DnD sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  React.useEffect(() => {
    setSteps(initialSteps);
    setRemovedSteps(initialRemovedSteps);
  }, [initialSteps, initialRemovedSteps]);

  const handleEditStep = (index: number) => {
    setEditingIndex(index);
    setEditingValue(steps[index]);
  };

  const handleSaveEdit = (index: number) => {
    if (editingValue.trim()) {
      const updatedSteps = [...steps];
      updatedSteps[index] = editingValue.trim();
      setSteps(updatedSteps);
      setEditingIndex(null);
      setEditingValue("");
      if (onUpdate) onUpdate(updatedSteps, removedSteps);
    }
  };

  const handleRemoveStep = (index: number) => {
    const stepToRemove = steps[index];
    const updatedRemoved = [...removedSteps, stepToRemove];
    const updatedSteps = steps.filter((_, i) => i !== index);
    setRemovedSteps(updatedRemoved);
    setSteps(updatedSteps);
    if (onUpdate) onUpdate(updatedSteps, updatedRemoved);
  };

  const handleRestoreStep = (step: string) => {
    const updatedSteps = [...steps, step];
    const updatedRemoved = removedSteps.filter(s => s !== step);
    setSteps(updatedSteps);
    setRemovedSteps(updatedRemoved);
    if (onUpdate) onUpdate(updatedSteps, updatedRemoved);
  };

  const handleAddNewStep = () => {
    if (newStep.trim()) {
      const updatedSteps = [...steps, newStep.trim()];
      setSteps(updatedSteps);
      setNewStep("");
      if (onUpdate) onUpdate(updatedSteps, removedSteps);
    }
  };

  const moveStep = (fromIndex: number, toIndex: number) => {
    const updatedSteps = [...steps];
    const [removed] = updatedSteps.splice(fromIndex, 1);
    updatedSteps.splice(toIndex, 0, removed);
    setSteps(updatedSteps);
    if (onUpdate) onUpdate(updatedSteps, removedSteps);
  };

  // DnD handlers
  const handleDragStart = (event: any) => {
    // Optional: Add visual feedback during drag
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const activeIndex = parseInt(active.id.toString().replace('step-', ''));
      
      // If dropping on another step, use that step's index
      if (over.id.toString().startsWith('step-')) {
        const overIndex = parseInt(over.id.toString().replace('step-', ''));
        moveStep(activeIndex, overIndex);
      }
      // If dropping on the container, add to the end
      else if (over.id === 'steps-container') {
        moveStep(activeIndex, steps.length - 1);
      }
    }
  };

  // Droppable container for the steps list
  const DroppableContainer = ({ children }: { children: React.ReactNode }) => {
    const { setNodeRef } = useDroppable({
      id: 'steps-container',
    });

    return (
      <div ref={setNodeRef} className="max-h-64 overflow-y-auto pr-2">
        {children}
      </div>
    );
  };

  const DraggableStep = ({ step, index }: { step: string; index: number }) => {
    const [editingValue, setEditingValue] = React.useState(step);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Make the step draggable
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: `step-${index}`,
      data: { index, step }
    });

    // Make the step droppable
    const { setNodeRef: setDroppableRef, isOver } = useDroppable({
      id: `step-${index}`,
    });

    React.useEffect(() => {
      if (editingIndex === index && inputRef.current) {
        inputRef.current.focus();
      }
    }, [editingIndex, index]);

    const handleSave = () => {
      if (editingValue.trim()) {
        const updatedSteps = [...steps];
        updatedSteps[index] = editingValue.trim();
        setSteps(updatedSteps);
        setEditingIndex(null);
        setEditingValue("");
      } else {
        setEditingValue(step);
        setEditingIndex(null);
      }
    };

    const isCustomStage = !ALL_STAGES.map(s => s.name).includes(step);

    const style = transform ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      zIndex: isDragging ? 1000 : 'auto',
      opacity: isDragging ? 0.8 : 1,
    } : undefined;

    return (
      <div 
        ref={(node) => {
          setNodeRef(node);
          setDroppableRef(node);
        }}
        {...attributes}
        {...listeners}
        style={style}
        className={`w-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${isOver ? 'bg-blue-50 border-2 border-blue-300 rounded-md' : ''}`}
      >
        <div className="flex items-center gap-2 p-2 mb-2 bg-gray-100 rounded-md w-full hover:bg-gray-200 transition-colors">
          <GripVertical className="cursor-grab text-gray-500 hover:text-gray-700" />
          {editingIndex === index ? (
            <Input
              ref={inputRef}
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="flex-grow"
            />
          ) : (
            <div className="flex-grow flex items-center gap-2">
              <span>{step}</span>
              {isCustomStage && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                  Custom
                </Badge>
              )}
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => editingIndex === index ? handleSave() : handleEditStep(index)}
            className="h-8 w-8"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleRemoveStep(index)}
            className="h-8 w-8 text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-1">
      <div className="text-xs text-muted-foreground mb-2 text-center">
        Changes are applied in real-time • {steps.length} active stages
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToParentElement]}
      >
        <DroppableContainer>
          {steps.map((step, idx) => (
            <DraggableStep key={`step-${idx}-${step}`} step={step} index={idx} />
          ))}
        </DroppableContainer>
      </DndContext>

      {removedSteps.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Removed from dashboard:</h4>
          <div className="max-h-32 overflow-y-auto pr-2">
            {removedSteps.map((step, idx) => (
              <div key={`removed-${idx}-${step}`} className="flex items-center gap-2 p-2 mb-1 bg-gray-50 rounded-md w-full opacity-60">
                <span className="flex-grow text-gray-500">{step}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleRestoreStep(step)}
                  className="h-8 w-8 text-green-600 hover:text-green-800"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Input
          value={newStep}
          onChange={e => setNewStep(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAddNewStep()}
          placeholder="Add new pipeline step"
        />
        <Button onClick={handleAddNewStep}>Add</Button>
      </div>
      <Button className="mt-6 w-full" onClick={() => onSave(steps, removedSteps)}>
        Save Pipeline
      </Button>
      <Button variant="ghost" className="mt-2 w-full" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}

interface ProductionKanbanBoardProps {
  dateRange?: DateRange | undefined;
}

export function ProductionKanbanBoard({ dateRange }: ProductionKanbanBoardProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [workOrders, setWorkOrders] = React.useState<WorkOrder[]>([])
  const [filteredOrders, setFilteredOrders] = React.useState<WorkOrder[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterCraftsperson, setFilterCraftsperson] = React.useState<string | null>(null)
  const [filterDueDate, setFilterDueDate] = React.useState<string | null>(null)
  const [filterPriority, setFilterPriority] = React.useState<string | null>(null)
  const [showFilters, setShowFilters] = React.useState(false)
  const [sortOrder, setSortOrder] = React.useState<"oldest" | "newest">("oldest")
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null)
  const [selectedStage, setSelectedStage] = React.useState<string | null>(null)
  const [calendarDialogOpen, setCalendarDialogOpen] = React.useState(false)
  const [calendarFilter, setCalendarFilter] = React.useState<string>("all")
  const [calendarSearchQuery, setCalendarSearchQuery] = React.useState("")
  const [calendarCustomerFilter, setCalendarCustomerFilter] = React.useState<string>("all")
  const [calendarPriorityFilter, setCalendarPriorityFilter] = React.useState<string>("all")
  const [calendarAssigneeFilter, setCalendarAssigneeFilter] = React.useState<string>("all")
  const [calendarViewMode, setCalendarViewMode] = React.useState<"detailed" | "compact">("detailed")
  const [calendarSortBy, setCalendarSortBy] = React.useState<string>("dueDate")
  const [calendarQuickFilter, setCalendarQuickFilter] = React.useState<string>("all")
  const [showPipelineCustomizer, setShowPipelineCustomizer] = React.useState(false)
  const [visibleStageNames, setVisibleStageNames] = React.useState<string[]>(["Design", "CAD", "Casting", "Setting", "Polishing", "QC"])
  const [removedStages, setRemovedStages] = React.useState<string[]>([])
  const [stageNameMapping, setStageNameMapping] = React.useState<Record<string, string>>({})

  const [stageFilters, setStageFilters] = React.useState<Record<string, StageFilter>>(
    ALL_STAGES.reduce((acc, stage) => ({
      ...acc,
      [stage.id]: {
        search: "",
        dueDateSort: "oldest" as const,
        priority: null,
        assignedTo: null,
        showOverdue: false,
        showUrgent: false,
      }
    }), {})
  )

  const craftspeople = React.useMemo(() => {
    const uniqueCraftspeople = new Set<string>()
    workOrders.forEach((order) => {
      if (order.assignedTo) uniqueCraftspeople.add(order.assignedTo)
    })
    return Array.from(uniqueCraftspeople)
  }, [workOrders])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  const getProductionDataForDate = (date: Date) => {
    const stageData: Record<string, { count: number; orders: WorkOrder[]; capacity: number; isOverCapacity: boolean }> = {}
    
    ALL_STAGES.forEach(stage => {
      stageData[stage.id] = { 
        count: 0, 
        orders: [], 
        capacity: stage.wipLimit,
        isOverCapacity: false
      }
    })
    
    workOrders.forEach(order => {
      const orderDate = new Date(order.dueDate)
      const daysDiff = Math.ceil((orderDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff >= -7 && daysDiff <= 0) {
        const stage = order.currentStage
        if (stageData[stage]) {
          stageData[stage].count++
          stageData[stage].orders.push(order)
        }
      }
    })
    
    Object.keys(stageData).forEach(stageId => {
      const stage = ALL_STAGES.find(s => s.id === stageId)
      if (stage && stageData[stageId].count > stage.wipLimit) {
        stageData[stageId].isOverCapacity = true
      }
    })
    
    return stageData
  }

  const getStageColor = (stageId: string) => {
    const colors = {
      design: "bg-blue-100 text-blue-800",
      cad: "bg-purple-100 text-purple-800", 
      casting: "bg-orange-100 text-orange-800",
      setting: "bg-emerald-100 text-emerald-800",
      polishing: "bg-yellow-100 text-yellow-800",
      qc: "bg-red-100 text-red-800"
    }
    return colors[stageId as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1)
      } else {
        newMonth.setMonth(prev.getMonth() + 1)
      }
      return newMonth
    })
  }

  const handleStageClick = (date: Date, stageId: string) => {
    setSelectedDate(date)
    setSelectedStage(stageId)
    setCalendarDialogOpen(true)
  }

  const handleCalendarSearch = (query: string) => {
    setCalendarSearchQuery(query)
  }

  const handleCalendarFilterChange = (filterType: string, value: string) => {
    switch (filterType) {
      case 'customer':
        setCalendarCustomerFilter(value)
        break
      case 'priority':
        setCalendarPriorityFilter(value)
        break
      case 'assignee':
        setCalendarAssigneeFilter(value)
        break
      case 'view':
        setCalendarViewMode(value as "detailed" | "compact")
        break
      case 'sort':
        setCalendarSortBy(value)
        break
      case 'quick':
        setCalendarQuickFilter(value)
        break
    }
  }

  const handleCalendarViewToggle = (mode: "detailed" | "compact") => {
    setCalendarViewMode(mode)
  }

  const handleCalendarSort = (sortBy: string) => {
    setCalendarSortBy(sortBy)
  }

  const handleCalendarExport = () => {
    const data = {
      month: currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      stages: ALL_STAGES.map(stage => ({
        name: stage.name,
        data: getProductionDataForDate(currentMonth)[stage.id]
      })),
      filters: {
        customer: calendarCustomerFilter,
        priority: calendarPriorityFilter,
        assignee: calendarAssigneeFilter,
        view: calendarViewMode,
        sort: calendarSortBy,
        quick: calendarQuickFilter
      }
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `production-calendar-${currentMonth.getFullYear()}-${currentMonth.getMonth() + 1}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCalendarNotifyTeam = () => {
    const overdueStages = ALL_STAGES.filter(stage => {
      const data = getProductionDataForDate(currentMonth)[stage.id]
      return data.isOverCapacity
    })
    
    if (overdueStages.length > 0) {
      const message = `Production Alert: ${overdueStages.length} stage(s) are over capacity for ${currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
      console.log(message)
      // In a real app, this would send a notification to the team
    }
  }

  const handleOrderAction = (action: string, order: WorkOrder) => {
    switch (action) {
      case 'view':
        console.log('View order:', order.id)
        break
      case 'edit':
        console.log('Edit order:', order.id)
        break
      case 'message':
        console.log('Message customer for order:', order.id)
        break
      case 'duplicate':
        console.log('Duplicate order:', order.id)
        break
      case 'delete':
        console.log('Delete order:', order.id)
        break
    }
  }

  const getFilteredCalendarOrders = () => {
    let filtered = workOrders

    if (calendarSearchQuery) {
      filtered = filtered.filter(order => 
        order.customerName.toLowerCase().includes(calendarSearchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(calendarSearchQuery.toLowerCase())
      )
    }

    if (calendarCustomerFilter !== 'all') {
      filtered = filtered.filter(order => order.customerName === calendarCustomerFilter)
    }

    if (calendarPriorityFilter !== 'all') {
      filtered = filtered.filter(order => order.priority === calendarPriorityFilter)
    }

    if (calendarAssigneeFilter !== 'all') {
      filtered = filtered.filter(order => order.assignedTo === calendarAssigneeFilter)
    }

    if (calendarQuickFilter === 'overdue') {
      filtered = filtered.filter(order => new Date(order.dueDate) < new Date())
    } else if (calendarQuickFilter === 'urgent') {
      filtered = filtered.filter(order => order.priority === 'high')
    }

    switch (calendarSortBy) {
      case 'dueDate':
        filtered.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        break
      case 'priority':
        const priorityOrder = { high: 1, medium: 2, low: 3 }
        filtered.sort((a, b) => priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder])
        break
      case 'customer':
        filtered.sort((a, b) => a.customerName.localeCompare(b.customerName))
        break
    }

    return filtered
  }

  const getOrdersByStage = (stageId: string) => {
    let orders = workOrders.filter(order => order.currentStage === stageId)
    const stageFilter = stageFilters[stageId]
    
    if (stageFilter?.search) {
      orders = orders.filter(order => 
        order.customerName.toLowerCase().includes(stageFilter.search.toLowerCase()) ||
        order.id.toLowerCase().includes(stageFilter.search.toLowerCase())
      )
    }
    
    if (stageFilter?.showOverdue) {
      orders = orders.filter(order => new Date(order.dueDate) < new Date())
    }
    
    if (stageFilter?.showUrgent) {
      orders = orders.filter(order => order.priority === 'high')
    }
    
    if (stageFilter?.dueDateSort === 'newest') {
      orders.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
    } else {
      orders.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    }
    
    return orders
  }

  const isStageAtCapacity = (stage: ProductionStage) => {
    const orders = getOrdersByStage(stage.id)
    return orders.length >= stage.wipLimit
  }

  const isStageBottleneck = (stage: ProductionStage, index: number) => {
    const orders = getOrdersByStage(stage.id)
    const capacity = stage.wipLimit
    return orders.length > capacity * 0.8
  }

  const updateStageFilter = (stageId: string, updates: Partial<StageFilter>) => {
    setStageFilters(prev => ({
      ...prev,
      [stageId]: { ...prev[stageId], ...updates }
    }))
  }

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    
    if (active && over && active.id !== over.id) {
      const activeOrder = workOrders.find(order => order.id === active.id)
      const overColumn = over.id.toString().replace('column-', '')
      
      if (activeOrder && overColumn) {
        setWorkOrders(prev => prev.map(order => 
          order.id === active.id 
            ? { ...order, currentStage: overColumn }
            : order
        ))
      }
    }
    
    setActiveId(null)
  }

  const handleCalendarResetFilters = () => {
    setCalendarSearchQuery("")
    setCalendarCustomerFilter("all")
    setCalendarPriorityFilter("all")
    setCalendarAssigneeFilter("all")
    setCalendarViewMode("detailed")
    setCalendarSortBy("dueDate")
    setCalendarQuickFilter("all")
  }

  // Function to get the correct URL for a stage based on its ID
  const getStageUrl = (stageId: string) => {
    return `/dashboard/production/kanban/${stageId}`;
  };

  // Function to get the display name for a stage (custom or original)
  const getStageDisplayName = (stageName: string) => {
    // If the stage name has been customized, return the custom name
    const customName = stageNameMapping[stageName];
    if (customName) {
      return customName;
    }
    // Otherwise return the original name
    return stageName;
  };

  React.useEffect(() => {
    const orders = generateSampleWorkOrders(50)
    setWorkOrders(orders)
  }, [])

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('productionRemovedStages', JSON.stringify(removedStages));
    }
  }, [removedStages]);

  const stages = React.useMemo(() => {
    return visibleStageNames.map((name, idx) => {
      const found = ALL_STAGES.find(stage => stage.name === name);
      if (found) return found;
      return {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        wipLimit: 5,
      };
    });
  }, [visibleStageNames]);

  const activeOrder = workOrders.find(order => order.id === activeId)

  return (
    <div className="flex flex-col gap-4">
      {/* REMOVE the header, search, sort, and filter UI here */}
      <div className="relative">
        <ProductionPipeline visibleStages={visibleStageNames} dateRange={dateRange} />
        {/* Move the + button here, absolutely positioned bottom right */}
        <button
          className="absolute right-0 bottom-0 p-3 rounded-full bg-white/80 shadow transition flex items-center justify-center mr-4 mb-4 z-10 hover:bg-gradient-to-br hover:from-emerald-400 hover:to-emerald-600 hover:text-white"
          aria-label="Customize production pipeline"
          onClick={() => setShowPipelineCustomizer(true)}
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      <div className="relative">
        <Dialog open={showPipelineCustomizer} onOpenChange={setShowPipelineCustomizer}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Customize Production Pipeline</DialogTitle>
            </DialogHeader>
            <ProductionPipelineCustomizer
              steps={visibleStageNames}
              removedSteps={removedStages}
              onSave={(newStages, newRemovedStages) => {
                // Create mapping between original stage names and new custom names
                const newMapping: Record<string, string> = {};
                newStages.forEach((newName, index) => {
                  const originalName = ALL_STAGES[index]?.name;
                  if (originalName && originalName !== newName) {
                    newMapping[originalName] = newName;
                  }
                });
                
                setStageNameMapping(newMapping);
                setVisibleStageNames(newStages);
                setRemovedStages(newRemovedStages);
                setShowPipelineCustomizer(false);
              }}
              onUpdate={(newStages, newRemovedStages) => {
                // Real-time updates to dashboard
                const newMapping: Record<string, string> = {};
                newStages.forEach((newName, index) => {
                  const originalName = ALL_STAGES[index]?.name;
                  if (originalName && originalName !== newName) {
                    newMapping[originalName] = newName;
                  }
                });
                
                setStageNameMapping(newMapping);
                setVisibleStageNames(newStages);
                setRemovedStages(newRemovedStages);
              }}
              onCancel={() => setShowPipelineCustomizer(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {showFilters && (
        <div className="grid gap-4 p-4 border rounded-md bg-muted/20 sm:grid-cols-3">
          <Select value={filterCraftsperson || ""} onValueChange={(value) => setFilterCraftsperson(value === "all" ? null : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by craftsperson..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Craftspeople</SelectItem>
              {craftspeople.map((person) => (
                <SelectItem key={`filter-craftsperson-${person}`} value={person}>{person}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterDueDate || ""} onValueChange={(value) => setFilterDueDate(value === "all" ? null : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by due date..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Due Dates</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="thisWeek">This Week</SelectItem>
              <SelectItem value="nextWeek">Next Week</SelectItem>
              <SelectItem value="future">Future</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPriority || ""} onValueChange={(value) => setFilterPriority(value === "all" ? null : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by priority..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
          <TabsTrigger value="metrics">Production Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-xl font-semibold">
                    {currentMonth.toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </h2>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={calendarAssigneeFilter} onValueChange={value => setCalendarAssigneeFilter(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Assignees" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Assignees</SelectItem>
                      {craftspeople.map(person => (
                        <SelectItem key={`calendar-assignee-${person}`} value={person}>{person}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentMonth(new Date())}
                  >
                    Today
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}

                {getDaysInMonth(currentMonth).map((date, index) => (
                  <div
                    key={`calendar-day-${currentMonth.getFullYear()}-${currentMonth.getMonth()}-${index}`}
                    className={`min-h-[120px] p-2 border rounded-md ${
                      date ? 'bg-background hover:bg-muted/50' : 'bg-muted/20'
                    }`}
                  >
                    {date && (
                      <>
                        <div className="text-sm font-medium mb-2">
                          {date.getDate()}
                          {date.toDateString() === new Date().toDateString() && (
                            <span className="ml-1 text-primary">•</span>
                          )}
                        </div>

                        <div className="space-y-1">
                          {Object.entries(getProductionDataForDate(date))
                            .filter(([stageId, data]) => {
                              const stage = ALL_STAGES.find(s => s.id === stageId);
                              return data.count > 0 && stage && visibleStageNames.includes(stage.name);
                            })
                            .map(([stageId, data]) => {
                              const stage = ALL_STAGES.find(s => s.id === stageId)
                              if (!stage) {
                                // Custom stage: render as a colored pill
                                return (
                                  <div
                                    key={stageId}
                                    className={`flex items-center justify-between gap-2 px-3 py-1 rounded-full font-medium text-xs cursor-default ${getStageColor(stageId)}`}
                                    style={{ minWidth: 0 }}
                                  >
                                    <span className="truncate">{stageId}</span>
                                    <span className="ml-2 px-2 py-0.5 rounded bg-white/60 text-xs font-semibold">{data.count}</span>
                                  </div>
                                );
                              }
                              // Always use the original stageId for the URL
                              const stageUrl = getStageUrl(stageId);
                              return (
                                <Link
                                  key={stageId}
                                  href={stageUrl}
                                  className={`flex items-center justify-between gap-2 px-3 py-1 rounded-full font-medium text-xs cursor-pointer transition-colors hover:opacity-90 ${
                                    data.isOverCapacity
                                      ? 'bg-red-100 text-red-800 border border-red-300'
                                      : getStageColor(stageId)
                                  }`}
                                  style={{ minWidth: 0 }}
                                  title={`${stage?.name}: ${data.count} orders${data.isOverCapacity ? ' (OVER CAPACITY)' : ''}`}
                                >
                                  <span className="truncate">{getStageDisplayName(stage?.name || "")}</span>
                                  <span className="ml-2 px-2 py-0.5 rounded bg-white/60 text-xs font-semibold">{data.count}</span>
                                </Link>
                              )
                            })}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kanban">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToParentElement]}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-1">
              {stages.filter(stage => ALL_STAGES.some(s => s.id === stage.id)).map((stage, index) => {
                const stageOrders = getOrdersByStage(stage.id)
                const stageFilter = stageFilters[stage.id]
                return (
                  <div key={stage.id} className="flex flex-col gap-2">
                    <Card className="p-3">
                      <CardHeader className="p-0 pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          {getStageDisplayName(stage.name)} Filters
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 space-y-2">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder={`Search ${getStageDisplayName(stage.name)}...`}
                            value={stageFilter?.search || ""}
                            onChange={(e) => updateStageFilter(stage.id, { search: e.target.value })}
                            className="pl-8 h-8 text-xs"
                          />
                        </div>
                        
                        <Select 
                          value={stageFilter?.dueDateSort || "oldest"} 
                          onValueChange={(value) => updateStageFilter(stage.id, { dueDateSort: value as "oldest" | "newest" })}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                            <SelectItem value="newest">Newest First</SelectItem>
                          </SelectContent>
                        </Select>

                        <div className="flex gap-1">
                          <Button
                            variant={stageFilter?.showOverdue ? "default" : "outline"}
                            size="sm"
                            className="h-6 text-xs px-2"
                            onClick={() => updateStageFilter(stage.id, { showOverdue: !stageFilter?.showOverdue })}
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            Overdue
                          </Button>
                          <Button
                            variant={stageFilter?.showUrgent ? "default" : "outline"}
                            size="sm"
                            className="h-6 text-xs px-2"
                            onClick={() => updateStageFilter(stage.id, { showUrgent: !stageFilter?.showUrgent })}
                          >
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Urgent
                          </Button>
                        </div>

                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{stageOrders.length} items</span>
                          <span>{Math.round((stageOrders.length / stage.wipLimit) * 100)}% capacity</span>
                        </div>
                      </CardContent>
                    </Card>

                    <KanbanColumn
                      id={`column-${stage.id}`}
                      title={getStageDisplayName(stage.name)}
                      orders={stageOrders}
                      wipLimit={stage.wipLimit}
                      isBottleneck={isStageBottleneck(stage, index)}
                      sortOrder={stageFilter?.dueDateSort || "oldest"}
                    />
                  </div>
                )
              })}
            </div>

            <DragOverlay>
              {activeOrder ? <WorkOrderCard order={activeOrder} /> : null}
            </DragOverlay>
          </DndContext>
        </TabsContent>

        <TabsContent value="metrics">
          <ProductionMetrics workOrders={workOrders} stages={stages} />
        </TabsContent>
      </Tabs>
    </div>
  )
} 