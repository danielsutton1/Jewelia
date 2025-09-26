import * as React from "react";
import { SegmentedCircularProgress } from "@/components/ui/segmented-circular-progress";
import { Badge } from "@/components/ui/badge";
import { Bell, Image, Send, ClipboardList, CheckCircle, ArrowRight, ChevronRight, Phone } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import Link from 'next/link';
import { useState } from "react"
import { SetReminderModal } from "./SetReminderModal"
import { LogPhoneCallDialog } from "@/components/customers/log-phone-call-dialog"
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog as UIDialog, DialogContent as UIDialogContent, DialogTitle as UIDialogTitle } from "@/components/ui/dialog";
import { mockCompletedDesigns } from "@/data/mock-designs";
import { mockQuotes } from "@/data/mock-quotes";

const STAGE_CONFIG = {
  logCall: {
    label: "Call Log",
    icon: Phone,
    description: "Initial contact logged and analyzed.",
  },
  waitingDesign: {
    label: "Waiting to be Designed",
    icon: Image,
    description: "Design team notified, awaiting design work.",
  },
  designCompleted: {
    label: "Design Completed",
    icon: CheckCircle,
    description: "Design work finished and ready for review.",
  },
  quoteSent: {
    label: "Quote Sent",
    icon: Send,
    description: "Quote has been sent to the client.",
  },
  clientResponse: {
    label: "Client Response",
    icon: ClipboardList,
    description: "Awaiting or received client response.",
  },
  approved: {
    label: "Approved/Order Created",
    icon: ArrowRight,
    description: "Quote approved and order created.",
  },
};

// Mock data for demonstration
const mockStageData = [
  { stage: "logCall", count: 3, onTrack: 2, delayed: 1, overdue: 0 },
  { stage: "waitingDesign", count: 2, onTrack: 1, delayed: 1, overdue: 0 },
  { stage: "designCompleted", count: 1, onTrack: 1, delayed: 0, overdue: 0 },
  { stage: "quoteSent", count: 4, onTrack: 2, delayed: 1, overdue: 1 },
  { stage: "clientResponse", count: 1, onTrack: 1, delayed: 0, overdue: 0 },
  { stage: "approved", count: 2, onTrack: 2, delayed: 0, overdue: 0 },
];

// Add Quote type for mockQuotes
export interface Quote {
  quoteNumber: string;
  callLogId?: string;
  designId?: string;
  item: string;
  items?: any[]; // Add items field for quote items array
  client: string;
  dueDate: string;
  assignee: string;
  status: 'on-track' | 'delayed' | 'overdue' | 'sent' | 'accepted' | 'declined' | 'expired' | 'draft';
  stage: string;
  customer: string;
  customerId: string;
  created: string;
  total: number;
  validUntil: string;
  sent: string;
  convertedToOrder: boolean;
  files: string[];
  notes: string;
  subtotal?: number;
  tax_rate?: number;
  tax_amount?: number;
  discount_total?: number;
}

interface QuotesKanbanBoardProps {
  steps: string[];
  dateRange?: { from: Date; to: Date };
  isRefreshing?: boolean;
  clientResponseCount?: number;
}

// Add stageColors mapping for luxury theme
const stageColors: { [key: string]: string } = {
  logCall: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  waitingDesign: 'bg-blue-100 text-blue-800 border-blue-300',
  designCompleted: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  quoteSent: 'bg-purple-100 text-purple-800 border-purple-300',
  clientResponse: 'bg-pink-100 text-pink-800 border-pink-300',
  approved: 'bg-green-100 text-green-800 border-green-300',
  designsstatus: 'bg-cyan-100 text-cyan-800 border-cyan-300',
};

