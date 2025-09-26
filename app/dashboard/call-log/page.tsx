"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { ClipboardList, Phone, Calendar, Sparkles, Search, Download, Printer, ChevronDown, ChevronUp, Filter, Plus, CheckCircle, XCircle, Users, ArrowDownCircle, Paperclip, ArrowRight, FileText, ShoppingCart, Settings, MoreHorizontal, Edit, History } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as UICalendar } from "@/components/ui/calendar";
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from "date-fns";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { LogPhoneCallDialog } from "@/components/customers/log-phone-call-dialog";
import { CallLogTable } from "@/components/call-log/CallLogTable";
import { Badge } from "@/components/ui/badge";
import { MessageAssigneeDialog } from "@/components/orders/message-assignee-dialog";
import jsPDF from "jspdf";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const staffList = ["Sarah Johnson", "David Chen"];
const clientList = ["Sophia Lee", "Michael Chen", "Ava Patel", "Liam Smith"];
const purposeList = ["Consultation", "Follow-up", "Quote Discussion", "Approval"];
const sentimentList = ["positive", "neutral", "negative"];

const mockCallLogs = [
  {
    callLogId: 'CL-2024-0001',
    client: 'Sophia Chen',
    staff: 'Daniel Sutton',
    purpose: 'Consultation',
    date: '2024-07-01',
    notes: 'Discussed custom engagement ring.',
    designId: 'DS-2024-0001',
    quoteNumber: 'Q-2024-0001',
    orderNumber: 'O-2024-0001',
  },
  {
    callLogId: 'CL-2024-0002',
    client: 'Ethan Davis',
    staff: 'Sarah Lee',
    purpose: 'Inquiry',
    date: '2024-07-02',
    notes: 'Asked about sapphire pendant.',
    designId: '',
    quoteNumber: '',
    orderNumber: '',
  },
  {
    callLogId: 'CL-2024-0003',
    client: 'Ava Martinez',
    staff: 'David Chen',
    purpose: 'Design Request',
    date: '2024-07-03',
    notes: 'Requested custom bracelet design.',
    designId: 'DS-2024-0002',
    quoteNumber: '',
    orderNumber: '',
  },
];

const mockCalls = [
  {
    callNumber: "CL-2024-0001",
    customer: "Sophia Chen",
    customerId: "1",
    status: "completed",
    type: "Outbound",
    assignee: "Daniel Sutton",
    date: "2024-06-30T20:00:00Z",
    notes: "Discussed custom engagement ring.",
    followUp: false,
    duration: 15,
    files: [ { name: "call-recording.mp3" } ],
  },
  {
    callNumber: "CL-2024-0002",
    customer: "Ethan Davis",
    customerId: "2",
    status: "completed",
    type: "Outbound",
    assignee: "Sarah Lee",
    date: "2024-07-01T20:00:00Z",
    notes: "Asked about sapphire pendant.",
    followUp: true,
    duration: 10,
    files: [],
  },
  {
    callNumber: "CL-2024-0003",
    customer: "Ava Martinez",
    customerId: "3",
    status: "missed",
    type: "Inbound",
    assignee: "David Chen",
    date: "2024-07-02T20:00:00Z",
    notes: "Requested custom bracelet design.",
    followUp: false,
    duration: 8,
  },
];

// This will be calculated dynamically based on callLogs state (only active calls, not sent to design)
const getStatusSummary = (logs: any[]) => {
  const activeLogs = logs.filter(log => !log.design_id && log.status !== 'design_created');
  return [
    { key: "in-progress", label: "In Progress", value: activeLogs.filter(c => c.status === "in-progress").length, color: "bg-blue-100 text-blue-800", icon: Phone },
    { key: "completed", label: "Completed", value: activeLogs.filter(c => c.status === "completed").length, color: "bg-green-100 text-green-800", icon: CheckCircle },
    { key: "followup", label: "Follow-up", value: activeLogs.filter(c => c.status === "followup").length, color: "bg-yellow-100 text-yellow-800", icon: Calendar },
    { key: "missed", label: "Missed", value: activeLogs.filter(c => c.status === "missed" && c.outcome !== "follow-up-needed").length, color: "bg-red-100 text-red-800", icon: XCircle },
  ];
};

const statusColors: { [key: string]: string } = {
  completed: "bg-green-100 text-green-800",
  missed: "bg-red-100 text-red-800",
  followup: "bg-yellow-100 text-yellow-800",
  "in-progress": "bg-blue-100 text-blue-800",
};

