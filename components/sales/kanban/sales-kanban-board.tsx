"use client"

import * as React from "react"
import { SegmentedCircularProgress } from "@/components/ui/segmented-circular-progress"
import { Badge } from "@/components/ui/badge"
import { Bell, Image, Send, ClipboardList, CheckCircle, ArrowRight, Phone, Calendar as CalendarIcon, RefreshCw, Filter, Settings, Pencil, Trash2, Plus, GripVertical } from "lucide-react"
import { mockQuotes } from "@/data/mock-quotes"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { DndContext, closestCorners, useSensor, useSensors, PointerSensor, DragOverlay, useDraggable, useDroppable } from "@dnd-kit/core"
import { restrictToParentElement } from "@dnd-kit/modifiers"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as UICalendar } from "@/components/ui/calendar"
// import { mockCalls } from "@/app/dashboard/call-log/page"
// import { mockCompletedDesigns } from "@/data/mock-designs"
import { orders as allOrders } from "@/components/orders/orders-table"
import { SalesCalendar } from "./SalesCalendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox";

const SALES_STAGES = [
  { key: "logCall", label: "Log Call", icon: Phone },
  { key: "designsstatus", label: "Designs Status", icon: Bell },
  { key: "quoteSent", label: "Quotes", icon: Send },
  { key: "clientResponse", label: "Client Response", icon: ClipboardList },
  { key: "approved", label: "Approved/Order Created", icon: ArrowRight },
]

