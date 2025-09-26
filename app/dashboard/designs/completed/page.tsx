"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Eye, MessageSquare, FileText, Send, Clock, Star, AlertCircle, Users, Calendar, DollarSign, Gem, Paperclip, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as UICalendar } from "@/components/ui/calendar";
import { format, parseISO, isWithinInterval } from "date-fns";
import type { DateRange } from "react-day-picker";

interface CompletedDesign {
  designId: string;
  client: string;
  designer: string;
  completedDate: string;
  approvalStatus: 'pending' | 'approved' | 'revision-requested';
  quoteStatus: 'not-started' | 'in-progress' | 'sent' | 'accepted' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedValue: number;
  materials: string[];
  complexity: 'simple' | 'moderate' | 'complex' | 'expert';
  clientFeedback?: string;
  revisionNotes?: string;
  nextAction: string;
  assignedTo?: string;
  dueDate?: string;
  files?: string[];
  notes?: string;
}

const mockCompletedDesigns: CompletedDesign[] = [
  {
    designId: "DS-2024-0001",
    client: "Sophia Chen",
    designer: "Sarah Johnson",
    completedDate: "2024-07-10",
    approvalStatus: "approved",
    quoteStatus: "in-progress",
    priority: "high",
    estimatedValue: 8500,
    materials: ["18K White Gold", "Diamond", "Sapphire"],
    complexity: "complex",
    clientFeedback: "Love the vintage-inspired setting!",
    nextAction: "Generate quote",
    assignedTo: "Michael Chen",
    dueDate: "2024-07-15",
    files: ["final-design.pdf", "renderings.zip", "specifications.pdf"],
    notes: "Design approved by client. Vintage-inspired setting with emerald accents completed successfully.",
  },
  {
    designId: "DS-2024-0002",
    client: "Ethan Davis",
    designer: "David Chen",
    completedDate: "2024-07-08",
    approvalStatus: "pending",
    quoteStatus: "not-started",
    priority: "medium",
    estimatedValue: 3200,
    materials: ["14K Yellow Gold", "Emerald"],
    complexity: "moderate",
    revisionNotes: "Client wants larger emerald stone",
    nextAction: "Design revision",
    assignedTo: "David Chen",
    dueDate: "2024-07-12",
    files: ["design-draft.pdf"],
    notes: "Modern minimalist design completed. Client requested larger emerald stone - revision needed.",
  },
  {
    designId: "DS-2024-0003",
    client: "Ava Martinez",
    designer: "Sarah Johnson",
    completedDate: "2024-07-09",
    approvalStatus: "approved",
    quoteStatus: "sent",
    priority: "urgent",
    estimatedValue: 12000,
    materials: ["Platinum", "Diamond", "Ruby"],
    complexity: "expert",
    clientFeedback: "Perfect! Ready to proceed with quote",
    nextAction: "Follow up on quote",
    assignedTo: "Jennifer Lee",
    dueDate: "2024-07-11",
    files: ["final-design.pdf", "3d-renderings.zip", "stone-specs.pdf"],
    notes: "Art deco style engagement ring completed. Client approved design and quote has been sent.",
  },
  {
    designId: "DS-2024-0004",
    client: "Noah Garcia",
    designer: "Alex Rodriguez",
    completedDate: "2024-07-07",
    approvalStatus: "approved",
    quoteStatus: "accepted",
    priority: "low",
    estimatedValue: 1800,
    materials: ["Sterling Silver", "Pearl"],
    complexity: "simple",
    nextAction: "Create order",
    assignedTo: "Production Team",
    dueDate: "2024-07-20",
    files: ["design-specs.pdf"],
    notes: "Simple pearl necklace design completed and approved. Quote accepted by client.",
  }
];

const designers = ["All Designers", "Sarah Johnson", "David Chen", "Alex Rodriguez"];
const approvalStatuses = ["All Statuses", "pending", "approved", "revision-requested"];
const quoteStatuses = ["All Statuses", "not-started", "in-progress", "sent", "accepted", "rejected"];
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

