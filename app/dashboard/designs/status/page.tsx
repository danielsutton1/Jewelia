"use client";
import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle, Eye, MessageSquare, FileText, Send, Clock, Star, AlertCircle, Users, Calendar, DollarSign, Gem, Paperclip, ArrowRight, ArrowLeft, Plus, MoreHorizontal, Download, Printer, Upload, ChevronDown, ChevronUp, History } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as UICalendar } from "@/components/ui/calendar";
import { format, parseISO, isWithinInterval } from "date-fns";
import type { DateRange } from "react-day-picker";
import { addMockQuote, mockQuotes } from "@/data/mock-quotes";
import { mockCompletedDesigns, addCompletedDesign } from "@/data/mock-designs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

import type { CompletedDesign } from "@/data/mock-designs";

const designers = ["All Designers", "Sarah Johnson", "David Chen", "Alex Rodriguez"];
const approvalStatuses = ["All Statuses", "pending", "approved", "revision-requested"];
const designStatuses = ["All Statuses", "not-started", "in-progress"];
const priorities = ["All Priorities", "low", "medium", "high", "urgent"];

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
        <Button variant="outline" size="sm" className="flex items-center gap-1 luxury-date-btn min-w-[170px]" aria-label="Filter by completed date">
          <Calendar className="h-4 w-4 text-purple-600" />
          {dateRange?.from && dateRange?.to ? `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}` : "Completed Date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[520px] p-4 rounded-2xl shadow-2xl bg-white border-purple-100" align="end">
        <div className="mb-3 font-semibold text-purple-900 text-lg">Filter by Completed Date</div>
        <div className="flex flex-wrap gap-2 mb-4">
          {presets.map((preset) => (
            <Button key={preset.label} size="sm" variant="secondary" className="rounded-full border border-purple-200 text-purple-800 bg-purple-50 hover:bg-purple-100 transition" onClick={() => { setDateRange(preset.range); setOpen(false); }}>
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
        <Button variant="ghost" size="sm" className="w-full mt-4 text-purple-700 hover:bg-purple-50" onClick={() => { setDateRange(undefined); setInternalRange(undefined); setOpen(false); }}>
          Clear Date Filter
        </Button>
      </PopoverContent>
    </Popover>
  );
}

export default function DesignsStatusPage() {
  const router = useRouter();
  const cadFileInputRef = useRef<HTMLInputElement>(null);
  const renderingFileInputRef = useRef<HTMLInputElement>(null);
  const [designer, setDesigner] = useState("All Designers");
  const [approvalStatus, setApprovalStatus] = useState("All Statuses");
  const [designStatus, setDesignStatus] = useState("All Statuses");
  const [priority, setPriority] = useState("All Priorities");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [designs, setDesigns] = useState<CompletedDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSendQuoteModal, setShowSendQuoteModal] = useState<{ open: boolean; design?: CompletedDesign }>({ open: false });
  const [showUploadDesignModal, setShowUploadDesignModal] = useState<{ open: boolean; design?: CompletedDesign }>({ open: false });
  const [quoteMessage, setQuoteMessage] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [exporting, setExporting] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cadFiles, setCadFiles] = useState<File[]>([]);
  const [renderingFiles, setRenderingFiles] = useState<File[]>([]);
  const [sortField, setSortField] = useState<string>("completedDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Fetch designs from API
  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching designs from API...');
        
        const response = await fetch('/api/designs');
        const result = await response.json();
        
        if (result.success) {
          console.log(`✅ Successfully fetched ${result.data.length} designs from API`);
          console.log('📊 Raw API data sample:', result.data[0]);
          
          // Transform API data to match the CompletedDesign interface
          const transformedDesigns = result.data.map((design: any) => ({
            designId: design.design_id,
            client: design.client_name,
            designer: design.designer,
            completedDate: design.created_date,
            approvalStatus: design.approval_status,
            designStatus: design.design_status || design.quote_status || 'not-started',
            priority: design.priority,
            budget: design.estimated_value || 0,
            materials: design.materials || [],
            complexity: design.complexity,
            clientFeedback: design.client_feedback,
            revisionNotes: design.revision_notes,
            nextAction: design.next_action,
            assignedTo: design.assigned_to,
            dueDate: design.due_date,
            files: design.files || [],
            notes: design.notes
          }));
          console.log('🔄 Transformed design sample:', transformedDesigns[0]);
          console.log('📊 Files data sample:', transformedDesigns[0]?.files);
          console.log('📊 All transformed designs statuses:', transformedDesigns.map((d: any) => ({ id: d.designId, status: d.designStatus })));
          setDesigns(transformedDesigns);
        } else {
          console.error('❌ Failed to fetch designs:', result.error);
          // Fallback to mock data if API fails
          setDesigns(mockCompletedDesigns);
        }
      } catch (error) {
        console.error('❌ Error fetching designs:', error);
        // Fallback to mock data
        setDesigns(mockCompletedDesigns);
      } finally {
        setLoading(false);
      }
    };

    fetchDesigns();
  }, []);

  // Refresh data when user returns to the page
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Page focused, refreshing designs data...');
      refreshDesigns(false);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing designs data...');
      refreshDesigns(false);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Function to refresh designs data
  const refreshDesigns = async (showToast = true) => {
    try {
      setRefreshing(true);
      console.log('🔄 Refreshing designs data...');
      
      const response = await fetch('/api/designs');
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Successfully refreshed ${result.data.length} designs`);
        console.log('📊 Raw API data sample (refresh):', result.data[0]);
        console.log('📊 Files data sample (refresh):', result.data[0]?.files);
        
        // Transform API data to match the CompletedDesign interface
        const transformedDesigns = result.data.map((design: any) => ({
          designId: design.design_id,
          client: design.client_name,
          designer: design.designer,
          completedDate: design.created_date,
          approvalStatus: design.approval_status,
          designStatus: design.design_status || design.quote_status || 'not-started',
          priority: design.priority,
          budget: design.estimated_value || 0,
          materials: design.materials || [],
          complexity: design.complexity,
          clientFeedback: design.client_feedback,
          revisionNotes: design.revision_notes,
          nextAction: design.next_action,
          assignedTo: design.assigned_to,
          dueDate: design.due_date,
          files: design.files || [],
          notes: design.notes
                  }));
          console.log('🔄 Transformed design sample (refresh):', transformedDesigns[0]);
          console.log('📊 All transformed designs statuses (refresh):', transformedDesigns.map((d: any) => ({ id: d.designId, status: d.designStatus })));
          setDesigns(transformedDesigns);
          if (showToast) {
            toast.success('Designs data refreshed successfully');
          }
      } else {
        console.error('❌ Failed to refresh designs:', result.error);
        if (showToast) {
          toast.error('Failed to refresh designs data');
        }
      }
    } catch (error) {
      console.error('❌ Error refreshing designs:', error);
      if (showToast) {
        toast.error('Failed to refresh designs data');
      }
    } finally {
      setRefreshing(false);
    }
  };

  // Function to update design status in Supabase
  const updateDesignStatus = async (designId: string, newStatus: string) => {
    try {
      console.log(`🔄 Updating design ${designId} status to: ${newStatus}`);
      
      const response = await fetch('/api/designs', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          designId,
          updates: { quote_status: newStatus }
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Successfully updated design ${designId} status to: ${newStatus}`);
        toast.success(`Design status updated to ${newStatus.replace('-', ' ')}`);
        // The local state is already updated for responsive UI
        // The database update was successful
      } else {
        console.error('❌ Failed to update design status:', result.error);
        toast.error(`Failed to update design status: ${result.error}`);
        // Revert the local state change since the database update failed
        // We need to get the original status from the previous state
        setDesigns(prev => {
          const originalDesign = prev.find(d => d.designId === designId);
          const originalStatus = originalDesign ? originalDesign.designStatus : 'not-started';
          return prev.map(design =>
            design.designId === designId ? { ...design, designStatus: originalStatus } : design
          );
        });
      }
    } catch (error) {
      console.error('❌ Error updating design status:', error);
      toast.error('Failed to update design status. Please try again.');
      // Revert the local state change since the update failed
      setDesigns(prev => {
        const originalDesign = prev.find(d => d.designId === designId);
        const originalStatus = originalDesign ? originalDesign.designStatus : 'not-started';
        return prev.map(design =>
          design.designId === designId ? { ...design, designStatus: originalStatus } : design
        );
      });
    }
  };

  // Function to update design priority in Supabase
  const updateDesignPriority = async (designId: string, newPriority: string) => {
    try {
      console.log(`🔄 Updating design ${designId} priority to: ${newPriority}`);
      
      const response = await fetch('/api/designs', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          designId,
          updates: { priority: newPriority }
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Successfully updated design ${designId} priority to: ${newPriority}`);
        toast.success(`Design priority updated to ${newPriority}`);
        // The local state is already updated for responsive UI
        // The database update was successful
      } else {
        console.error('❌ Failed to update design priority:', result.error);
        toast.error(`Failed to update design priority: ${result.error}`);
        // Revert the local state change since the database update failed
        setDesigns(prev => prev.map(design =>
          design.designId === designId ? { ...design, priority: design.priority } : design
        ));
      }
    } catch (error) {
      console.error('❌ Error updating design priority:', error);
      toast.error('Failed to update design priority. Please try again.');
      // Revert the local state change since the update failed
      setDesigns(prev => prev.map(design =>
        design.designId === designId ? { ...design, priority: design.priority } : design
      ));
    }
  };

  const filteredDesigns = designs.filter(d =>
    // Only show designs that are not completed (not-started or in-progress)
    d.designStatus !== 'completed' &&
    (designer === "All Designers" || d.designer === designer) &&
    (approvalStatus === "All Statuses" || d.approvalStatus === approvalStatus) &&
    (designStatus === "All Statuses" || d.designStatus === designStatus) &&
    (priority === "All Priorities" || d.priority === priority) &&
    (searchTerm === "" || 
     d.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
     d.designId.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!dateRange?.from || !dateRange?.to || isWithinInterval(parseISO(d.completedDate), { start: dateRange.from, end: dateRange.to }))
  ).sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (sortField) {
      case "designId":
        aValue = a.designId;
        bValue = b.designId;
        break;
      case "client":
        aValue = a.client;
        bValue = b.client;
        break;
      case "designer":
        aValue = a.designer;
        bValue = b.designer;
        break;
      case "completedDate":
        aValue = new Date(a.completedDate);
        bValue = new Date(b.completedDate);
        break;
      case "designStatus":
        aValue = a.designStatus;
        bValue = b.designStatus;
        break;
      case "priority":
        aValue = a.priority;
        bValue = b.priority;
        break;
              case "budget":
          aValue = a.budget;
          bValue = b.budget;
        break;
      case "notes":
        aValue = a.notes;
        bValue = b.notes;
        break;
      default:
        aValue = new Date(a.completedDate);
        bValue = new Date(b.completedDate);
    }
    
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const getStatusColor = (status: string, type: 'approval' | 'design') => {
    if (type === 'approval') {
      switch (status) {
        case 'approved': return 'bg-green-100 text-green-800';
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'revision-requested': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    } else {
      switch (status) {
        case 'completed': return 'bg-green-100 text-green-800';
        case 'in-progress': return 'bg-yellow-100 text-yellow-800';
        case 'not-started': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getComplexityIcon = (complexity: string) => {
    switch (complexity) {
      case 'expert': return <Star className="w-4 h-4 text-purple-600" />;
      case 'complex': return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case 'moderate': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'simple': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ChevronDown className="w-3 h-3 ml-1 opacity-50" />;
    }
    return sortDirection === "asc" ? 
      <ChevronUp className="w-3 h-3 ml-1" /> : 
      <ChevronDown className="w-3 h-3 ml-1" />;
  };

  const handleAction = (design: CompletedDesign, action: string) => {
    console.log(`🎯 Action ${action} for design ${design.designId}`);
    console.log('🎯 Full design object:', design);
    console.log('🎯 Design client:', design.client);
    console.log('🎯 Design budget:', design.budget);
    
    switch (action) {
      case 'view-design':
        router.push(`/dashboard/designs/${design.designId}`);
        break;
      case 'send-quote':
        openSendQuoteModal(design);
        break;
      case 'contact-assignee':
        // Handle contact assignee action
        console.log('Contact assignee action');
        break;
      case 'upload-design':
        setCadFiles([]);
        setRenderingFiles([]);
        setShowUploadDesignModal({ open: true, design });
        break;
      case 'convert-to-quote':
        console.log('🎯 Calling handleConvertToQuote with design:', design);
        handleConvertToQuote(design);
        break;
      default:
        console.log(`Unknown action: ${action}`);
    }
  };

  const openSendQuoteModal = (design: CompletedDesign) => {
    setQuoteMessage(`Dear ${design.client},\n\nWe are excited to share your custom design is ready for review! Please find the details and let us know if you have any questions or would like to proceed.\n\nBest regards,\nJewelia Team`);
    setAttachment(null);
    setShowSendQuoteModal({ open: true, design });
  };

  const handleRegenerateAI = () => {
    if (aiLoading || !showSendQuoteModal.design) return;
    setAiLoading(true);
    setTimeout(() => {
      setQuoteMessage(`Dear ${showSendQuoteModal.design?.client},\n\nYour custom design is now complete! We look forward to your feedback and are here to assist with any questions.\n\nWarm regards,\nJewelia Team\n\n[AI Regenerated at ${new Date().toLocaleTimeString()}]`);
      setAiLoading(false);
    }, 1200);
  };

  const handleConfirmDesign = () => {
    if (!showSendQuoteModal.design) return;
    // Generate a new quote number
    const nextQuoteNumber = `Q-2024-${(Math.max(0, ...mockCompletedDesigns.map(q => parseInt(q.designId.split('-')[2] || '0'))) + 1).toString().padStart(3, '0')}`;
    const design = showSendQuoteModal.design;
    const quote = {
      quoteNumber: nextQuoteNumber,
      customer: design.client,
      customerId: design.client.replace(/\s+/g, '-').toUpperCase(),
      created: design.completedDate,
      assignee: design.designer,
      status: 'sent',
              total: design.budget,
      validUntil: design.dueDate || '',
      sent: design.completedDate,
      convertedToOrder: false,
      files: Array.isArray(design.files) ? design.files : [],
      notes: design.notes || '',
    };
    addMockQuote(quote);
    setShowSendQuoteModal({ open: false });
    alert('Design confirmed and quote created!');
  };

  function handleExport(type: 'csv' | 'pdf') {
    setExporting(true);
    // Implementation for export functionality
    setTimeout(() => setExporting(false), 2000);
  }

  function handlePrint() {
    setPrinting(true);
    // Implementation for print functionality
    setTimeout(() => setPrinting(false), 2000);
  }

  const handleCadFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      // Validate file types
      const validTypes = ['.dwg', '.dxf', '.step', '.stl', '.3ds', '.obj'];
      const invalidFiles = files.filter(file => {
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        return !validTypes.includes(extension);
      });
      
      if (invalidFiles.length > 0) {
        alert(`Invalid file type(s): ${invalidFiles.map(f => f.name).join(', ')}\n\nPlease select only CAD files (.dwg, .dxf, .step, .stl, .3ds, .obj)`);
        return;
      }
      
      setCadFiles(prev => [...prev, ...files]);
      console.log(`Added ${files.length} CAD file(s):`, files.map(f => f.name));
      
      // Show success feedback
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      toast.textContent = `Added ${files.length} CAD file(s)`;
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
    }
    // Reset the input value to allow selecting the same file again
    event.target.value = '';
  };

  const handleRenderingFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      // Validate file types
      const validTypes = ['.jpg', '.jpeg', '.png', '.pdf', '.tiff', '.bmp'];
      const invalidFiles = files.filter(file => {
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        return !validTypes.includes(extension);
      });
      
      if (invalidFiles.length > 0) {
        alert(`Invalid file type(s): ${invalidFiles.map(f => f.name).join(', ')}\n\nPlease select only rendering files (.jpg, .jpeg, .png, .pdf, .tiff, .bmp)`);
        return;
      }
      
      setRenderingFiles(prev => [...prev, ...files]);
      console.log(`Added ${files.length} rendering file(s):`, files.map(f => f.name));
      
      // Show success feedback
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      toast.textContent = `Added ${files.length} rendering file(s)`;
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
    }
    // Reset the input value to allow selecting the same file again
    event.target.value = '';
  };

  const removeCadFile = (index: number) => {
    setCadFiles(prev => {
      const removedFile = prev[index];
      console.log(`Removed CAD file: ${removedFile.name}`);
      
      // Show removal feedback
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      toast.textContent = `Removed: ${removedFile.name}`;
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 2000);
      
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeRenderingFile = (index: number) => {
    setRenderingFiles(prev => {
      const removedFile = prev[index];
      console.log(`Removed rendering file: ${removedFile.name}`);
      
      // Show removal feedback
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      toast.textContent = `Removed: ${removedFile.name}`;
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 2000);
      
      return prev.filter((_, i) => i !== index);
    });
  };

  const clearAllFiles = () => {
    const totalFiles = cadFiles.length + renderingFiles.length;
    setCadFiles([]);
    setRenderingFiles([]);
    console.log('All files cleared');
    
    // Show clear feedback
    if (totalFiles > 0) {
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      toast.textContent = `Cleared ${totalFiles} file(s)`;
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 2000);
    }
  };

  const handleModalClose = () => {
    setShowUploadDesignModal({ open: false });
    clearAllFiles();
  };

  const handleCadFileButtonClick = () => {
    cadFileInputRef.current?.click();
  };

  const handleRenderingFileButtonClick = () => {
    renderingFileInputRef.current?.click();
  };

  // Drag and drop handlers for CAD files
  const handleCadDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-emerald-400', 'bg-emerald-50/50');
  };

  const handleCadDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-emerald-400', 'bg-emerald-50/50');
  };

  const handleCadDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-emerald-400', 'bg-emerald-50/50');
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      // Validate file types
      const validTypes = ['.dwg', '.dxf', '.step', '.stl', '.3ds', '.obj'];
      const invalidFiles = files.filter(file => {
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        return !validTypes.includes(extension);
      });
      
      if (invalidFiles.length > 0) {
        alert(`Invalid file type(s): ${invalidFiles.map(f => f.name).join(', ')}\n\nPlease select only CAD files (.dwg, .dxf, .step, .stl, .3ds, .obj)`);
        return;
      }
      
      setCadFiles(prev => [...prev, ...files]);
      console.log(`Dropped ${files.length} CAD file(s):`, files.map(f => f.name));
      
      // Show success feedback
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      toast.textContent = `Added ${files.length} CAD file(s)`;
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
    }
  };

  // Drag and drop handlers for rendering files
  const handleRenderingDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-emerald-400', 'bg-emerald-50/50');
  };

  const handleRenderingDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-emerald-400', 'bg-emerald-50/50');
  };

  const handleRenderingDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-emerald-400', 'bg-emerald-50/50');
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      // Validate file types
      const validTypes = ['.jpg', '.jpeg', '.png', '.pdf', '.tiff', '.bmp'];
      const invalidFiles = files.filter(file => {
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        return !validTypes.includes(extension);
      });
      
      if (invalidFiles.length > 0) {
        alert(`Invalid file type(s): ${invalidFiles.map(f => f.name).join(', ')}\n\nPlease select only rendering files (.jpg, .jpeg, .png, .pdf, .tiff, .bmp)`);
        return;
      }
      
      setRenderingFiles(prev => [...prev, ...files]);
      console.log(`Dropped ${files.length} rendering file(s):`, files.map(f => f.name));
      
      // Show success feedback
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      toast.textContent = `Added ${files.length} rendering file(s)`;
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
    }
  };

  // Add a global test function for debugging
  if (typeof window !== 'undefined') {
    (window as any).testConvertToQuote = async () => {
      console.log('🧪 Testing convert to quote function...');
      const testDesign = {
        designId: "DS-2025-TEST",
        client: "Test Client",
        designer: "Daniel Sutton",
        completedDate: new Date().toISOString().split('T')[0],
        approvalStatus: "pending" as const,
        designStatus: "not-started" as const,
        priority: "medium" as const,
        budget: 5000,
        materials: [],
        complexity: "moderate" as const,
        nextAction: "Test",
        files: [],
        notes: "Test design"
      };
      await handleConvertToQuote(testDesign);
    };
  }

  const handleConvertToQuote = async (design: CompletedDesign) => {
    console.log('🚀 handleConvertToQuote called for design:', design);
    console.log('🚀 Design ID:', design.designId);
    console.log('🚀 Design client:', design.client);
    console.log('🚀 Design budget:', design.budget);
    
    try {
      // Generate a new quote number
      const currentYear = new Date().getFullYear();
      let nextQuoteNumber: string;
      
      // Get all existing quotes from the API to ensure we don't have conflicts
      try {
        const quotesResponse = await fetch('/api/quotes');
        const quotesResult = await quotesResponse.json();
        const existingQuotes = quotesResult.data || [];
        
        // Find the highest quote number for the current year
        const currentYearQuotes = existingQuotes.filter((q: any) => q.quote_number && q.quote_number.startsWith(`Q-${currentYear}-`));
        let maxNumber = 0;
        
        currentYearQuotes.forEach((q: any) => {
          const match = q.quote_number.match(new RegExp(`Q-${currentYear}-(\\d+)`));
          if (match) {
            const number = parseInt(match[1], 10);
            if (number > maxNumber) {
              maxNumber = number;
            }
          }
        });
        
        const nextNumber = maxNumber + 1;
        nextQuoteNumber = `Q-${currentYear}-${String(nextNumber).padStart(3, '0')}`;
        console.log('🔢 Generated quote number:', nextQuoteNumber);
        console.log('🔢 Found', currentYearQuotes.length, 'existing quotes for', currentYear);
        console.log('🔢 Max number found:', maxNumber);
      } catch (error) {
        console.warn('⚠️ Failed to get existing quotes for number generation:', error);
        // Fallback: use timestamp-based number
        const timestamp = Date.now();
        nextQuoteNumber = `Q-${currentYear}-${String(timestamp % 1000).padStart(3, '0')}`;
        console.log('🔢 Generated fallback quote number:', nextQuoteNumber);
      }
      
      // Create quote data
      const quote = {
        quoteNumber: nextQuoteNumber,
        customer: design.client,
        customerId: design.client.replace(/\s+/g, '-').toUpperCase(),
        created: new Date().toISOString().split('T')[0],
        assignee: design.designer,
        status: 'draft',
        total: design.budget || 0,
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        sent: 'N/A',
        convertedToOrder: false,
        files: Array.isArray(design.files) ? design.files : [],
        notes: design.notes || `Converted from design ${design.designId}`,
        item: `${design.client} Design`,
        client: design.client,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        stage: 'draft',
      };
      
      console.log('📝 Quote data to be sent:', quote);
      
      // Create quote via API
      try {
        console.log('🔄 Creating quote via API...');
        const requestBody = {
          quote_number: quote.quoteNumber,
          customer_name: quote.customer,
          customer_id: null,
          total_amount: quote.total,
          budget: design.budget || 0, // Original budget from call log - this should not change
          status: quote.status,
          description: quote.item,
          valid_until: quote.validUntil,
          notes: quote.notes,
          assignee: quote.assignee
        };
        
        console.log('📡 API request body:', requestBody);
        
        const quoteResponse = await fetch('/api/quotes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        console.log('📡 API response status:', quoteResponse.status);

        if (!quoteResponse.ok) {
          const errorText = await quoteResponse.text();
          console.error('❌ Quote API error response:', errorText);
          throw new Error(`Quote API failed with status ${quoteResponse.status}: ${errorText}`);
        }

        const quoteResult = await quoteResponse.json();
        console.log('📡 API response:', quoteResult);
        
        if (quoteResult.success) {
          console.log('✅ Quote created successfully via API:', quoteResult.data);
          toast.success(`Quote ${nextQuoteNumber} created successfully!`);
          
          // Navigate to quotes page
          setTimeout(() => {
            router.push('/dashboard/quotes');
          }, 1000);
        } else {
          console.warn('⚠️ Quote creation failed:', quoteResult.error || 'Unknown error');
          // Fallback to mock data
          addMockQuote(quote);
          toast.success(`Quote ${nextQuoteNumber} created (fallback mode)!`);
          
          // Navigate to quotes page
          setTimeout(() => {
            router.push('/dashboard/quotes');
          }, 1000);
        }
      } catch (quoteError) {
        console.warn('⚠️ Quote creation failed with exception:', quoteError);
        // Fallback to mock data
        addMockQuote(quote);
        toast.success(`Quote ${nextQuoteNumber} created (fallback mode)!`);
        
        // Navigate to quotes page
        setTimeout(() => {
          router.push('/dashboard/quotes');
        }, 1000);
      }
      
    } catch (error) {
      console.error('❌ Error converting design to quote:', error);
      toast.error(`Failed to convert design to quote: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUploadDesign = async () => {
    console.log('🚀 handleUploadDesign called!');
    console.log('📋 Modal state:', showUploadDesignModal);
    console.log('📁 CAD files:', cadFiles);
    console.log('📁 Rendering files:', renderingFiles);
    
    if (!showUploadDesignModal.design) {
      console.log('❌ No design in modal');
      return;
    }
    
    // Allow upload without files for testing purposes
    if (cadFiles.length === 0 && renderingFiles.length === 0) {
      console.log('⚠️ No files uploaded, but allowing upload for testing');
      // Don't return, continue with the upload process
    }

    console.log('✅ Starting upload process...');
    console.log('🔍 Available designs in state:', designs.map(d => ({ id: d.designId, client: d.client, status: d.designStatus })));
    setUploading(true);
    
    try {
      console.log('🔄 Starting design upload process...');
      console.log('📊 Design being uploaded:', showUploadDesignModal.design);
      console.log('📁 CAD files:', cadFiles.length);
      console.log('📁 Rendering files:', renderingFiles.length);
      
      // Remove the 2-second delay - it was causing the function to appear stuck
      console.log('⏭️ Skipping delay, proceeding with upload...');
      
            // Generate a new quote number based on current year and existing quotes
      console.log('🔢 Generating quote number...');
      const currentYear = new Date().getFullYear();
      let nextQuoteNumber: string;
      
      // Get all existing quotes from the API to ensure we don't have conflicts
      try {
        const quotesResponse = await fetch('/api/quotes');
        const quotesResult = await quotesResponse.json();
        const existingQuotes = quotesResult.data || [];
        
        // Find the highest quote number for the current year
        const currentYearQuotes = existingQuotes.filter((q: any) => q.quote_number && q.quote_number.startsWith(`Q-${currentYear}-`));
        let maxNumber = 0;
        
        currentYearQuotes.forEach((q: any) => {
          const match = q.quote_number.match(new RegExp(`Q-${currentYear}-(\\d+)`));
          if (match) {
            const number = parseInt(match[1], 10);
            if (number > maxNumber) {
              maxNumber = number;
            }
          }
        });
        
        const nextNumber = maxNumber + 1;
        nextQuoteNumber = `Q-${currentYear}-${String(nextNumber).padStart(3, '0')}`;
        console.log('🔢 Generated quote number:', nextQuoteNumber);
        console.log('🔢 Found', currentYearQuotes.length, 'existing quotes for', currentYear);
        console.log('🔢 Max number found:', maxNumber);
      } catch (error) {
        console.warn('⚠️ Failed to get existing quotes for number generation:', error);
        // Fallback: use timestamp-based number
        const timestamp = Date.now();
        nextQuoteNumber = `Q-${currentYear}-${String(timestamp % 1000).padStart(3, '0')}`;
        console.log('🔢 Generated fallback quote number:', nextQuoteNumber);
      }
      
      const design = showUploadDesignModal.design;
      
      // Create quote data with all necessary fields
      console.log('📝 Creating quote object...');
      const quote = {
        quoteNumber: nextQuoteNumber,
        customer: design.client,
        customerId: design.client.replace(/\s+/g, '-').toUpperCase(),
        created: new Date().toISOString().split('T')[0], // Use current date
        assignee: design.designer,
        status: 'sent',
        total: design.budget || 0,
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
        sent: new Date().toISOString().split('T')[0], // Use current date
        convertedToOrder: false,
        files: [
          ...Array.isArray(design.files) ? design.files : [],
          ...cadFiles.map(file => file.name),
          ...renderingFiles.map(file => file.name)
        ],
        notes: design.notes || `Design uploaded with ${cadFiles.length} CAD files and ${renderingFiles.length} rendering files.`,
        item: `${design.client} Design`,
        client: design.client,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        stage: 'quoteSent', // Changed from 'designsstatus' to 'quoteSent'
      };
      console.log('📝 Quote object created:', quote);
      
      // Create quote via API
      try {
        console.log('🔄 Creating quote via API...');
        const quoteResponse = await fetch('/api/quotes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quote_number: quote.quoteNumber,
            customer_name: quote.customer,
            customer_id: null, // Set to null since we don't have a valid UUID
            total_amount: quote.total,
            budget: design.budget || Math.round((design.budget || 0) * 0.8), // Set budget to 80% of design budget or 0
            status: quote.status,
            description: quote.item,
            valid_until: quote.validUntil,
            notes: quote.notes,
            assignee: quote.assignee
          })
        });

        console.log('📡 Quote API response status:', quoteResponse.status);
        
        if (!quoteResponse.ok) {
          const errorText = await quoteResponse.text();
          console.error('❌ Quote API error response:', errorText);
          throw new Error(`Quote API failed with status ${quoteResponse.status}: ${errorText}`);
        }

        const quoteResult = await quoteResponse.json();
        
        if (quoteResult.success) {
          console.log('✅ Quote created successfully via API:', quoteResult.data);
        } else {
          console.warn('⚠️ Quote creation failed:', quoteResult.error || 'Unknown error');
          // Fallback to mock data
          addMockQuote(quote);
          console.log('✅ Added quote to mock data as fallback');
        }
      } catch (quoteError) {
        console.warn('⚠️ Quote creation failed with exception:', quoteError);
        // Fallback to mock data
        addMockQuote(quote);
        console.log('✅ Added quote to mock data as fallback');
      }
      
      // Add the completed design to mock data for history
      const completedDesign = {
        designId: design.designId,
        client: design.client,
        designer: design.designer,
        completedDate: new Date().toISOString().split('T')[0],
        approvalStatus: 'approved' as const,
        designStatus: 'completed' as const,
        priority: design.priority,
                  budget: design.budget || Math.round((design.budget || 0) * 0.8), // Set budget to 80% of design budget or 0
        materials: design.materials || [],
        complexity: design.complexity,
        clientFeedback: 'Design uploaded and quote sent',
        nextAction: 'Quote sent',
        assignedTo: design.designer,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        files: [
          ...Array.isArray(design.files) ? design.files : [],
          ...cadFiles.map(file => file.name),
          ...renderingFiles.map(file => file.name)
        ],
        notes: design.notes || `Design completed and uploaded with ${cadFiles.length} CAD files and ${renderingFiles.length} rendering files. Quote ${nextQuoteNumber} created.`,
      };
      
      // Add to mock designs for history
      addCompletedDesign(completedDesign);
      
      // Also add directly to the global mutable array for immediate API availability
      // Temporarily disabled due to TypeScript type issues
      // if (typeof global !== 'undefined' && global.mutableMockDesigns) {
      //   global.mutableMockDesigns.push(completedDesign);
      //   console.log('✅ Added completed design to global mutable array for API access');
      // }
      
      console.log('✅ Added completed design to history:', completedDesign);
      
      // Update the design status to 'completed' via API
      try {
        console.log('🔄 Attempting to update design status in database...');
        console.log('🔍 Design ID being sent:', design.designId);
        console.log('🔍 Design object:', design);
        console.log('🔍 Updates being sent:', { quote_status: 'completed', completed_date: new Date().toISOString() });
        
        const updateResponse = await fetch('/api/designs', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            designId: design.designId,
            updates: {
              quote_status: 'completed',
              completed_date: new Date().toISOString()
            }
          })
        });

        console.log('📡 Design API response status:', updateResponse.status);
        
        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          console.error('❌ Design API error response:', errorText);
          throw new Error(`Design API failed with status ${updateResponse.status}: ${errorText}`);
        }

        const updateResult = await updateResponse.json();
        console.log('📊 Design API response:', updateResult);
        
        if (updateResult.success) {
          console.log('✅ Design status updated successfully');
          
          // Add the completed design to history data source
          const completedDesign = {
            designId: design.designId,
            client: design.client,
            designer: design.designer,
            completedDate: new Date().toISOString().split('T')[0],
            approvalStatus: 'approved' as const,
            designStatus: 'completed' as const,
            priority: design.priority,
            budget: design.budget,
            materials: design.materials || [],
            complexity: design.complexity,
            nextAction: 'Design completed',
            assignedTo: design.assignedTo,
            dueDate: design.dueDate,
            files: design.files || [],
            notes: design.notes || 'Design completed via upload process'
          };
          
          // Add to mock designs for history
          addCompletedDesign(completedDesign);
          
          // Also add directly to the global mutable array for immediate API availability
          // Temporarily disabled due to TypeScript type issues
          // if (typeof global !== 'undefined' && global.mutableMockDesigns) {
          //   global.mutableMockDesigns.push(completedDesign);
          //   console.log('✅ Added completed design to global mutable array for API access');
          // }
          
          console.log('✅ Added completed design to history:', completedDesign);
        } else {
          console.warn('⚠️ Design status update failed:', updateResult.error || 'Unknown error');
          // Continue with the upload process even if status update fails
        }
      } catch (updateError) {
        console.warn('⚠️ Design status update failed with exception:', updateError);
        // Continue with the upload process even if status update fails
      }

      // Update local state to reflect the status change and remove from active designs
      setDesigns(prev => prev.filter(d => d.designId !== design.designId));
      
      // Refresh the designs data to reflect the changes
      try {
        console.log('🔄 Refreshing designs data...');
        const response = await fetch('/api/designs');
        const result = await response.json();
        if (result.success) {
          const transformedDesigns = result.data.map((design: any) => ({
            designId: design.design_id,
            client: design.client_name,
            designer: design.designer,
            createdDate: design.created_date,
            approvalStatus: design.approval_status,
            designStatus: design.design_status || design.quote_status || 'not-started',
            priority: design.priority,
            budget: design.budget,
            materials: design.materials || [],
            complexity: design.complexity,
            nextAction: design.next_action,
            assignedTo: design.assigned_to,
            dueDate: design.due_date,
            files: design.files || [],
            notes: design.notes
          }));
          setDesigns(transformedDesigns);
          console.log('✅ Designs data refreshed successfully');
        }
      } catch (refreshError) {
        console.warn('⚠️ Failed to refresh designs data:', refreshError);
        // Continue with the process even if refresh fails
      }
      
      // Show success message
      console.log('🎉 Upload process completed successfully!');
      toast.success(`Upload successful! Quote ${nextQuoteNumber} created and sent to quotes page. Design moved to history.`);
      
      // Close modal and reset state
      console.log('🔒 Closing modal and resetting state...');
      setShowUploadDesignModal({ open: false });
      setCadFiles([]);
      setRenderingFiles([]);
      
      // Force refresh of quotes data to ensure the new quote appears
      console.log('🔄 Triggering quotes data refresh...');
      try {
        // Trigger a global event or refresh mechanism
        if (typeof window !== 'undefined') {
          // Dispatch a custom event that the quotes page can listen to
          window.dispatchEvent(new CustomEvent('quoteCreated', { 
            detail: { quoteNumber: nextQuoteNumber } 
          }));
          console.log('✅ Dispatched quoteCreated event');
          
          // Also store the quote info in localStorage for the quotes page to check
          localStorage.setItem('lastCreatedQuote', JSON.stringify({
            quoteNumber: nextQuoteNumber,
            customer: design.client,
            total: design.budget || 0,
            timestamp: Date.now()
          }));
          console.log('✅ Stored quote info in localStorage');
          
          // Force a direct API call to refresh quotes data
          try {
            const quotesResponse = await fetch('/api/quotes?limit=100');
            if (quotesResponse.ok) {
              const quotesResult = await quotesResponse.json();
              console.log('✅ Direct quotes API call successful, found', quotesResult.data?.length, 'quotes');
            }
          } catch (apiError) {
            console.warn('⚠️ Direct quotes API call failed:', apiError);
          }
        }
      } catch (refreshError) {
        console.warn('⚠️ Failed to trigger quotes refresh:', refreshError);
      }
      
      // Show a message with a link to the quotes page
      toast.success(
        <div>
          Quote {nextQuoteNumber} created successfully! 
          <button 
            onClick={() => window.open('/dashboard/quotes', '_blank')}
            className="ml-2 underline text-blue-600 hover:text-blue-800"
          >
            View in Quotes Page
          </button>
        </div>,
        { duration: 5000 }
      );
      
      // Navigate to quotes page to show the new quote
      console.log('✅ Navigating to quotes page to show new quote');
      setTimeout(() => {
        router.push('/dashboard/quotes');
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error uploading design:', error);
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Header */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-0 pt-10 pb-4">
        <div className="flex items-center justify-between mb-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-emerald-200/50 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent tracking-tight">Designs Status</h1>
              <p className="text-md text-emerald-600 font-medium">
                Track and manage all design completions
                {autoRefresh && (
                  <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    Auto-refresh
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 min-w-[160px]">
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-full" 
                title="Refresh Designs"
                onClick={() => {
                  console.log('🔄 Manual refresh triggered');
                  refreshDesigns(true);
                }}
                disabled={refreshing}
              >
                {refreshing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
              </Button>
              <Link href="/dashboard/call-log">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-full" title="Back to Call Log">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/dashboard/quotes">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-full" title="Next to Quotes">
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
          <Card className="w-52 flex flex-col items-center justify-center p-4 cursor-pointer border-2 shadow-xl rounded-2xl bg-red-100 transition-all duration-300 hover:border-red-200 hover:scale-105">
            <CardContent className="flex flex-col items-center justify-center p-0">
              <AlertCircle className="w-7 h-7 mb-2 text-red-600" />
              <div className="text-2xl font-extrabold text-red-900">
                {loading ? '...' : designs.filter(d => d.designStatus === 'not-started').length}
              </div>
              <div className="text-xs font-medium mt-1 text-red-700">Not Started</div>
            </CardContent>
          </Card>
          <Card className="w-52 flex flex-col items-center justify-center p-4 cursor-pointer border-2 shadow-xl rounded-2xl bg-blue-100 transition-all duration-300 hover:border-blue-200 hover:scale-105">
            <CardContent className="flex flex-col items-center justify-center p-0">
              <FileText className="w-7 h-7 mb-2 text-blue-600" />
              <div className="text-2xl font-extrabold text-blue-900">
                {loading ? '...' : designs.filter(d => d.designStatus === 'in-progress').length}
              </div>
              <div className="text-xs font-medium mt-1 text-blue-700">In Progress</div>
            </CardContent>
          </Card>

          <Card className="w-52 flex flex-col items-center justify-center p-2 cursor-pointer border-2 shadow-xl rounded-2xl bg-purple-100 transition-all duration-300 hover:border-emerald-200 hover:scale-105">
            <CardContent className="flex flex-col items-center justify-center p-0">
              <Gem className="w-7 h-7 mb-2 text-emerald-600" />
              <div className="text-2xl font-extrabold text-emerald-900">
                {loading ? '...' : `$${designs.reduce((sum, d) => sum + (d.budget || 0), 0).toLocaleString()}`}
              </div>
              <div className="text-xs font-medium mt-1 text-emerald-700">Total Budget Value</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div className="relative z-10 max-w-7xl mx-auto mb-8 px-4 md:px-0">
        <Card className="p-6 shadow-xl rounded-2xl bg-white/80 border-emerald-100 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <Input
              placeholder="Search designs or clients..."
              className="w-48 bg-white/70 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 rounded-xl"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <select
              className="border rounded-xl px-2 py-1 text-sm bg-white/70 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20"
              value={designer}
              onChange={e => setDesigner(e.target.value)}
            >
              {designers.map(d => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <select
              className="border rounded-xl px-2 py-1 text-sm bg-white/70 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20"
              value={approvalStatus}
              onChange={e => setApprovalStatus(e.target.value)}
            >
              {approvalStatuses.map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              className="border rounded-xl px-2 py-1 text-sm bg-white/70 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20"
              value={designStatus}
              onChange={e => setDesignStatus(e.target.value)}
            >
              {designStatuses.map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              className="border rounded-xl px-2 py-1 text-sm bg-white/70 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20"
              value={priority}
              onChange={e => setPriority(e.target.value)}
            >
              {priorities.map(p => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <LuxuryDateFilter dateRange={dateRange} setDateRange={setDateRange} />
          </div>
          <div className="flex gap-2">
            <Button 
              variant={autoRefresh ? "default" : "outline"} 
              className={`rounded-xl flex items-center gap-2 ${autoRefresh ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-white border-gray-200 hover:bg-gray-100 hover:border-gray-300'}`}
              onClick={() => {
                const newAutoRefresh = !autoRefresh;
                setAutoRefresh(newAutoRefresh);
                if (newAutoRefresh) {
                  toast.success('Auto-refresh enabled (30s interval)');
                } else {
                  toast.info('Auto-refresh disabled');
                }
              }}
              title={autoRefresh ? "Auto-refresh enabled (30s)" : "Enable auto-refresh"}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {autoRefresh ? "Auto" : "Auto"}
            </Button>
            <Link href="/dashboard/designs/status/history">
              <Button variant="outline" className="bg-white border-gray-200 hover:bg-gray-100 hover:border-gray-300 rounded-xl flex items-center gap-2" title="Design History">
                <History className="h-4 w-4" />
                History
              </Button>
            </Link>
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
                        Completed
                        {getSortIcon("completedDate")}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider cursor-pointer hover:bg-emerald-100 transition-colors"
                      onClick={() => handleSort("designStatus")}
                    >
                      <div className="flex items-center">
                        Design Status
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
                                          onClick={() => handleSort("budget")}
                  >
                    <div className="flex items-center">
                      Budget
                      {getSortIcon("budget")}
                    </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Files</th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider cursor-pointer hover:bg-emerald-100 transition-colors"
                      onClick={() => handleSort("notes")}
                    >
                      <div className="flex items-center">
                        Notes
                        {getSortIcon("notes")}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider sticky right-0 bg-white z-10">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2 text-emerald-600">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                          Loading designs...
                        </div>
                      </td>
                    </tr>
                  ) : filteredDesigns.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-8 text-emerald-400">No completed designs found.</td>
                    </tr>
                  ) : (
                    filteredDesigns.map(d => (
                      <tr key={d.designId} className="border-b border-emerald-100 hover:bg-emerald-50/60 transition luxury-row">
                        <td className="px-4 py-4 font-semibold text-emerald-900">
                          <Link href={`/dashboard/designs/${d.designId}`} className="hover:text-emerald-600 hover:underline transition-colors">
                            {d.designId}
                          </Link>
                        </td>
                        <td className="px-4 py-4">{d.client}</td>
                        <td className="px-4 py-4">{d.designer}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {d.completedDate}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <select
                            className={`border rounded-xl px-2 py-1 text-xs font-semibold focus:border-emerald-400 focus:ring-emerald-400/20 ${getStatusColor(d.designStatus, 'design')}`}
                            value={d.designStatus}
                            onChange={e => {
                              const newStatus = e.target.value as 'not-started' | 'in-progress';
                              console.log(`🔄 Status change triggered for design ${d.designId}: ${d.designStatus} → ${newStatus}`);
                              // Update local state immediately for responsive UI
                              setDesigns(prev => prev.map(design =>
                                design.designId === d.designId ? { ...design, designStatus: newStatus } : design
                              ));
                              // Update in Supabase
                              updateDesignStatus(d.designId, newStatus);
                            }}
                          >
                            <option value="not-started">Not Started</option>
                            <option value="in-progress">In Progress</option>
                          </select>
                        </td>
                        <td className="px-4 py-4">
                          <select
                            className={`border rounded-xl px-2 py-1 text-xs font-semibold focus:border-emerald-400 focus:ring-emerald-400/20 ${getPriorityColor(d.priority)}`}
                            value={d.priority}
                            onChange={e => {
                              const newPriority = e.target.value as CompletedDesign['priority'];
                              // Update local state immediately for responsive UI
                              setDesigns(prev => prev.map(design =>
                                design.designId === d.designId ? { ...design, priority: newPriority } : design
                              ));
                              // Update in Supabase
                              updateDesignPriority(d.designId, newPriority);
                            }}
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </td>
                        <td className="px-4 py-4 font-semibold text-emerald-900">${(d.budget || 0).toLocaleString()}</td>
                        <td className="px-4 py-4">
                          {(() => {
                            // Parse files data properly
                            let filesArray: any[] = [];
                            if (Array.isArray(d.files)) {
                              filesArray = d.files;
                            } else if (typeof d.files === 'string') {
                              try {
                                // Handle both JSON string and regular string
                                const filesStr = d.files as string;
                                if (filesStr.startsWith('[') || filesStr.startsWith('{')) {
                                  filesArray = JSON.parse(filesStr);
                                } else {
                                  filesArray = [filesStr];
                                }
                              } catch (e) {
                                console.log('Error parsing files:', e);
                                filesArray = [d.files];
                              }
                            }
                            
                            // Debug logging
                            console.log('🔍 Files data for design:', d.client);
                            console.log('🔍 Original files:', d.files);
                            console.log('🔍 Parsed filesArray:', filesArray);
                            console.log('🔍 First file:', filesArray[0]);
                            
                            // Debug logging
                            console.log('🔍 Files data for design:', d.client);
                            console.log('🔍 Original files:', d.files);
                            console.log('🔍 Parsed filesArray:', filesArray);
                            console.log('🔍 First file:', filesArray[0]);
                            

                            
                            if (filesArray.length > 0) {
                              return (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      const file = filesArray[0];
                                      
                                      if (!file) return;
                                      
                                      // Handle both string filenames and file objects
                                      if (typeof file === 'string') {
                                        console.log('File:', file);
                                      } else if (file && typeof file === 'object' && file !== null) {
                                        const fileObj = file as any;
                                        if (fileObj.url) {
                                          window.open(fileObj.url, '_blank');
                                        } else if (fileObj.data) {
                                          const form = document.createElement('form');
                                          form.method = 'POST';
                                          form.action = '/api/view-file';
                                          form.target = '_blank';
                                          
                                          const nameInput = document.createElement('input');
                                          nameInput.type = 'hidden';
                                          nameInput.name = 'name';
                                          nameInput.value = fileObj.name || 'file';
                                          
                                          const typeInput = document.createElement('input');
                                          typeInput.type = 'hidden';
                                          typeInput.name = 'type';
                                          typeInput.value = fileObj.type || 'application/octet-stream';
                                          
                                          const dataInput = document.createElement('input');
                                          dataInput.type = 'hidden';
                                          dataInput.name = 'data';
                                          dataInput.value = fileObj.data;
                                          
                                          form.appendChild(nameInput);
                                          form.appendChild(typeInput);
                                          form.appendChild(dataInput);
                                          
                                          document.body.appendChild(form);
                                          form.submit();
                                          document.body.removeChild(form);
                                        }
                                      }
                                    }}
                                    className="hover:scale-110 transition-transform cursor-pointer"
                                    title="Click to view attachment"
                                  >
                                    <Paperclip className="h-4 w-4 text-emerald-600" />
                                  </button>
                                  <span className="text-xs text-emerald-600">{filesArray.length}</span>
                                  <div className="text-xs text-gray-600">
                                    {filesArray.map((file: any, index: number) => (
                                      <div key={index} className="flex items-center gap-1">
                                        <span className="truncate max-w-20" title={typeof file === 'string' ? file : file.name || 'file'}>
                                          {typeof file === 'string' ? file : file.name || 'file'}
                                        </span>
                                        {typeof file === 'object' && file !== null && ((file as any).data || (file as any).url) && (
                                          <button
                                            onClick={() => {
                                              const fileObj = file as any;
                                              if (fileObj.url) {
                                                window.open(fileObj.url, '_blank');
                                              } else if (fileObj.data) {
                                                const form = document.createElement('form');
                                                form.method = 'POST';
                                                form.action = '/api/view-file';
                                                form.target = '_blank';
                                                
                                                const nameInput = document.createElement('input');
                                                nameInput.type = 'hidden';
                                                nameInput.name = 'name';
                                                nameInput.value = fileObj.name || 'file';
                                                
                                                const typeInput = document.createElement('input');
                                                typeInput.type = 'hidden';
                                                typeInput.name = 'type';
                                                typeInput.value = fileObj.type || 'application/octet-stream';
                                                
                                                const dataInput = document.createElement('input');
                                                dataInput.type = 'hidden';
                                                dataInput.name = 'data';
                                                dataInput.value = fileObj.data;
                                                
                                                form.appendChild(nameInput);
                                                form.appendChild(typeInput);
                                                form.appendChild(dataInput);
                                                
                                                document.body.appendChild(form);
                                                form.submit();
                                                document.body.removeChild(form);
                                              }
                                            }}
                                            className="text-blue-600 hover:text-blue-800 text-xs"
                                            title="View file"
                                          >
                                            👁
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            } else {
                              return <span className="text-emerald-300 text-xs">No files</span>;
                            }
                          })()}
                        </td>
                        <td className="px-4 py-4 text-xs truncate max-w-xs" title={d.notes}>{d.notes}</td>
                        <td className="px-4 py-4 sticky right-0 bg-white z-10">
                          <div className="flex items-center gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="default" className="text-xs bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-2 rounded-xl shadow-md">
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl bg-white/95 border-emerald-200">
                                <div className="px-2 py-1.5 text-sm font-semibold text-emerald-700 border-b">Required Actions</div>
                                <DropdownMenuItem onClick={() => handleAction(d, 'upload-design')}>
                                  <Upload className="w-4 h-4 mr-2" />
                                  Upload Design
                                </DropdownMenuItem>
                                {Array.isArray(d.files) && d.files.length > 0 && (
                                  <DropdownMenuItem onClick={() => handleAction(d, 'convert-to-quote')}>
                                    <FileText className="w-4 h-4 mr-2" />
                                    Convert to Quote
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline" className="text-xs px-2 rounded-xl border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 shadow-md">
                                  <MoreHorizontal className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl bg-white/95 border-emerald-200">
                                <DropdownMenuItem onClick={() => handleAction(d, 'view-design')}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Design
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAction(d, 'send-quote')}>
                                  <Send className="w-4 h-4 mr-2" />
                                  Send Quote
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAction(d, 'contact-assignee')}>
                                  <Users className="w-4 h-4 mr-2" />
                                  Contact Assignee
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

      {/* Send Quote Modal */}
      {showSendQuoteModal.open && showSendQuoteModal.design && (
        <Dialog open={showSendQuoteModal.open} onOpenChange={(open) => setShowSendQuoteModal({ open, design: showSendQuoteModal.design })}>
          <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl border-emerald-200 rounded-2xl shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-emerald-800 flex items-center gap-3">
                <Send className="h-6 w-6 text-emerald-600" />
                Send Quote to {showSendQuoteModal.design.client}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div>
                <label className="block text-sm font-semibold text-emerald-700 mb-2">Quote Message</label>
                <textarea
                  value={quoteMessage}
                  onChange={(e) => setQuoteMessage(e.target.value)}
                  className="w-full h-32 p-3 border border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-emerald-400/20 resize-none"
                  placeholder="Enter your quote message..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-emerald-700 mb-2">Attachment (Optional)</label>
                <input
                  type="file"
                  onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                  className="w-full p-2 border border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-emerald-400/20"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>
            </div>
            <DialogFooter className="flex gap-3">
              <Button variant="outline" onClick={() => setShowSendQuoteModal({ open: false })} disabled={aiLoading}>
                Cancel
              </Button>
              <Button className="bg-emerald-600 text-white" onClick={handleConfirmDesign} disabled={aiLoading}>
                {aiLoading ? 'Sending...' : 'Send Quote'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Upload Design Modal */}
      {showUploadDesignModal.open && showUploadDesignModal.design && (
        <Dialog open={showUploadDesignModal.open} onOpenChange={(open) => {
          if (!open) {
            handleModalClose();
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] bg-white/95 backdrop-blur-xl border-emerald-200 rounded-2xl shadow-2xl flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="text-2xl font-bold text-emerald-800 flex items-center gap-3">
                <Upload className="h-6 w-6 text-emerald-600" />
                Upload Design Files for {showUploadDesignModal.design.client}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4 overflow-y-auto flex-1">
              {/* CAD Design Files */}
              <div>
                <label className="block text-sm font-semibold text-emerald-700 mb-3">CAD Design Files</label>
                <div 
                  className="border-2 border-dashed border-emerald-200 rounded-xl p-6 text-center hover:border-emerald-300 transition-colors group"
                  onDragOver={handleCadDragOver}
                  onDragLeave={handleCadDragLeave}
                  onDrop={handleCadDrop}
                >
                  <Upload className="h-8 w-8 text-emerald-400 mx-auto mb-2 group-hover:text-emerald-600 transition-colors" />
                  <p className="text-sm text-emerald-600 mb-2">Upload CAD design files (.dwg, .dxf, .step, .stl, .3ds, .obj)</p>
                  <input
                    ref={cadFileInputRef}
                    type="file"
                    multiple
                    onChange={handleCadFileUpload}
                    className="hidden"
                    accept=".dwg,.dxf,.step,.stl,.3ds,.obj"
                  />
                  <Button 
                    variant="outline" 
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200"
                    onClick={handleCadFileButtonClick}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose CAD Files
                  </Button>
                  <p className="text-xs text-emerald-500 mt-2">Click to browse or drag files here</p>
                </div>
                {cadFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-emerald-700">Selected CAD Files:</p>
                    {cadFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-emerald-50 rounded-lg">
                        <span className="text-sm text-emerald-800">{file.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeCadFile(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rendering Files */}
              <div>
                <label className="block text-sm font-semibold text-emerald-700 mb-3">Rendering Files</label>
                <div 
                  className="border-2 border-dashed border-emerald-200 rounded-xl p-6 text-center hover:border-emerald-300 transition-colors group"
                  onDragOver={handleRenderingDragOver}
                  onDragLeave={handleRenderingDragLeave}
                  onDrop={handleRenderingDrop}
                >
                  <Upload className="h-8 w-8 text-emerald-400 mx-auto mb-2 group-hover:text-emerald-600 transition-colors" />
                  <p className="text-sm text-emerald-600 mb-2">Upload rendering files (.jpg, .jpeg, .png, .pdf, .tiff, .bmp)</p>
                  <input
                    ref={renderingFileInputRef}
                    type="file"
                    multiple
                    onChange={handleRenderingFileUpload}
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf,.tiff,.bmp"
                  />
                  <Button 
                    variant="outline" 
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200"
                    onClick={handleRenderingFileButtonClick}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Rendering Files
                  </Button>
                  <p className="text-xs text-emerald-500 mt-2">Click to browse or drag files here</p>
                </div>
                {renderingFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-emerald-700">Selected Rendering Files:</p>
                    {renderingFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-emerald-50 rounded-lg">
                        <span className="text-sm text-emerald-800">{file.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeRenderingFile(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* File Upload Summary */}
              {(cadFiles.length > 0 || renderingFiles.length > 0) && (
                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    Files Ready for Upload
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">CAD Files:</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {cadFiles.length} file{cadFiles.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">Rendering Files:</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {renderingFiles.length} file{renderingFiles.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Design Information */}
              <div className="bg-emerald-50/50 rounded-xl p-4">
                <h4 className="font-semibold text-emerald-800 mb-2">Design Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-emerald-600">Design ID:</span>
                    <span className="ml-2 font-medium">{showUploadDesignModal.design.designId}</span>
                  </div>
                  <div>
                    <span className="text-emerald-600">Client:</span>
                    <span className="ml-2 font-medium">{showUploadDesignModal.design.client}</span>
                  </div>
                  <div>
                    <span className="text-emerald-600">Designer:</span>
                    <span className="ml-2 font-medium">{showUploadDesignModal.design.designer}</span>
                  </div>
                  <div>
                    <span className="text-emerald-600">Estimated Value:</span>
                    <span className="ml-2 font-medium">${(showUploadDesignModal.design.budget || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="flex gap-3 flex-shrink-0 border-t border-emerald-100 bg-white/80 backdrop-blur-sm p-4 -mx-6 -mb-6 mt-6">
              <Button variant="outline" onClick={handleModalClose} disabled={uploading}>
                Cancel
              </Button>
              {(cadFiles.length > 0 || renderingFiles.length > 0) && (
                <Button 
                  variant="outline" 
                  onClick={clearAllFiles} 
                  disabled={uploading}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Clear All Files
                </Button>
              )}
              <Button 
                className="bg-emerald-600 text-white hover:bg-emerald-700" 
                onClick={handleUploadDesign} 
                disabled={uploading || (cadFiles.length === 0 && renderingFiles.length === 0)}
              >
                {uploading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </div>
                ) : (
                  'Upload & Send to Quotes'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 