function SalesPipelineCustomizer({ steps: initialSteps, removedSteps: initialRemovedSteps, onSave, onCancel, onUpdate }: { 
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

  // Update local state when props change
  React.useEffect(() => {
    setSteps(initialSteps);
    setRemovedSteps(initialRemovedSteps);
  }, [initialSteps, initialRemovedSteps]);

  // Real-time updates to parent component
  const onUpdateRef = React.useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  React.useEffect(() => {
    if (onUpdateRef.current) {
      onUpdateRef.current(steps, removedSteps);
    }
  }, [steps, removedSteps]);

  const handleEditStep = (index: number) => {
    setEditingIndex(index);
    setEditingValue(steps[index]);
  };

  const handleSaveEdit = (index: number) => {
    if (editingValue.trim()) {
      const updatedSteps = [...(steps || [])];
      updatedSteps[index] = editingValue.trim();
      setSteps(updatedSteps);
      setEditingIndex(null);
      setEditingValue("");
    }
  };

  const handleRemoveStep = (index: number) => {
    const stepToRemove = steps[index];
            setRemovedSteps([...(removedSteps || []), stepToRemove]);
            setSteps((steps || []).filter((_, i) => i !== index));
  };

  const handleRestoreStep = (step: string) => {
            setSteps([...(steps || []), step]);
            setRemovedSteps((removedSteps || []).filter(s => s !== step));
  };

  const handleAddNewStep = () => {
    if (newStep.trim()) {
              setSteps([...(steps || []), newStep.trim()]);
      setNewStep("");
    }
  };

  // Drag and drop functionality
  const moveStep = (fromIndex: number, toIndex: number) => {
    const updatedSteps = [...(steps || [])];
    const [removed] = updatedSteps.splice(fromIndex, 1);
    updatedSteps.splice(toIndex, 0, removed);
    setSteps(updatedSteps);
  };

  // Draggable step component with DndKit
  const DraggableStep = ({ step, index }: { step: string; index: number }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: `step-${index}`,
      data: { index, step }
    });
    const { setNodeRef: setDropRef, isOver } = useDroppable({
      id: `drop-${index}`,
      data: { index }
    });
    const [editingValue, setEditingValue] = React.useState(step);
    const inputRef = React.useRef<HTMLInputElement>(null);

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

    const style = transform ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
      <div 
        ref={(node) => {
          setNodeRef(node);
          setDropRef(node);
        }}
        style={style}
        className={`w-full ${isDragging ? 'opacity-50' : ''} ${isOver ? 'bg-blue-50 border-2 border-blue-200 rounded-md' : ''}`}
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center gap-2 p-2 mb-2 bg-gray-100 rounded-md w-full">
          <GripVertical className="cursor-move text-gray-500" />
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
      <div className="max-h-64 overflow-y-auto pr-2">
        {steps.map((step, idx) => (
          <DraggableStep key={`step-${idx}-${step}`} step={step} index={idx} />
        ))}
      </div>

      {/* Removed stages section */}
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

export function SalesKanbanBoard() {
  // Local state for drag-and-drop and filtering
  const [quotes, setQuotes] = React.useState(mockQuotes)
  const [quotesLoading, setQuotesLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null)
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [activePreset, setActivePreset] = React.useState("week")
  const [dateRange, setDateRange] = React.useState<{ from: Date; to: Date } | undefined>({
    from: (() => { const d = new Date(); d.setDate(d.getDate() - d.getDay()); return d })(),
    to: (() => { const d = new Date(); d.setDate(d.getDate() + (6 - d.getDay())); return d })(),
  })
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [showLogCallModal, setShowLogCallModal] = React.useState(false)
  const [showCustomizer, setShowCustomizer] = React.useState(false)
  const [pipelineStages, setPipelineStages] = React.useState(SALES_STAGES.map(s => s.label));
  const [visibleStages, setVisibleStages] = React.useState<string[]>(SALES_STAGES.map(s => s.label));
  const [removedStages, setRemovedStages] = React.useState<string[]>([]);
  const [callLogs, setCallLogs] = React.useState<any[]>([])
  const [callLogsLoading, setCallLogsLoading] = React.useState(true)
  const [lastUpdated, setLastUpdated] = React.useState<Date>(new Date())
  const [designs, setDesigns] = React.useState<any[]>([])
  const [designsLoading, setDesignsLoading] = React.useState(true)

  const [stageNameMapping, setStageNameMapping] = React.useState<Record<string, string>>({});

  // Update: Persist visibleStages and removedStages in localStorage (SSR-safe)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedVisible = localStorage.getItem("salesDashboardVisibleStages");
      const savedRemoved = localStorage.getItem("salesDashboardRemovedStages");
      if (savedVisible) {
        setVisibleStages(JSON.parse(savedVisible));
      } else {
        setVisibleStages(SALES_STAGES.map(s => s.label));
      }
      if (savedRemoved) {
        setRemovedStages(JSON.parse(savedRemoved));
      }
    }
  }, []);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("salesDashboardVisibleStages", JSON.stringify(visibleStages));
    }
  }, [visibleStages]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("salesDashboardRemovedStages", JSON.stringify(removedStages));
    }
  }, [removedStages]);

  // Fetch call logs data
  React.useEffect(() => {
    const fetchCallLogs = async () => {
      try {
        setCallLogsLoading(true);
        const response = await fetch('/api/call-log');
        const result = await response.json();
        
        if (result.success) {
          // Transform API data to match the expected format and filter out call logs sent to design
          const transformedLogs = result.data
            .filter((log: any) => {
              // Only include call logs that haven't been sent to design
              return !log.design_id && log.status !== 'design_created';
            })
            .map((log: any) => ({
              callNumber: log.call_number || `CL-${new Date(log.created_at).getFullYear()}-${String(log.id).padStart(4, '0')}`,
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
          setLastUpdated(new Date());
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

    // Initial fetch
    fetchCallLogs();

    // Set up polling to refresh data every 10 seconds
    const interval = setInterval(fetchCallLogs, 10000);

    return () => clearInterval(interval);
  }, []);

  // Fetch quotes data
  React.useEffect(() => {
    const fetchQuotes = async () => {
      try {
        setQuotesLoading(true);
        const response = await fetch('/api/quotes?limit=100');
        const result = await response.json();
        
        if (result.success) {
          // Transform API data to match the expected format
          const transformedQuotes = result.data.map((quote: any) => ({
            quoteNumber: quote.quote_number,
            customer: quote.customer?.full_name || `Customer ${quote.customer_id?.slice(0, 8)}...`,
            customerId: quote.customer_id,
            status: quote.status,
            stage: quote.stage || 'quoteSent',
            total: quote.total_amount || 0,
            validUntil: quote.valid_until || '',
            notes: quote.notes || '',
            created: quote.created_at || new Date().toISOString().split('T')[0],
            sent: quote.sent || quote.created_at || new Date().toISOString().split('T')[0],
            acceptedAt: quote.accepted_at,
            declinedAt: quote.declined_at,
            files: quote.files || [],
          }));
          setQuotes(transformedQuotes);
          console.log('📊 Sales dashboard quotes data:', {
            totalQuotes: result.data.length,
            sentQuotes: result.data.filter((q: any) => q.status === 'sent').length,
            allQuotes: result.data.map((q: any) => ({ quoteNumber: q.quote_number, status: q.status, customer: q.customer?.full_name }))
          });
        } else {
          console.error('Failed to fetch quotes:', result.error);
          setQuotes(mockQuotes); // Fallback to mock data
        }
      } catch (error) {
        console.error('Error fetching quotes:', error);
        setQuotes(mockQuotes); // Fallback to mock data
      } finally {
        setQuotesLoading(false);
      }
    };

    // Initial fetch
    fetchQuotes();

    // Set up polling to refresh data every 10 seconds
    const interval = setInterval(fetchQuotes, 10000);

    return () => clearInterval(interval);
  }, []);

  // Fetch designs data
  React.useEffect(() => {
    const fetchDesigns = async () => {
      try {
        setDesignsLoading(true);
        const response = await fetch('/api/designs');
        const result = await response.json();
        
        if (result.success) {
          console.log('Designs API response:', result.data);
          // Transform API data to match the expected format - use the correct field names
          const transformedDesigns = result.data.map((design: any) => ({
            designId: design.designId, // Use the correct field name from our API
            client: design.client_name,
            designer: design.designer,
            completedDate: design.created_date,
            approvalStatus: design.approval_status,
            designStatus: design.designStatus, // Use the correct field name from our API
            priority: design.priority,
            estimatedValue: design.estimated_value,
            materials: design.materials || [],
            complexity: design.complexity,
            nextAction: design.next_action,
            assignedTo: design.assigned_to,
            dueDate: design.due_date,
            files: design.files || [],
            notes: design.notes || '',
          }));
          console.log('Transformed designs:', transformedDesigns);
          setDesigns(transformedDesigns);
        } else {
          console.error('Failed to fetch designs:', result.error);
          setDesigns([]);
        }
      } catch (error) {
        console.error('Error fetching designs:', error);
        setDesigns([]);
      } finally {
        setDesignsLoading(false);
      }
    };

    // Initial fetch
    fetchDesigns();

    // Set up polling to refresh data every 10 seconds
    const interval = setInterval(fetchDesigns, 10000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  // Filtered and searched quotes
  const filteredQuotes = (quotes || []).filter(q => {
    const matchesSearch =
      q.quoteNumber?.toLowerCase().includes(search.toLowerCase()) ||
      q.customer?.toLowerCase().includes(search.toLowerCase()) ||
      q.notes?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter ? q.status === statusFilter : true
    return matchesSearch && matchesStatus
  })

  // Metrics
  const totalQuotes = filteredQuotes.length
  const overdueQuotes = filteredQuotes.filter(q => q.status === "overdue").length
  const delayedQuotes = filteredQuotes.filter(q => q.status === "delayed").length
  const onTrackQuotes = filteredQuotes.filter(q => q.status === "on-track").length

  // DnD handlers
  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }
  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      // Handle sales pipeline customizer drag and drop
      if (active.id.toString().startsWith('step-') && over.id.toString().startsWith('drop-')) {
        const fromIndex = parseInt(active.id.toString().replace('step-', ''));
        const toIndex = parseInt(over.id.toString().replace('drop-', ''));
        if (fromIndex !== toIndex) {
          const updatedSteps = [...(pipelineStages || [])];
          const [removed] = updatedSteps.splice(fromIndex, 1);
          updatedSteps.splice(toIndex, 0, removed);
          setPipelineStages(updatedSteps);
          setVisibleStages(updatedSteps);
        }
      } else {
        // Handle kanban board drag and drop
        const activeQuote = (quotes || []).find(q => q.quoteNumber === active.id)
        if (!activeQuote) return
        const newStage = over.id.replace("column-", "")
        setQuotes(prev =>
          (prev || []).map(q =>
            q.quoteNumber === active.id ? { ...q, stage: newStage } : q
          )
        )
      }
    }
    setActiveId(null)
  }

  // Map mockQuotes to stages for demo
  const getStageQuotes = (stageKey: string) => {
    switch (stageKey) {
      case "logCall":
        return mockQuotes.filter(q => q.stage === "logCall");
      case "designsstatus":
        return mockQuotes.filter(q => q.stage === "designsstatus");
      case "quoteSent":
        return mockQuotes.filter(q => q.stage === "quoteSent");
      case "clientResponse":
        return mockQuotes.filter(q => q.stage === "clientResponse");
      case "approved":
        return mockQuotes.filter(q => q.stage === "approved");
      default:
        return [];
    }
  }

  const handlePresetChange = (preset: string) => {
    setActivePreset(preset)
    let newRange: { from: Date; to: Date } | undefined
    const today = new Date()
    if (preset === "today") {
      newRange = { from: today, to: today }
    } else if (preset === "week") {
      const from = new Date(today)
      from.setDate(today.getDate() - today.getDay())
      const to = new Date(today)
      to.setDate(today.getDate() + (6 - today.getDay()))
      newRange = { from, to }
    } else if (preset === "month") {
      const from = new Date(today.getFullYear(), today.getMonth(), 1)
      const to = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      newRange = { from, to }
    } else {
      return
    }
    setDateRange(newRange)
  }
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Refresh call logs
      const callLogsResponse = await fetch('/api/call-log');
      const callLogsResult = await callLogsResponse.json();
      
      if (callLogsResult.success) {
        // Transform API data to match the expected format and filter out call logs sent to design
        const transformedLogs = callLogsResult.data
          .filter((log: any) => {
            // Only include call logs that haven't been sent to design
            return !log.design_id && log.status !== 'design_created';
          })
          .map((log: any) => ({
            callNumber: log.call_number || `CL-${new Date(log.created_at).getFullYear()}-${String(log.id).padStart(4, '0')}`,
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
        console.error('Failed to fetch call logs:', callLogsResult.error);
      }

      // Refresh quotes
      const quotesResponse = await fetch('/api/quotes?limit=100');
      const quotesResult = await quotesResponse.json();
      
      if (quotesResult.success) {
        // Transform API data to match the expected format
        const transformedQuotes = quotesResult.data.map((quote: any) => ({
          quoteNumber: quote.quote_number,
          customer: quote.customer?.full_name || `Customer ${quote.customer_id?.slice(0, 8)}...`,
          customerId: quote.customer_id,
          status: quote.status,
          stage: quote.stage || 'quoteSent',
          total: quote.total_amount || 0,
          validUntil: quote.valid_until || '',
          notes: quote.notes || '',
          created: quote.created_at || new Date().toISOString().split('T')[0],
          sent: quote.sent || quote.created_at || new Date().toISOString().split('T')[0],
          acceptedAt: quote.accepted_at,
          declinedAt: quote.declined_at,
          files: quote.files || [],
        }));
        setQuotes(transformedQuotes);
        console.log('🔄 Refresh - Sales dashboard quotes data:', {
          totalQuotes: quotesResult.data.length,
          sentQuotes: quotesResult.data.filter((q: any) => q.status === 'sent').length,
          allQuotes: quotesResult.data.map((q: any) => ({ quoteNumber: q.quote_number, status: q.status, customer: q.customer?.full_name }))
        });
      } else {
        console.error('Failed to fetch quotes:', quotesResult.error);
      }

      // Refresh designs
      const designsResponse = await fetch('/api/designs');
      const designsResult = await designsResponse.json();
      
      if (designsResult.success) {
        // Transform API data to match the expected format - use the correct field names
        const transformedDesigns = designsResult.data.map((design: any) => ({
          designId: design.designId, // Use the correct field name from our API
          client: design.client_name,
          designer: design.designer,
          completedDate: design.created_date,
          approvalStatus: design.approval_status,
          designStatus: design.designStatus, // Use the correct field name from our API
          priority: design.priority,
          estimatedValue: design.estimated_value,
          materials: design.materials || [],
          complexity: design.complexity,
          nextAction: design.next_action,
          assignedTo: design.assigned_to,
          dueDate: design.due_date,
          files: design.files || [],
          notes: design.notes || '',
        }));
        setDesigns(transformedDesigns);
        console.log('🔄 Refresh - Sales dashboard designs data:', {
          totalDesigns: designsResult.data.length,
          designStatuses: designsResult.data.map((d: any) => ({ id: d.designId, status: d.designStatus })),
          statusCounts: {
            'not-started': designsResult.data.filter((d: any) => d.designStatus === 'not-started').length,
            'in-progress': designsResult.data.filter((d: any) => d.designStatus === 'in-progress').length
          }
        });
      } else {
        console.error('Failed to fetch designs:', designsResult.error);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  // Status badge color map for all columns
  const statusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
      case "accepted":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "missed":
      case "declined":
        return "bg-red-50 text-red-700 border-red-200";
      case "follow-up":
      case "expired":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "in-progress":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "sent":
      case "order-created":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "not-started":
        return "bg-red-50 text-red-700 border-red-200";
      case "approved":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-gray-50 text-gray-500 border-gray-100";
    }
  };

  // Capitalize status for display
  const formatStatus = (status: string) =>
    status
      .split(/[-_ ]/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join('-');

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Pipeline Cards and rest of the board */}
      <div className="relative">
        <div className="flex gap-4 sm:gap-8 overflow-x-auto py-4 sm:py-8 px-2 md:px-0 justify-start sm:justify-center">
          {(visibleStages || []).map((stageLabel) => {
            // Find the corresponding SALES_STAGE data for this label
            // First try to find by exact label match, then by custom name mapping
            let stageData = SALES_STAGES.find(stage => stage.label === stageLabel);
            if (!stageData) {
              // If not found by exact match, try to find by custom name mapping
              const originalLabel = Object.keys(stageNameMapping).find(key => stageNameMapping[key] === stageLabel);
              if (originalLabel) {
                stageData = SALES_STAGES.find(stage => stage.label === originalLabel);
              }
            }
            if (!stageData) return null;
            
            const { key, label, icon: Icon } = stageData;
            let count = 0;
            let segments: { value: number; color: string }[] = [];
            let statusCounts: Record<string, number> = {};
            let onTrack = 0, delayed = 0, overdue = 0;
            if (key === "logCall") {
              // Filter out design_created calls to match the call-log page logic
              const activeLogs = callLogs.filter((c: any) => !c.design_id && c.status !== 'design_created');
              count = activeLogs.length;
              const statusColorMap: Record<string, string> = {
                "completed": "#22c55e",
                "missed": "#ef4444",
                "follow-up": "#eab308",
                "in-progress": "#3b82f6",
              };
              statusCounts = {
                "completed": activeLogs.filter((c: any) => c.status === "completed").length,
                "missed": activeLogs.filter((c: any) => c.status === "missed" && c.status !== "followup").length,
                "follow-up": activeLogs.filter((c: any) => c.status === "followup").length,
                "in-progress": activeLogs.filter((c: any) => c.status === "in-progress").length,
              };
              segments = Object.entries(statusCounts)
                .filter(([_, v]) => v > 0)
                .map(([k, v]) => ({ value: v, color: statusColorMap[k] }));
            } else if (key === "designsstatus") {
              // Filter out completed designs to match the designs status page logic
              const activeDesigns = designs.filter(d => d.designStatus !== 'completed');
              count = activeDesigns.length;
              console.log('Design status card calculation:', {
                totalDesigns: designs.length,
                activeDesigns: activeDesigns.length,
                designs: designs.map(d => ({ id: d.designId, status: d.designStatus }))
              });
              const statusColorMap: Record<string, string> = {
                "not-started": "#ef4444",
                "in-progress": "#3b82f6",
              };
              statusCounts = {
                "not-started": activeDesigns.filter(d => d.designStatus === "not-started").length,
                "in-progress": activeDesigns.filter(d => d.designStatus === "in-progress").length,
              };
              console.log('Design status counts:', statusCounts);
              segments = Object.entries(statusCounts)
                .filter(([_, v]) => v > 0)
                .map(([k, v]) => ({ value: v, color: statusColorMap[k] }));
            } else if (key === "quoteSent") {
              count = quotes.length; // Count all quotes, not just sent ones
              segments = count > 0 ? [{ value: count, color: "#3b82f6" }] : [];
              statusCounts = { total: count };
              console.log('🎯 Quote Sent card calculation (Total Quotes):', {
                totalQuotes: quotes.length,
                allQuotes: quotes.map(q => ({ quoteNumber: q.quoteNumber, status: q.status, customer: q.customer }))
              });
            } else if (key === "clientResponse") {
              const statusColorMap: Record<string, string> = {
                "accepted": "#22c55e",
                "declined": "#ef4444",
                "expired": "#eab308",
              };
              statusCounts = {
                "accepted": quotes.filter(q => q.status === "accepted").length,
                "declined": quotes.filter(q => q.status === "declined").length,
                "expired": quotes.filter(q => q.status === "expired").length,
              };
              count = Object.values(statusCounts).reduce((a, b) => a + b, 0);
              segments = Object.entries(statusCounts)
                .filter(([_, v]) => v > 0)
                .map(([k, v]) => ({ value: v, color: statusColorMap[k] }));
            } else if (key === "approved") {
              count = allOrders.length;
              segments = count > 0 ? [{ value: count, color: "#22c55e" }] : [];
              statusCounts = { orders: count };
            } else {
              const quotes = filteredQuotes.filter(q => q.stage === key)
              onTrack = quotes.filter(q => q.status === "on-track").length;
              delayed = quotes.filter(q => q.status === "delayed").length;
              overdue = quotes.filter(q => q.status === "overdue").length;
              count = quotes.length;
              segments = [
                onTrack > 0 ? { value: onTrack, color: "#22c55e" } : null,
                delayed > 0 ? { value: delayed, color: "#eab308" } : null,
                overdue > 0 ? { value: overdue, color: "#ef4444" } : null,
              ].filter((seg): seg is { value: number; color: string } => !!seg);
            }
            // Determine link for each stage
            let detailsLink = null;
            if (key === "logCall") detailsLink = "/dashboard/call-log";
            if (key === "designsstatus") detailsLink = "/dashboard/designs/status";
            if (key === "quoteSent") detailsLink = "/dashboard/quotes";
            if (key === "clientResponse") detailsLink = "/dashboard/quotes";
            if (key === "approved") detailsLink = "/dashboard/orders";

            const circleContent = (
              <div className="relative">
                <SegmentedCircularProgress
                  segments={segments.length > 0 ? segments : [{ value: 1, color: '#e5e7eb' }]}
                  size={120}
                  strokeWidth={10}
                  backgroundColor="#f3f4f6"
                  className="transition-transform duration-300 group-hover:scale-105"
                >
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <Icon className="h-7 w-7" />
                    <span className="text-xl font-bold">{count}</span>
                  </div>
                </SegmentedCircularProgress>
                {key === "logCall" && callLogsLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-full">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                  </div>
                )}
                {key === "designsstatus" && designsLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-full">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                  </div>
                )}
              </div>
            );

            return (
              <div key={`pipeline-card-${key}`} className="group relative flex flex-col items-center justify-center min-w-[200px] p-4 bg-white border-2 rounded-xl shadow-lg hover:shadow-xl transition-all border-emerald-200">
                {detailsLink ? (
                  <Link href={detailsLink} className="block">{circleContent}</Link>
                ) : (
                  circleContent
                )}
                <div className="mt-3 text-center">
                  <h3 className="font-medium text-base">{stageLabel}</h3>
                  {detailsLink ? (
                    <Link href={detailsLink} className="mt-1 flex items-center justify-center gap-1 text-xs text-emerald-700 font-semibold cursor-pointer hover:underline">
                      <span>View details</span>
                    </Link>
                  ) : (
                    <div className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground cursor-pointer">
                      <span>View details</span>
                    </div>
                  )}
                </div>
                <div className="mt-2 flex flex-row flex-wrap items-center justify-center gap-x-2 gap-y-0 w-full min-h-[32px]">
                  {key === "quoteSent" ? (
                    <>
                      {statusCounts["sent"] > 0 && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">{statusCounts["sent"]} Sent</Badge>
                      )}
                    </>
                  ) : key === "clientResponse" ? (
                    <>
                      {statusCounts["accepted"] > 0 && (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">{statusCounts["accepted"]} Accepted</Badge>
                      )}
                      {statusCounts["declined"] > 0 && (
                        <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">{statusCounts["declined"]} Declined</Badge>
                      )}
                      {statusCounts["expired"] > 0 && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">{statusCounts["expired"]} Expired</Badge>
                      )}
                    </>
                  ) : key === "logCall" ? (
                    <>
                      {statusCounts["completed"] > 0 && (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">{statusCounts["completed"]} Completed</Badge>
                      )}
                      {statusCounts["missed"] > 0 && (
                        <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">{statusCounts["missed"]} Missed</Badge>
                      )}
                      {statusCounts["follow-up"] > 0 && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">{statusCounts["follow-up"]} Follow-up</Badge>
                      )}
                      {statusCounts["in-progress"] > 0 && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">{statusCounts["in-progress"]} In Progress</Badge>
                      )}
                    </>
                  ) : key === "designsstatus" ? (
                    <>
                      {statusCounts["not-started"] > 0 && (
                        <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">{statusCounts["not-started"]} Not Started</Badge>
                      )}
                      {statusCounts["in-progress"] > 0 && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">{statusCounts["in-progress"]} In Progress</Badge>
                      )}
                    </>
                  ) : key === "approved" ? (
                    <>
                      {statusCounts["orders"] > 0 && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">{statusCounts["orders"]} Orders</Badge>
                      )}
                    </>
                  ) : (
                    <>
                      {onTrack > 0 && (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">{onTrack} On track</Badge>
                      )}
                      {delayed > 0 && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">{delayed} Delayed</Badge>
                      )}
                      {overdue > 0 && (
                        <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">{overdue} Overdue</Badge>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {/* Move the + button here, absolutely positioned bottom right */}
        <button
          className="absolute right-0 bottom-0 p-3 rounded-full bg-white/80 shadow transition flex items-center justify-center mr-4 mb-4 z-10 hover:bg-gradient-to-br hover:from-emerald-400 hover:to-emerald-600 hover:text-white"
          aria-label="Customize sales pipeline"
          onClick={() => setShowCustomizer(true)}
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {/* Customizer Modal */}
      <Dialog open={showCustomizer} onOpenChange={setShowCustomizer}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Customize Sales Pipeline</DialogTitle>
          </DialogHeader>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToParentElement]}
          >
            <SalesPipelineCustomizer
              steps={pipelineStages}
              removedSteps={removedStages}
              onSave={(newStages, newRemovedStages) => {
                // Create mapping between original labels and new custom names
                const newMapping: Record<string, string> = {};
                newStages.forEach((newName, index) => {
                  const originalLabel = SALES_STAGES[index]?.label;
                  if (originalLabel && originalLabel !== newName) {
                    newMapping[originalLabel] = newName;
                  }
                });
                
                setStageNameMapping(newMapping);
                setPipelineStages(newStages);
                setVisibleStages(newStages);
                setRemovedStages(newRemovedStages);
                setShowCustomizer(false);
              }}
              onUpdate={(newStages, newRemovedStages) => {
                // Real-time updates to dashboard
                const newMapping: Record<string, string> = {};
                newStages.forEach((newName, index) => {
                  const originalLabel = SALES_STAGES[index]?.label;
                  if (originalLabel && originalLabel !== newName) {
                    newMapping[originalLabel] = newName;
                  }
                });
                
                setStageNameMapping(newMapping);
                setPipelineStages(newStages);
                setVisibleStages(newStages);
                setRemovedStages(newRemovedStages);
              }}
              onCancel={() => setShowCustomizer(false)}
            />
          </DndContext>
        </DialogContent>
      </Dialog>

      {/* Sales Calendar */}
      <SalesCalendar />
      {/* Kanban Columns with DnD */}
              <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToParentElement]}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 p-2">
            {(visibleStages || []).map((stageLabel) => {
            // Find the corresponding SALES_STAGE data for this label
            // First try to find by exact label match, then by custom name mapping
            let stageData = SALES_STAGES.find(stage => stage.label === stageLabel);
            if (!stageData) {
              // If not found by exact match, try to find by custom name mapping
              const originalLabel = Object.keys(stageNameMapping).find(key => stageNameMapping[key] === stageLabel);
              if (originalLabel) {
                stageData = SALES_STAGES.find(stage => stage.label === originalLabel);
              }
            }
            if (!stageData) return null;
            
            const { key, label } = stageData;
            // Use the custom name if available, otherwise use the original label
            const displayLabel = stageNameMapping[label] || label;
            let items: any[] = [];
            let getTitle: (item: any) => string = (item) => '';
            let getSubtitle: (item: any) => string = (item) => '';
            let getStatus: (item: any) => string = (item) => '';
            let detailsLink: (item: any) => string = (item) => '#';
            if (key === "logCall") {
              items = callLogs;
              getTitle = (item) => item.callNumber;
              getSubtitle = (item) => item.customer;
              getStatus = (item) => item.status;
              detailsLink = (item) => `/dashboard/call-log/${item.callNumber}`;
            } else if (key === "designsstatus") {
              items = designs;
              getTitle = (item) => item.designId;
              getSubtitle = (item) => item.client;
              getStatus = (item) => item.designStatus;
              detailsLink = (item) => `/dashboard/designs/${item.designId}`;
            } else if (key === "quoteSent") {
              items = quotes.filter(q => q.status === "sent");
              getTitle = (item) => item.quoteNumber;
              getSubtitle = (item) => item.customer;
              getStatus = (item) => item.status;
              detailsLink = (item) => `/dashboard/quotes/${item.quoteNumber}`;
            } else if (key === "clientResponse") {
              items = quotes.filter(q => ["accepted", "declined", "expired"].includes(q.status));
              getTitle = (item) => item.quoteNumber;
              getSubtitle = (item) => item.customer;
              getStatus = (item) => item.status;
              detailsLink = (item) => `/dashboard/quotes/${item.quoteNumber}`;
            } else if (key === "approved") {
              items = allOrders;
              getTitle = (item) => item.id || item.orderNumber;
              getSubtitle = (item) => item.customer?.name || item.customerName || '';
              getStatus = (item) => item.status;
              detailsLink = (item) => `/dashboard/orders/${item.id}`;
            }
            return (
              <Card key={`kanban-column-${key}`} className="flex flex-col h-full min-h-[400px]" id={`column-${key}`}> 
                <CardHeader className="bg-emerald-50 border-b-2 border-emerald-200 rounded-t-xl">
                  <CardTitle className="text-lg font-semibold text-emerald-800">{displayLabel}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-3" style={{ maxHeight: 480 }}>
                  {(items || []).length === 0 ? (
                    <div className="text-center text-gray-400 py-8">No records in this stage.</div>
                  ) : (
                    (items || []).map((item: any, index: number) => (
                      <div
                        key={`${key}-${getTitle(item)}-${index}`}
                        className="mb-4 p-4 bg-white rounded-lg shadow border border-gray-100 flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-700">{getTitle(item)}</span>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${statusBadgeColor(getStatus(item))}`}>{formatStatus(getStatus(item))}</span>
                        </div>
                        <div className="text-sm text-gray-700">{getSubtitle(item)}</div>
                        <a href={detailsLink(item)} className="mt-2 px-3 py-1 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-700 transition text-center">View Details</a>
                      </div>
                    ))
                  )}
                  {(items || []).length > 3 && (
                    <div className="text-center text-xs text-gray-400">Scroll for more...</div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        <DragOverlay>
          {activeId ? (
            <div className="mb-4 p-4 bg-white rounded-lg shadow border border-gray-100 flex flex-col gap-2 cursor-move opacity-80">
              <span className="font-bold text-emerald-700">{activeId}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
} 