export default function DesignsCompletedPage() {
  const [designer, setDesigner] = useState("All Designers");
  const [approvalStatus, setApprovalStatus] = useState("All Statuses");
  const [quoteStatus, setQuoteStatus] = useState("All Statuses");
  const [priority, setPriority] = useState("All Priorities");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [designs, setDesigns] = useState(mockCompletedDesigns);
  const [showSendQuoteModal, setShowSendQuoteModal] = useState<{ open: boolean; design?: CompletedDesign }>({ open: false });
  const [quoteMessage, setQuoteMessage] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);

  const filteredDesigns = designs.filter(d =>
    (designer === "All Designers" || d.designer === designer) &&
    (approvalStatus === "All Statuses" || d.approvalStatus === approvalStatus) &&
    (quoteStatus === "All Statuses" || d.quoteStatus === quoteStatus) &&
    (priority === "All Priorities" || d.priority === priority) &&
    (searchTerm === "" || 
     d.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
     d.designId.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!dateRange?.from || !dateRange?.to || isWithinInterval(parseISO(d.completedDate), { start: dateRange.from, end: dateRange.to }))
  );

  const getStatusColor = (status: string, type: 'approval' | 'quote') => {
    if (type === 'approval') {
      switch (status) {
        case 'approved': return 'bg-green-100 text-green-800';
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'revision-requested': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    } else {
      switch (status) {
        case 'accepted': return 'bg-green-100 text-green-800';
        case 'sent': return 'bg-blue-100 text-blue-800';
        case 'in-progress': return 'bg-yellow-100 text-yellow-800';
        case 'rejected': return 'bg-red-100 text-red-800';
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

  const handleAction = (design: CompletedDesign, action: string) => {
    console.log(`Action ${action} for design ${design.designId}`);
    // In a real app, this would trigger the appropriate workflow
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

  return (
    <div className="max-w-7xl mx-auto py-10 px-2 md:px-0">
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col items-start gap-2">
          <Link href="/dashboard/designs/pending">
            <Button variant="outline" size="sm" className="text-xs text-gray-600 hover:text-gray-800 border-gray-300 hover:border-gray-400 flex items-center">
              <ArrowLeft className="w-3 h-3 mr-1" /> Back: Pending
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold flex items-center gap-2 text-emerald-900">
          <CheckCircle className="h-7 w-7 text-emerald-600" /> Designs Status
        </h1>
        <div className="flex flex-col gap-2">
          <Link href="/dashboard/quotes">
            <Button variant="outline" size="sm" className="text-xs text-gray-600 hover:text-gray-800 border-gray-300 hover:border-gray-400">
              <ArrowRight className="w-3 h-3 mr-1" /> Next: Quotes
            </Button>
          </Link>
        </div>
      </div>
      <Card className="mb-8 p-6 shadow-xl rounded-2xl bg-white/80 border-purple-100 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <Input
            placeholder="Search designs or clients..."
            className="w-48 luxury-input"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select
            className="border rounded px-2 py-1 text-sm luxury-input"
            value={designer}
            onChange={e => setDesigner(e.target.value)}
          >
            {designers.map(d => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <select
            className="border rounded px-2 py-1 text-sm luxury-input"
            value={approvalStatus}
            onChange={e => setApprovalStatus(e.target.value)}
          >
            {approvalStatuses.map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            className="border rounded px-2 py-1 text-sm luxury-input"
            value={quoteStatus}
            onChange={e => setQuoteStatus(e.target.value)}
          >
            {quoteStatuses.map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            className="border rounded px-2 py-1 text-sm luxury-input"
            value={priority}
            onChange={e => setPriority(e.target.value)}
          >
            {priorities.map(p => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <LuxuryDateFilter dateRange={dateRange} setDateRange={setDateRange} />
        </div>
      </Card>
      {/* Move summary statistics to the very top */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Confirmed Designs</p>
                <p className="text-2xl font-bold text-green-800">
                  {filteredDesigns.filter(d => d.approvalStatus === 'approved').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Quotes in Progress</p>
                <p className="text-2xl font-bold text-blue-800">
                  {filteredDesigns.filter(d => d.quoteStatus === 'in-progress').length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Total Value</p>
                <p className="text-2xl font-bold text-purple-800">
                  ${filteredDesigns.reduce((sum, d) => sum + d.estimatedValue, 0).toLocaleString()}
                </p>
              </div>
              <Gem className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent>
          <div className="overflow-x-auto rounded-lg shadow-lg luxury-table-wrapper">
            <table className="min-w-full bg-white luxury-table">
              <thead className="sticky top-0 z-20 shadow-md bg-emerald-50">
                <tr>
                  <th className="px-4 py-3 text-center text-xs font-bold text-emerald-700 uppercase tracking-wider">Create Quote</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Design ID</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Designer</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Completed</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Quote Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Value</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Files</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">Notes</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider sticky right-0 bg-white z-10">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDesigns.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-8 text-gray-400">No completed designs found.</td>
                  </tr>
                ) : (
                  filteredDesigns.map(d => (
                    <tr key={d.designId} className="border-b hover:bg-purple-50/60 transition luxury-row">
                      <td className="px-4 py-4 text-center">
                        <Link href={`/dashboard/designs/${d.designId}?edit=1`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                            title="Build Design"
                          >
                            Build Design
                          </Button>
                        </Link>
                      </td>
                      <td className="px-4 py-4 font-semibold text-purple-900">
                        <Link href={`/dashboard/designs/${d.designId}`} className="hover:text-purple-600 hover:underline transition-colors">
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
                          className={`border rounded px-2 py-1 text-xs font-semibold ${getStatusColor(d.quoteStatus, 'quote')}`}
                          value={d.quoteStatus}
                          onChange={e => {
                            const newStatus = e.target.value as CompletedDesign['quoteStatus'];
                            setDesigns(prev => prev.map(design =>
                              design.designId === d.designId ? { ...design, quoteStatus: newStatus } : design
                            ));
                          }}
                        >
                          <option value="not-started">Not Started</option>
                          <option value="in-progress">In Progress</option>
                          <option value="sent">Sent</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <select
                          className={`border rounded px-2 py-1 text-xs font-semibold ${getPriorityColor(d.priority)}`}
                          value={d.priority}
                          onChange={e => {
                            const newPriority = e.target.value as CompletedDesign['priority'];
                            setDesigns(prev => prev.map(design =>
                              design.designId === d.designId ? { ...design, priority: newPriority } : design
                            ));
                          }}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          ${d.estimatedValue.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        {Array.isArray(d.files) && d.files.length > 0 ? (
                          <Paperclip className="h-4 w-4 text-emerald-600 mx-auto" />
                        ) : (
                          <span className="text-gray-400 text-xs">No file</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs truncate" title={d.notes}>
                        {d.notes && d.notes.length > 40 ? d.notes.slice(0, 40) + "..." : d.notes || "—"}
                      </td>
                      <td className="px-4 py-4 sticky right-0 bg-white z-10 luxury-actions">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => openSendQuoteModal(d)}
                            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Send className="w-3 h-3" />
                            Confirm Design
                          </Button>
                          {d.quoteStatus === 'sent' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAction(d, 'follow-up')}
                              className="flex items-center gap-1 text-black"
                            >
                              <MessageSquare className="w-3 h-3" />
                              Follow Up
                            </Button>
                          )}
                          {d.approvalStatus === 'approved' && d.quoteStatus === 'not-started' && (
                            <Button
                              size="sm"
                              onClick={() => handleAction(d, 'generate-quote')}
                              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
                            >
                              <FileText className="w-3 h-3" />
                              Quote
                            </Button>
                          )}
                          {d.approvalStatus === 'revision-requested' && (
                            <Button
                              size="sm"
                              onClick={() => handleAction(d, 'revision')}
                              className="flex items-center gap-1 bg-orange-600 hover:bg-orange-700"
                            >
                              <AlertCircle className="w-3 h-3" />
                              Revision
                            </Button>
                          )}
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
      {/* Send Quote Modal */}
      {showSendQuoteModal.open && showSendQuoteModal.design && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-bold mb-2 text-emerald-800">Send Quote to {showSendQuoteModal.design.client}</h3>
            <p className="mb-2 text-gray-600">Review and personalize the message before sending to the customer.</p>
            <textarea
              className="w-full border rounded p-2 mb-3 min-h-[120px]"
              value={quoteMessage}
              onChange={e => setQuoteMessage(e.target.value)}
              disabled={aiLoading}
            />
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (optional):</label>
              <input
                type="file"
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                onChange={e => setAttachment(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                disabled={aiLoading}
              />
              {attachment && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-700">{attachment.name}</span>
                  <Button size="sm" variant="ghost" onClick={() => setAttachment(null)} disabled={aiLoading}>Remove</Button>
                </div>
              )}
            </div>
            <div className="flex gap-2 mb-3">
              <Button variant="outline" onClick={handleRegenerateAI} disabled={aiLoading}>
                {aiLoading ? 'Regenerating...' : 'Regenerate with AI'}
              </Button>
              <Button variant="ghost" onClick={() => setQuoteMessage('')} disabled={aiLoading}>Clear</Button>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowSendQuoteModal({ open: false })} disabled={aiLoading}>Cancel</Button>
              <Button className="bg-emerald-600 text-white" onClick={() => setShowSendQuoteModal({ open: false })} disabled={aiLoading}>Send</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 