function DateCell({ date }: { date: string }) {
  const [formatted, setFormatted] = useState("");
  useEffect(() => {
    if (date) {
      try {
        setFormatted(format(parseISO(date), "PPpp"));
      } catch (error) {
        console.error('Error parsing date:', date, error);
        setFormatted('Invalid date');
      }
    } else {
      setFormatted('No date');
    }
  }, [date]);
  return <span>{formatted}</span>;
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
        <Button variant="outline" size="sm" className="flex items-center gap-1 luxury-date-btn min-w-[170px]" aria-label="Filter by date">
          <Calendar className="h-4 w-4 text-emerald-600" />
          {dateRange?.from && dateRange?.to ? `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}` : "Date"}
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
          className="border rounded-xl shadow-lg p-2 bg-white luxury-calendar"
        />
        <Button variant="ghost" size="sm" className="w-full mt-4 text-emerald-700 hover:bg-emerald-50" onClick={() => { setDateRange(undefined); setInternalRange(undefined); setOpen(false); }}>
          Clear Date Filter
        </Button>
      </PopoverContent>
    </Popover>
  );
}

export default function GlobalCallLogPage() {
  const router = useRouter();
  const [activeSummary, setActiveSummary] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("dueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterStaff, setFilterStaff] = useState<string | null>(null);
  const [filterClient, setFilterClient] = useState<string | null>(null);
  const [filterPurpose, setFilterPurpose] = useState<string | null>(null);
  const [filterSentiment, setFilterSentiment] = useState<string | null>(null);
  const [filterFollowUp, setFilterFollowUp] = useState<boolean | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({ from: undefined, to: undefined });
  const [showFilter, setShowFilter] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [convertModal, setConvertModal] = useState<{ open: boolean; quote: any }>({ open: false, quote: null });
  const [orderNumber, setOrderNumber] = useState("");
  const [showLogCall, setShowLogCall] = useState(false);
  const [contactDialog, setContactDialog] = useState<{ open: boolean; assignee: string | null }>({ open: false, assignee: null });
  const [designDialog, setDesignDialog] = useState<{ open: boolean; callNumber: string | null }>({ open: false, callNumber: null });
  const [designInstructions, setDesignInstructions] = useState("");
  const [callNotes, setCallNotes] = useState("");
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [callLogs, setCallLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [assignee, setAssignee] = useState("");
  const [messageDialog, setMessageDialog] = useState<{ open: boolean; call: any | null }>({ open: false, call: null });
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Get unique assignees from call logs
  const assignees = Array.from(new Set(callLogs.map((c: any) => c.assignee).filter(Boolean)));

  // Fetch call logs from API
  const fetchCallLogs = async () => {
    try {
      console.log('fetchCallLogs: Starting to fetch call logs...');
      setLoading(true);
      const response = await fetch('/api/call-log');
      const result = await response.json();
      console.log('fetchCallLogs: API response:', result);
      
      if (result.success) {
        // Transform API data to match the expected format - only use fields that exist
        const transformedLogs = result.data.map((log: any) => ({
          id: log.id,
          callNumber: `CL-${new Date(log.created_at).getFullYear()}-${String(log.id).padStart(4, '0')}`,
          customer: log.customer_name || 'Unknown Customer',
          customerId: log.customer_id,
          status: log.status || 'in-progress',
          type: 'phone', // Default since call_type doesn't exist
          assignee: 'Staff', // Default since staff_name doesn't exist
          date: log.created_at,
          notes: log.notes || 'No notes provided',
          followUp: false, // Default since follow_up_date doesn't exist
          duration: 5, // Default duration in minutes
          files: [], // Default empty array since files doesn't exist
          outcome: 'completed', // Default outcome
          callLogId: `CL-${new Date(log.created_at).getFullYear()}-${String(log.id).padStart(4, '0')}`,
          client: log.customer_name || 'Unknown Customer',
          staff: 'Staff', // Default since staff_name doesn't exist
          purpose: 'phone', // Default since call_type doesn't exist
          designId: '',
          quoteNumber: '',
          orderNumber: '',
          budget: 0, // Default since budget doesn't exist
        }));
        console.log('fetchCallLogs: Transformed logs:', transformedLogs);
        setCallLogs(transformedLogs);
        console.log('fetchCallLogs: Call logs state updated');
      } else {
        console.error('Failed to fetch call logs:', result.error);
        // Fallback to mock data if API fails
        setCallLogs(mockCallLogs.map(log => ({
          id: log.callLogId,
          customerName: log.client,
          designName: log.designId ? `Design ${log.designId}` : "",
          callType: "outbound",
          callDateTime: log.date,
          duration: 10,
          outcome: "completed",
          notes: log.notes,
          assignee: log.staff,
          revisions: [],
        })));
      }
    } catch (error) {
      console.error('Error fetching call logs:', error);
      // Fallback to mock data
      setCallLogs(mockCallLogs.map(log => ({
        id: log.callLogId,
        customerName: log.client,
        designName: log.designId ? `Design ${log.designId}` : "",
        callType: "outbound",
        callDateTime: log.date,
        duration: 10,
        outcome: "completed",
        notes: log.notes,
        assignee: log.staff,
        revisions: [],
      })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCallLogs();
  }, []);

  const filteredCalls = callLogs.filter(call => {
    // Only show call logs that haven't been sent to design
    if (call.designId || call.status === 'design_created') {
      return false;
    }
    
    if (activeSummary !== "all" && activeSummary !== "followup" && activeSummary !== "duration" && call.status !== activeSummary) return false;
    if (activeSummary === "followup" && call.outcome !== "follow-up-needed") return false;
    if (activeSummary === "in-progress" && call.status !== "in-progress") return false;
    if (search && !call.customer.toLowerCase().includes(search.toLowerCase()) && !call.callNumber.toLowerCase().includes(search.toLowerCase())) return false;
    if (dateRange && dateRange.from && dateRange.to) {
      const callDate = parseISO(call.date);
      if (!isWithinInterval(callDate, { start: dateRange.from, end: dateRange.to })) return false;
    }
    return true;
  }).sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (sortField) {
      case "callNumber":
        aValue = a.callNumber;
        bValue = b.callNumber;
        break;
      case "customer":
        aValue = a.customer;
        bValue = b.customer;
        break;
      case "status":
        aValue = a.status;
        bValue = b.status;
        break;
      case "type":
        aValue = a.type;
        bValue = b.type;
        break;
      case "assignee":
        aValue = a.assignee;
        bValue = b.assignee;
        break;
      case "budget":
        aValue = parseFloat(a.budget) || 0;
        bValue = parseFloat(b.budget) || 0;
        break;
      case "date":
        aValue = new Date(a.date);
        bValue = new Date(b.date);
        break;
      case "notes":
        aValue = a.notes;
        bValue = b.notes;
        break;
      default:
        aValue = new Date(a.date);
        bValue = new Date(b.date);
    }
    
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Analytics
  const totalCalls = filteredCalls.length;
  const callsByStaff = staffList.map(staff => ({ staff, count: filteredCalls.filter(log => log.assignee === staff).length }));
  // const callsByPurpose = purposeList.map(purpose => ({ purpose, count: mockCallLogs.filter(log => log.purpose === purpose).length })); // Use mockCallLogs if needed

  // Useful analytics
  const avgDuration = filteredCalls.length ? (filteredCalls.reduce((sum, c) => sum + (c.duration || 0), 0) / filteredCalls.length).toFixed(1) : 0;

  function handleExport(type: 'csv' | 'pdf') {
    setExporting(true);
    setTimeout(() => setExporting(false), 1200);
  }
  function handlePrint() {
    setPrinting(true);
    setTimeout(() => setPrinting(false), 1200);
  }

  function handleConvertToOrder(quote: any) {
    setConvertModal({ open: true, quote });
    setOrderNumber("");
  }

  function handleConfirmConvert() {
    setConvertModal({ open: false, quote: null });
    toast.success(`Quote ${convertModal.quote?.quoteNumber} converted to Order O-1234 and moved to Production.`);
  }

  function handleSendToDesign(callNumber: string) {
    // Open the design instructions modal
    const callLog = callLogs.find(call => call.callNumber === callNumber);
    setDesignDialog({ open: true, callNumber });
    setDesignInstructions(""); // Reset instructions
    setCallNotes(callLog?.notes || ""); // Set the call notes
  }

  async function handleAiSuggest() {
    console.log('AI Suggest button clicked!');
    console.log('designDialog.callNumber:', designDialog.callNumber);
    console.log('callLogs:', callLogs);
    console.log('callNotes:', callNotes);
    
    if (!designDialog.callNumber) {
      console.log('No call number found');
      return;
    }

    const callLog = callLogs.find(call => call.callNumber === designDialog.callNumber);
    console.log('Found callLog:', callLog);
    
    if (!callLog) {
      console.log('Call log not found');
      toast.error('Call log not found');
      return;
    }

    console.log('Starting AI suggestion generation...');
    setAiSuggesting(true);
    
    // Simulate API delay
    setTimeout(() => {
      try {
        // Generate AI suggestion based on call log data
        const customerName = callLog.customer || 'Customer';
        const callNotes = callLog.notes || '';
        const updatedNotes = callNotes || '';
        const staffMember = callLog.assignee || 'Staff';
        
        let aiSuggestion = `# Design Brief for ${customerName}

## Design Style Preferences
Based on the call conversation, recommend a ${callNotes.includes('modern') ? 'contemporary' : callNotes.includes('vintage') ? 'classic vintage' : 'elegant traditional'} style that reflects the customer's preferences.

## Recommended Materials & Gemstones
- **Primary Metal**: 18k white gold or platinum for premium quality
- **Center Stone**: Diamond (1-2 carats) or colored gemstone based on preference
- **Accent Stones**: Small diamonds or complementary gemstones
- **Setting**: Prong or bezel setting for security and elegance

## Size & Specifications
- **Ring Size**: Standard sizing (customer to confirm)
- **Band Width**: 2-3mm for comfort and durability
- **Stone Quality**: VS1-VS2 clarity, G-H color for diamonds
- **Finish**: High polish with optional brushed accents

## Budget Considerations
- **Price Range**: $3,000 - $8,000 (adjust based on materials selected)
- **Payment Options**: Consider financing or layaway if needed
- **Value Proposition**: Focus on quality craftsmanship and lasting value

## Timeline & Urgency
- **Production Time**: 4-6 weeks for custom design
- **Rush Options**: Available for additional fee if needed
- **Follow-up**: Schedule design review within 1 week

## Special Requests & Constraints
- Ensure design is comfortable for daily wear
- Consider customer's lifestyle and occupation
- Include options for future modifications (resizing, stone upgrades)

## Additional Considerations
- **Personalization**: Engraving options available
- **Certification**: Include GIA certification for diamonds
- **Warranty**: Standard 1-year warranty with care instructions
- **Maintenance**: Recommend annual cleaning and inspection

## Next Steps
1. Create initial design sketches
2. Schedule design consultation
3. Provide material samples
4. Finalize specifications and pricing

*This brief is based on the call conversation with ${staffMember} on ${new Date().toLocaleDateString()}. Please review and adjust based on additional customer feedback.*`;

        console.log('Generated AI suggestion:', aiSuggestion);
        setDesignInstructions(aiSuggestion);
        toast.success('AI suggestions generated successfully!');
      } catch (error) {
        console.error('Error generating AI suggestions:', error);
        toast.error('Failed to generate AI suggestions. Please try again.');
      } finally {
        setAiSuggesting(false);
      }
    }, 1500); // Simulate 1.5 second delay
  }

  async function handleConfirmSendToDesign() {
    console.log('handleConfirmSendToDesign called');
    console.log('designDialog.callNumber:', designDialog.callNumber);
    console.log('designInstructions:', designInstructions);
    
    if (!designDialog.callNumber || !designInstructions.trim()) {
      toast.error('Please provide instructions for the design team');
      return;
    }

    try {
      // Find the call log data
      const callLog = callLogs.find(call => call.callNumber === designDialog.callNumber || call.callLogId === designDialog.callNumber);
      
      if (!callLog) {
        toast.error('Call log not found');
        return;
      }

      // Show loading state
      toast.loading('Creating design from call log...');

      // Prepare call log data for design creation with instructions
      const callLogData = {
        id: callLog.id,
        callLogId: callLog.callNumber || callLog.callLogId,
        customer: callLog.customer || callLog.customer_name,
        customerId: callLog.customerId || callLog.customer_id,
        staff: callLog.staff || callLog.staff_name || callLog.assignee,
        notes: (callNotes.trim() || callLog.notes || '') + '\n\n--- DESIGN INSTRUCTIONS ---\n' + designInstructions.trim(),
        callType: callLog.callType || callLog.call_type || callLog.type,
        callDuration: callLog.callDuration || callLog.duration,
        callOutcome: callLog.callOutcome || callLog.outcome || callLog.status,
        followUpDate: callLog.followUpDate || callLog.follow_up_date,
        fileAttachment: callLog.fileAttachment || callLog.file_attachment,
        additionalNotes: callLog.additionalNotes,
        clientEmail: callLog.clientEmail || callLog.client_email,
        clientPhone: callLog.clientPhone || callLog.client_phone,
        files: callLog.files || [],
        sentiment: callLog.sentiment,
        status: callLog.status,
        budget: callLog.budget, // Include budget from call log
        designInstructions: designInstructions.trim() // Add the instructions
      };

      // Call the designs API to create a new design
      console.log('Sending request to /api/designs with data:', { callLogData });
      
      const response = await fetch('/api/designs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ callLogData }),
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response result:', result);

      if (result.success) {
        toast.dismiss();
        toast.success(`Design ${result.data.designId} created successfully!`);
        
        // Close the modal
        setDesignDialog({ open: false, callNumber: null });
        setDesignInstructions("");
        setCallNotes("");
        
        // Refresh the call logs to show the updated data
        await fetchCallLogs();
        
        // Show additional success message
        setTimeout(() => {
          toast.success(`Design ${result.data.designId} is now available in the Designs Status page!`);
        }, 1000);
      } else {
        toast.dismiss();
        toast.error(result.error || 'Failed to create design');
      }
    } catch (error) {
      toast.dismiss();
      console.error('Error creating design:', error);
      toast.error('Failed to create design. Please try again.');
    }
  }

  // Handler for Contact Assignee
  function handleContactAssignee(assignee: string) {
    setContactDialog({ open: true, assignee });
  }
  // Handler for Download PDF
  function handleDownloadPDF(call: any) {
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(18);
    doc.text("Call Log Detail", 10, y);
    y += 10;
    doc.setFontSize(12);
    doc.text(`Call Log ID: ${call.callNumber || call.callLogId}`, 10, y); y += 8;
    doc.text(`Customer: ${call.customer} (${call.customerId || ''})`, 10, y); y += 8;
    doc.text(`Call Type: ${call.callType || call.type || ''}`, 10, y); y += 8;
    doc.text(`Staff Member: ${call.assignee || call.staff || ''}`, 10, y); y += 8;
    doc.text(`Call Duration: ${call.callDuration || call.duration || ''}`, 10, y); y += 8;
    doc.text(`Call Outcome: ${call.callOutcome || call.status || ''}`, 10, y); y += 8;
    doc.text(`Follow-Up Date: ${call.followUpDate || ''}`, 10, y); y += 8;
    doc.text(`File Attachment: ${call.fileAttachment || ''}`, 10, y); y += 8;
    doc.text(`Additional Notes: ${call.additionalNotes || ''}`, 10, y); y += 8;
    doc.text("Notes:", 10, y); y += 6;
    doc.setFontSize(11);
    doc.text(doc.splitTextToSize(call.notes || '', 180), 12, y); y += 12 + 6 * Math.ceil((call.notes || '').length / 80);
    doc.setFontSize(12);
    doc.text(`Sentiment: ${call.sentiment || ''}`, 10, y); y += 8;
    doc.text(`Status: ${call.status || ''}`, 10, y); y += 10;
    // Related Records
    doc.setFontSize(14);
    doc.text("Related Records", 10, y); y += 8;
    doc.setFontSize(12);
    if (call.designId) { doc.text(`Design: ${call.designId}`, 12, y); y += 7; }
    if (call.quoteNumber) { doc.text(`Quote: ${call.quoteNumber}`, 12, y); y += 7; }
    if (call.orderNumber) { doc.text(`Order: ${call.orderNumber}`, 12, y); y += 7; }
    if (!call.designId && !call.quoteNumber && !call.orderNumber) { doc.text("No related records found", 12, y); y += 7; }
    y += 5;
    // Client Information
    doc.setFontSize(14);
    doc.text("Client Information", 10, y); y += 8;
    doc.setFontSize(12);
    doc.text(`Name: ${call.customer}`, 12, y); y += 7;
    doc.text(`Email: ${call.clientEmail || ''}`, 12, y); y += 7;
    doc.text(`Phone: ${call.clientPhone || ''}`, 12, y); y += 7;
    // Revision History (if present)
    if (call.revisions && call.revisions.length > 0) {
      y += 5;
      doc.setFontSize(14);
      doc.text("Revision History", 10, y); y += 8;
      doc.setFontSize(11);
      call.revisions.forEach((rev: any, idx: number) => {
        doc.text(`Revision ${idx + 1}: ${rev.editedAt ? new Date(rev.editedAt).toLocaleString() : ''} by ${rev.editedBy || ''}`, 12, y); y += 6;
        doc.text(doc.splitTextToSize(rev.notes || '', 180), 14, y); y += 10 + 6 * Math.ceil((rev.notes || '').length / 80);
      });
    }
    doc.save(`${call.callNumber || call.callLogId}.pdf`);
  }

  // Handle status update
  async function handleStatusUpdate(callId: string, newStatus: string) {
    try {
      setUpdatingStatus(callId);
      
      const response = await fetch('/api/call-log', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: callId,
          status: newStatus
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update the local state
        setCallLogs(prevLogs => 
          prevLogs.map(log => 
            log.id === callId 
              ? { ...log, status: newStatus }
              : log
          )
        );
        toast.success('Status updated successfully!');
      } else {
        toast.error(result.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status. Please try again.');
    } finally {
      setUpdatingStatus(null);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'missed': return 'bg-red-100 text-red-800';
      case 'followup': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Header */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-0 pt-10 pb-4">
        <div className="flex items-center justify-between mb-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-emerald-200/50 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
              <Phone className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent tracking-tight">Call Log</h1>
              <p className="text-md text-emerald-600 font-medium">Track and manage all customer calls</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 min-w-[160px]">
            <Button className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:from-emerald-700 hover:to-green-700 hover:shadow-xl transition-all duration-300 flex items-center gap-2 w-full" onClick={() => setShowLogCall(true)}>
              <Plus className="w-5 h-5" /> Log a Call
            </Button>
            <div className="flex gap-2 mt-1">
              <Link href="/dashboard/designs/status">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-full" title="View Designs">
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
          {getStatusSummary(callLogs).map((s: any) => {
            let bg = '';
            let text = 'text-emerald-700';
            if (s.key === 'in-progress') bg = 'bg-blue-100';
            else if (s.key === 'completed') bg = 'bg-green-100';
            else if (s.key === 'followup') bg = 'bg-yellow-100';
            else if (s.key === 'missed') bg = 'bg-red-100';
            else if (s.key === 'duration') bg = 'bg-blue-100';
            return (
              <Card key={s.key} className={cn(`w-52 flex flex-col items-center justify-center p-4 cursor-pointer border-2 shadow-xl rounded-2xl ${bg} transition-all duration-300`, activeSummary === s.key ? 'border-emerald-600 ring-2 ring-emerald-200 scale-105' : 'border-transparent hover:border-emerald-200 hover:scale-105')}
                onClick={() => setActiveSummary(s.key)}>
                <CardContent className="flex flex-col items-center justify-center p-0">
                  <s.icon className="w-7 h-7 mb-2 text-emerald-600" />
                  <div className="text-2xl font-extrabold text-emerald-900">{s.value}</div>
                  <div className={`text-xs font-medium mt-1 ${text}`}>{s.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="relative z-10 max-w-7xl mx-auto mb-8 px-4 md:px-0">
        <Card className="p-6 shadow-xl rounded-2xl bg-white/80 border-emerald-100 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <Input
              placeholder="Search by customer or call #..."
              className="w-full md:w-56 bg-white/70 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 rounded-xl"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select
              className="border rounded-xl px-2 py-1 text-sm bg-white/70 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20"
              value={activeSummary || ""}
              onChange={e => setActiveSummary(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="followup">Follow-up</option>
              <option value="missed">Missed</option>
              <option value="duration">Total Duration</option>
            </select>
            <select
              className="border rounded-xl px-2 py-1 text-sm bg-white/70 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20"
              value={assignee || ""}
              onChange={e => setAssignee(e.target.value)}
            >
              <option value="">All Assignees</option>
              {assignees.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <LuxuryDateFilter dateRange={dateRange} setDateRange={setDateRange} />
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/call-log/history">
              <Button variant="outline" className="bg-white border-gray-200 hover:bg-gray-100 hover:border-gray-300 rounded-xl flex items-center gap-2" title="Call Log History">
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
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setExporting(true)}>
                  <Download className="h-4 w-4" /> Export
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setPrinting(true)}>
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
              <table className="w-full bg-white/60 luxury-table">
                <thead className="sticky top-0 z-20 shadow-md bg-gradient-to-r from-emerald-50 to-green-50">
                  <tr>
                    <th 
                      className="px-2 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap w-[12%] cursor-pointer hover:bg-emerald-100 transition-colors"
                      onClick={() => handleSort("callNumber")}
                    >
                      <div className="flex items-center">
                        Call #
                        {getSortIcon("callNumber")}
                      </div>
                    </th>
                    <th 
                      className="px-2 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap w-[10%] cursor-pointer hover:bg-emerald-100 transition-colors"
                      onClick={() => handleSort("customer")}
                    >
                      <div className="flex items-center">
                        Customer
                        {getSortIcon("customer")}
                      </div>
                    </th>
                    <th 
                      className="px-2 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap w-[12%] cursor-pointer hover:bg-emerald-100 transition-colors"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center">
                        Status
                        {getSortIcon("status")}
                      </div>
                    </th>
                    <th 
                      className="px-2 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap w-[8%] cursor-pointer hover:bg-emerald-100 transition-colors"
                      onClick={() => handleSort("type")}
                    >
                      <div className="flex items-center">
                        Type
                        {getSortIcon("type")}
                      </div>
                    </th>
                    <th 
                      className="px-2 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap w-[10%] cursor-pointer hover:bg-emerald-100 transition-colors"
                      onClick={() => handleSort("assignee")}
                    >
                      <div className="flex items-center">
                        Assignee
                        {getSortIcon("assignee")}
                      </div>
                    </th>
                    <th 
                      className="px-2 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap w-[8%] cursor-pointer hover:bg-emerald-100 transition-colors"
                      onClick={() => handleSort("budget")}
                    >
                      <div className="flex items-center">
                        Budget
                        {getSortIcon("budget")}
                      </div>
                    </th>
                    <th 
                      className="px-2 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap w-[12%] cursor-pointer hover:bg-emerald-100 transition-colors"
                      onClick={() => handleSort("date")}
                    >
                      <div className="flex items-center">
                        Date/Time
                        {getSortIcon("date")}
                      </div>
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap w-[6%]">Files</th>
                    <th 
                      className="px-2 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap w-[12%] cursor-pointer hover:bg-emerald-100 transition-colors"
                      onClick={() => handleSort("notes")}
                    >
                      <div className="flex items-center">
                        Notes
                        {getSortIcon("notes")}
                      </div>
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap w-[18%]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="text-center py-8 text-emerald-400">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mr-2"></div>
                          Loading call logs...
                        </div>
                      </td>
                    </tr>
                  ) : filteredCalls.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-8 text-emerald-400">No calls found.</td>
                    </tr>
                  ) : (
                    filteredCalls.map((call, index) => (
                      <tr key={String(call.id || call.callNumber || `call-${index}`)} className="border-b border-emerald-100 hover:bg-emerald-50/60 transition luxury-row">
                        <td className="px-2 py-3 text-left font-semibold text-emerald-900 whitespace-nowrap">
                          <Link href={`/dashboard/call-log/${call.callNumber}`} className="hover:text-emerald-600 hover:underline transition-colors">
                            {call.callNumber}
                          </Link>
                        </td>
                        <td className="px-2 py-3 text-left whitespace-nowrap">
                          <Link href={`/dashboard/customers/${call.customerId}`} className="hover:text-emerald-600 hover:underline transition-colors font-medium">
                            {call.customer}
                          </Link>
                        </td>
                        <td className="px-2 py-3 text-left whitespace-nowrap overflow-hidden">
                          {updatingStatus === call.id ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                            </div>
                          ) : (
                            <div className="w-full flex justify-start">
                              <select
                                className={`border rounded-lg px-1 py-0.5 text-xs font-semibold focus:border-emerald-400 focus:ring-emerald-400/20 w-24 ${getStatusColor(call.status)}`}
                                value={call.status}
                                onChange={(e) => handleStatusUpdate(call.id, e.target.value)}
                              >
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="followup">Follow-up</option>
                                <option value="missed">Missed</option>
                              </select>
                            </div>
                          )}
                        </td>
                        <td className="px-2 py-3 text-left whitespace-nowrap text-xs">{call.type}</td>
                        <td className="px-2 py-3 text-left whitespace-nowrap text-xs">{call.assignee}</td>
                        <td className="px-2 py-3 text-left whitespace-nowrap text-xs">
                          {call.budget ? `$${parseFloat(call.budget).toLocaleString()}` : '—'}
                        </td>
                        <td className="px-2 py-3 text-left whitespace-nowrap text-xs"><DateCell date={call.date} /></td>
                        <td className="px-2 py-3 text-center whitespace-nowrap">
                          {Array.isArray(call.files) && call.files.length > 0 ? (
                            <div className="flex flex-col items-center gap-1">
                              <button
                                onClick={() => {
                                  const file = call.files[0]; // Get the first file
                                  
                                  if (file.url) {
                                    // For Supabase storage URLs, open directly
                                    window.open(file.url, '_blank');
                                  } else if (file.data) {
                                    // For base64 data, use POST request to avoid URL length issues
                                    const form = document.createElement('form');
                                    form.method = 'POST';
                                    form.action = '/api/view-file';
                                    form.target = '_blank';
                                    
                                    const nameInput = document.createElement('input');
                                    nameInput.type = 'hidden';
                                    nameInput.name = 'name';
                                    nameInput.value = file.name;
                                    
                                    const typeInput = document.createElement('input');
                                    typeInput.type = 'hidden';
                                    typeInput.name = 'type';
                                    typeInput.value = file.type;
                                    
                                    const dataInput = document.createElement('input');
                                    dataInput.type = 'hidden';
                                    dataInput.name = 'data';
                                    dataInput.value = file.data;
                                    
                                    form.appendChild(nameInput);
                                    form.appendChild(typeInput);
                                    form.appendChild(dataInput);
                                    
                                    document.body.appendChild(form);
                                    form.submit();
                                    document.body.removeChild(form);
                                  }
                                }}
                                className="hover:scale-110 transition-transform cursor-pointer"
                                title="Click to view attachment"
                              >
                                <Paperclip className="h-4 w-4 text-emerald-600" />
                              </button>
                              <div className="text-xs text-gray-600">
                                {call.files.map((file: any, index: number) => (
                                  <div key={index} className="flex items-center gap-1">
                                    <span className="truncate max-w-20" title={file.name}>
                                      {file.name}
                                    </span>
                                    {(file.data || file.url) && (
                                      <button
                                        onClick={() => {
                                          // Handle both base64 data and Supabase storage URLs
                                          if (file.url) {
                                            // For Supabase storage URLs, open directly
                                            window.open(file.url, '_blank');
                                          } else if (file.data) {
                                            // For base64 data, use POST request to avoid URL length issues
                                            const form = document.createElement('form');
                                            form.method = 'POST';
                                            form.action = '/api/view-file';
                                            form.target = '_blank';
                                            
                                            const nameInput = document.createElement('input');
                                            nameInput.type = 'hidden';
                                            nameInput.name = 'name';
                                            nameInput.value = file.name;
                                            
                                            const typeInput = document.createElement('input');
                                            typeInput.type = 'hidden';
                                            typeInput.name = 'type';
                                            typeInput.value = file.type;
                                            
                                            const dataInput = document.createElement('input');
                                            dataInput.type = 'hidden';
                                            dataInput.name = 'data';
                                            dataInput.value = file.data;
                                            
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
                          ) : (
                            <span className="text-emerald-300 text-xs">No file</span>
                          )}
                        </td>
                        <td className="px-2 py-3 text-left whitespace-nowrap text-xs truncate" title={call.notes}>{call.notes}</td>
                        <td className="px-2 py-3 text-center align-middle">
                          <div className="flex items-center gap-2 justify-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="default" className="text-xs bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-2 rounded-xl shadow-md">
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl bg-white/95 border-emerald-200">
                                <div className="px-2 py-1.5 text-sm font-semibold text-emerald-700 border-b">Required Actions</div>
                                <DropdownMenuItem onClick={() => handleSendToDesign(call.callNumber)}>
                                  <Sparkles className="w-4 h-4 mr-2" />
                                  Send to Design
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline" className="text-xs px-2 rounded-xl border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 shadow-md">
                                  <MoreHorizontal className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl bg-white/95 border-emerald-200">
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/call-log/${call.callNumber}?edit=true`}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Call
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setMessageDialog({ open: true, call })}>
                                  <Users className="w-4 h-4 mr-2" />
                                  Contact Assignee
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownloadPDF(call)}>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download PDF
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

      {/* Contact Assignee Dialog */}
      <MessageAssigneeDialog
        open={contactDialog.open}
        onOpenChange={(open) => setContactDialog({ open, assignee: null })}
        orderId={contactDialog.assignee || ""}
        assigneeName={contactDialog.assignee || ""}
        assignee={contactDialog.assignee || ""}
      />

      {/* Log Phone Call Dialog */}
      <LogPhoneCallDialog
        open={showLogCall}
        onOpenChange={setShowLogCall}
        onLog={(logData) => {
          console.log('onLog callback triggered with:', logData);
          // Refresh the call logs after a new call is logged
          fetchCallLogs();
          console.log('fetchCallLogs called');
        }}
        customer={null}
      />

      {/* Design Instructions Dialog */}
      <Dialog open={designDialog.open} onOpenChange={(open) => {
        if (!open) {
          setDesignInstructions("");
          setCallNotes("");
        }
        setDesignDialog({ open, callNumber: null });
      }}>
        <DialogContent className="max-w-2xl rounded-2xl shadow-2xl bg-white border-emerald-100">
          <DialogTitle className="text-xl font-bold text-emerald-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            Send to Design Team
          </DialogTitle>
          <div className="space-y-4">
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
              <h3 className="font-semibold text-emerald-800 mb-2">Call Log Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div><span className="font-medium">Call #:</span> {designDialog.callNumber}</div>
                <div><span className="font-medium">Customer:</span> {callLogs.find(c => c.callNumber === designDialog.callNumber)?.customer || 'N/A'}</div>
                <div><span className="font-medium">Staff:</span> {callLogs.find(c => c.callNumber === designDialog.callNumber)?.assignee || 'N/A'}</div>
                <div><span className="font-medium">Date:</span> {callLogs.find(c => c.callNumber === designDialog.callNumber)?.date ? new Date(callLogs.find(c => c.callNumber === designDialog.callNumber)?.date).toLocaleDateString() : 'N/A'}</div>
                <div><span className="font-medium">Budget:</span> {callLogs.find(c => c.callNumber === designDialog.callNumber)?.budget ? `$${callLogs.find(c => c.callNumber === designDialog.callNumber)?.budget.toLocaleString()}` : 'N/A'}</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-emerald-700 mb-1">Call Notes:</label>
                <textarea
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="Add or edit call notes here..."
                  className="w-full h-20 p-2 border border-emerald-200 rounded-lg focus:border-emerald-400 focus:ring-emerald-400/20 resize-none text-sm"
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <Button
                type="button"
                onClick={() => {
                  console.log('Button clicked!');
                  handleAiSuggest();
                }}
                disabled={aiSuggesting}
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-50 flex items-center gap-2"
              >
                {aiSuggesting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    AI Suggest
                  </>
                )}
              </Button>
              <p className="text-xs text-blue-600">
                AI will analyze the call log and suggest design instructions
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-emerald-700 mb-2">
                Design Instructions & Requirements *
              </label>
              <textarea
                value={designInstructions}
                onChange={(e) => setDesignInstructions(e.target.value)}
                placeholder="Please provide detailed instructions for the design team. Include:
• Design style preferences
• Materials and gemstones
• Size specifications
• Budget considerations
• Timeline requirements
• Any special requests or constraints"
                className="w-full h-32 p-3 border border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-emerald-400/20 resize-none text-sm"
                required
              />
              <p className="text-xs text-emerald-600 mt-1">
                * Required: Please provide clear instructions to help the design team create the perfect design.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDesignDialog({ open: false, callNumber: null });
                setDesignInstructions("");
                setCallNotes("");
              }}
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSendToDesign}
              disabled={!designInstructions.trim()}
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Send to Design
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// mockCalls is used internally and should not be exported from a page component 