export function QuotesKanbanBoard({ steps, dateRange, isRefreshing, clientResponseCount }: QuotesKanbanBoardProps) {
  const router = useRouter();
  const [openContactDialog, setOpenContactDialog] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState("");
  const [aiSuggestion, setAiSuggestion] = React.useState("");
  const [tone, setTone] = React.useState("Professional");
  const [loadingAI, setLoadingAI] = React.useState(false);
  const [searchQueries, setSearchQueries] = React.useState<{ [stage: string]: string }>({});
  const [showSetReminderModal, setShowSetReminderModal] = useState(false);
  const [showLogCallModal, setShowLogCallModal] = useState(false);
  const [convertModal, setConvertModal] = useState<{ open: boolean; quote: any }>({ open: false, quote: null });

  // Map steps to stage keys (normalize to camelCase for mock data)
  const stepToStageKey = (step: string) => {
    switch (step.toLowerCase()) {
      case "log call":
      case "call log":
        return "logCall";
      case "waiting to be designed": return "waitingDesign";
      case "design completed": return "designCompleted";
      case "quote sent": return "quoteSent";
      case "client response": return "clientResponse";
      case "approved/order created": return "approved";
      case "designs status": return "designsstatus";
      default: return step.replace(/\s+/g, '').toLowerCase();
    }
  };

  // Filter quotes by dateRange if provided (assume dueDate is in 'MMM d' format for mock data)
  const filteredQuotes = React.useMemo(() => {
    if (!dateRange) return mockQuotes;
    return mockQuotes.filter((q: Quote) => {
      // For demo, parse dueDate as current year
      const due = new Date(`${q.dueDate}, ${new Date().getFullYear()}`);
      return due >= dateRange.from && due <= dateRange.to;
    });
  }, [dateRange]);

  const handleAISuggest = () => {
    setLoadingAI(true);
    setTimeout(() => {
      let suggestion = "";
      if (openContactDialog?.endsWith("assignee")) {
        if (tone === "Friendly") suggestion = "Hey there! Just a quick reminder about the quote task. Let me know if you need anything!";
        else if (tone === "Urgent") suggestion = "This is an urgent reminder to address the quote task as soon as possible. Please confirm receipt.";
        else suggestion = "Hello, this is a reminder regarding the assigned quote task. Please review and update as needed. Thank you!";
      } else {
        if (tone === "Friendly") suggestion = "Hi! Just checking in on your quote. Let us know if you have any questions or need assistance!";
        else if (tone === "Urgent") suggestion = "This is a friendly reminder regarding your quote. Please review and respond at your earliest convenience.";
        else suggestion = "Dear client, this is a reminder regarding your recent quote. Please let us know if you have any questions or would like to proceed. Thank you!";
      }
      setAiSuggestion(suggestion);
      setMessage(suggestion);
      setLoadingAI(false);
    }, 800);
  };

  const handleSend = () => {
    alert(`Message sent: ${message}`);
    setMessage("");
    setAiSuggestion("");
    setOpenContactDialog(null);
  };

  function handleConvertToOrder(quote: any) {
    setConvertModal({ open: true, quote });
  }

  function handleConfirmConvert() {
    setConvertModal({ open: false, quote: null });
    toast.success(`Quote ${convertModal.quote?.quoteNumber} converted to Order O-1234 and moved to Production.`);
  }

  return (
    <>
      {/* Log Phone Call Modal (shared with customers) */}
      <LogPhoneCallDialog open={showLogCallModal} onOpenChange={setShowLogCallModal} customer={null} />

      {/* Set Reminder Modal */}
      <SetReminderModal
        open={showSetReminderModal}
        onOpenChange={setShowSetReminderModal}
        quoteNumber="Q-2024-001"
        clientName="Sarah Johnson"
      />

      {/* Contact Dialogs */}
      <Dialog open={openContactDialog !== null} onOpenChange={() => setOpenContactDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogTitle>{openContactDialog?.endsWith("assignee") ? "Message Assignee" : "Message Client"}</DialogTitle>
          <div className="mb-4">
            <div className="mb-2 flex items-center gap-2">
              <label className="text-sm font-medium">AI Tone:</label>
              <select
                className="border rounded px-2 py-1"
                value={tone}
                onChange={e => setTone(e.target.value)}
                disabled={loadingAI}
              >
                <option>Professional</option>
                <option>Friendly</option>
                <option>Urgent</option>
              </select>
              <button
                className="border rounded px-2 py-1 text-xs bg-emerald-50 hover:bg-emerald-100"
                onClick={handleAISuggest}
                disabled={loadingAI}
                type="button"
              >
                {loadingAI ? "Generating..." : aiSuggestion ? "Regenerate" : "AI Suggest"}
              </button>
            </div>
            <textarea
              className="w-full border rounded p-2 min-h-[80px] mb-4"
              placeholder={openContactDialog?.endsWith("assignee") ? "Type your message to the assignee..." : "Type your message to the client..."}
              value={message}
              onChange={e => setMessage(e.target.value)}
              disabled={loadingAI}
            />
            <button
              className="bg-emerald-600 text-white rounded px-4 py-2 font-semibold hover:bg-emerald-700 transition"
              onClick={handleSend}
              disabled={!message.trim() || loadingAI}
            >
              Send
            </button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Main Kanban Board */}
      <div className="flex gap-8 overflow-x-auto py-8 px-2 md:px-0 justify-center">
        {steps.map((step: string) => {
          const stage = stepToStageKey(step);
          const { label, icon: Icon } = STAGE_CONFIG[stage as keyof typeof STAGE_CONFIG] || { label: step, icon: Bell };
          const quotesInStage = filteredQuotes.filter(q => q.stage === stage);
          const onTrack = quotesInStage.filter(q => (q.status as 'on-track' | 'delayed' | 'overdue') === "on-track").length;
          const delayed = quotesInStage.filter(q => (q.status as 'on-track' | 'delayed' | 'overdue') === "delayed").length;
          const overdue = quotesInStage.filter(q => (q.status as 'on-track' | 'delayed' | 'overdue') === "overdue").length;
          const count = stage === "designsstatus" ? mockCompletedDesigns.length : quotesInStage.length;
          const segments = [
            onTrack > 0 ? { value: onTrack, color: "#22c55e" } : null,
            delayed > 0 ? { value: delayed, color: "#eab308" } : null,
            overdue > 0 ? { value: overdue, color: "#ef4444" } : null,
          ].filter((seg): seg is { value: number; color: string } => seg !== null);
          let detailsLink = "/dashboard/quotes";
          if (stage === "logCall") detailsLink = "/dashboard/call-log";
          if (stage === "waitingDesign") detailsLink = "/dashboard/designs/pending";
          if (stage === "designCompleted" || stage === "designsstatus") detailsLink = "/dashboard/designs/status";
          if (stage === "approved") detailsLink = "/dashboard/orders";
          if (stage === "designsstatus") {
            // Debug log for designsstatus
            // eslint-disable-next-line no-console
            console.log('Designs Status quotesInStage:', quotesInStage);
            // eslint-disable-next-line no-console
            console.log('Designs Status segments:', segments);
          }
          return (
            <div key={stage} className="group relative flex flex-col items-center justify-center min-w-[200px] p-4 bg-white border-2 rounded-xl shadow-lg hover:shadow-xl transition-all border-emerald-200">
              <SegmentedCircularProgress
                segments={segments.length > 0 ? segments : [{ value: 1, color: '#e5e7eb' }]}
                size={120}
                strokeWidth={10}
                backgroundColor="#f3f4f6"
                className="transition-transform duration-300 group-hover:scale-105"
              >
                <div className="flex flex-col items-center justify-center space-y-1">
                  <Icon className="h-7 w-7" />
                  <span className="text-xl font-bold">{stage === "clientResponse" && typeof clientResponseCount === 'number' ? clientResponseCount : count}</span>
                </div>
              </SegmentedCircularProgress>
              <div className="mt-3 text-center">
                <h3 className="font-medium text-base">{label}</h3>
                <Link href={detailsLink} className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground cursor-pointer hover:underline">
                  <span>View details</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="mt-2 flex flex-row flex-wrap items-center justify-center gap-x-2 gap-y-0 w-full min-h-[32px]">
                {onTrack > 0 && (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">{onTrack} On track</Badge>
                )}
                {delayed > 0 && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">{delayed} Delayed</Badge>
                )}
                {overdue > 0 && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">{overdue} Overdue</Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* Convert to Order Modal */}
      <UIDialog open={convertModal.open} onOpenChange={open => setConvertModal({ open, quote: open ? convertModal.quote : null })}>
        <UIDialogContent className="max-w-md">
          <UIDialogTitle>Convert Quote to Order</UIDialogTitle>
          {convertModal.quote && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded p-3">
                <div className="font-semibold">Quote #{convertModal.quote.quoteNumber}</div>
                <div>Client: {convertModal.quote.client}</div>
                <div>Item: {convertModal.quote.item}</div>
              </div>
              <button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded px-4 py-2 font-semibold mt-2"
                onClick={handleConfirmConvert}
              >
                Convert & Move to Production
              </button>
            </div>
          )}
        </UIDialogContent>
      </UIDialog>
    </>
  );
} 