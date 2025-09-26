"use client"

import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Download, FileText, Printer, Sparkles, Edit2, Copy } from "lucide-react"
import { useState, useRef } from "react"
import { copyToClipboard } from "@/components/ui/utils";

// Mock call log data
const mockCallLogs = [
  {
    id: "1",
    department: "Sales department A",
    contact: "Client 1",
    clientType: "VIP",
    product: "Diamond Ring",
    carat: "2.5ct",
    material: "Platinum",
    value: "$25,000",
    salesStage: "Consultation",
    contactNumber: "+1 334 555 3333",
    purpose: "Sign up",
    date: "2024-02-24",
    time: "10:00 AM",
    duration: "30 minutes",
    followUp: true,
    followUpDate: "2024-03-17",
    notes: "Send over background sheet",
    aiNextStep: "Recommend matching earrings for upsell. Schedule in-store appointment.",
    aiMessage: "Dear Client, thank you for your interest in our diamond rings. We look forward to welcoming you for a personalized consultation.",
    starred: true,
    timeline: [
      { date: "2024-02-24", action: "Created", by: "Ben" },
      { date: "2024-02-25", action: "Edited notes", by: "Ben" },
    ]
  },
  {
    id: "3",
    department: "Sales department B",
    contact: "Client 3",
    clientType: "Trade",
    product: "Loose Diamond",
    carat: "1.2ct",
    material: "Diamond",
    value: "$5,800",
    salesStage: "Negotiation",
    contactNumber: "+1 334 555 3335",
    purpose: "Initial Interest",
    date: "2024-02-28",
    time: "11:30 AM",
    duration: "90 minutes",
    followUp: false,
    followUpDate: "",
    notes: "Assign Ben to client account",
    aiNextStep: "Prepare trade pricing proposal. Share GIA certificate.",
    aiMessage: "We appreciate your interest in our loose diamonds. Please find attached the GIA certificate and trade pricing details.",
    starred: true,
    timeline: [
      { date: "2024-02-28", action: "Created", by: "Ben" },
      { date: "2024-03-01", action: "Added follow-up", by: "Admin" },
    ]
  }
]

export default function CallLogNotesPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = params?.id as string;
  const logId = searchParams.get("logId") || "1";
  const log = mockCallLogs.find(l => l.id === logId) || mockCallLogs[0];
  const [copySuccess, setCopySuccess] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(log.notes);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const noteRef = useRef<HTMLDivElement>(null);

  // Copy note to clipboard
  async function handleCopy() {
    await copyToClipboard(log.notes);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 1200);
  }

  // Export note as .txt file
  function handleExport() {
    const blob = new Blob([log.notes], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `note-${logId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Print only the note content
  function handlePrint() {
    if (!noteRef.current) return;
    const printWindow = window.open('', '', 'width=600,height=600');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Print Note</title>');
      printWindow.document.write('</head><body >');
      printWindow.document.write(`<div style="font-family: sans-serif; padding: 2rem;">${noteRef.current.innerHTML}</div>`);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 300);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => router.push(`/dashboard/customers/${customerId}/call-log`)}>
          &larr; Back to Call Log
        </Button>
        <h1 className="text-3xl font-bold">Call Log Notes</h1>
      </div>
      <div className="mb-4 text-muted-foreground">Customer ID: <span className="font-mono">{customerId}</span></div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex flex-wrap gap-4 items-center justify-between">
            <span>Call Summary</span>
            <div className="flex gap-2">
              <Button size="icon" variant="outline" aria-label="Copy Note" title={copySuccess ? "Copied!" : "Copy Note"} onClick={handleCopy}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" aria-label="Export Note" title="Export Note" onClick={handleExport}>
                <Download className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" aria-label="Print Note" title="Print Note" onClick={handlePrint}>
                <Printer className="h-4 w-4" />
              </Button>
              {editing ? (
                <>
                  <Button size="icon" variant="outline" aria-label="Save Note" title="Save Note" onClick={() => {
                    log.notes = editValue;
                    setEditing(false);
                    setSaveSuccess(true);
                    setTimeout(() => setSaveSuccess(false), 1200);
                  }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                  </Button>
                  <Button size="icon" variant="outline" aria-label="Cancel Edit" title="Cancel Edit" onClick={() => { setEditing(false); setEditValue(log.notes); }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </Button>
                </>
              ) : (
                <Button size="icon" variant="outline" aria-label="Edit Note" title="Edit Note" onClick={() => setEditing(true)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><span className="font-medium">Product/Service:</span> {log.product}</div>
            <div><span className="font-medium">Value:</span> {log.value}</div>
            <div><span className="font-medium">Date:</span> {log.date}</div>
            <div><span className="font-medium">Duration:</span> {log.duration}</div>
            <div><span className="font-medium">Sales Stage:</span> {log.salesStage}</div>
            <div><span className="font-medium">Department:</span> {log.department}</div>
            <div><span className="font-medium">Client Type:</span> {log.clientType}</div>
            <div><span className="font-medium">Follow-up:</span> {log.followUp ? `Yes (${log.followUpDate})` : "No"}</div>
          </div>
          <div className="mb-4">
            <div className="font-semibold mb-1">Full Notes</div>
            {editing ? (
              <textarea
                className="bg-muted rounded p-4 text-base mb-2 w-full min-h-[120px] border focus:outline-none focus:ring-2 focus:ring-primary"
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                autoFocus
              />
            ) : (
              <div ref={noteRef} className="bg-muted rounded p-4 text-base mb-2">{log.notes}</div>
            )}
            {saveSuccess && <div className="text-green-600 text-xs mt-1">Note saved!</div>}
          </div>
          <div className="mb-4 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="font-semibold mb-1 flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />AI Insights</div>
              <div className="text-xs text-muted-foreground mb-1">AI Sentiment: <span className="text-green-600 font-semibold">Positive</span></div>
              <div className="text-xs text-muted-foreground mb-1">Tags: <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium">hot lead</span></div>
              <div className="text-xs text-muted-foreground mb-1">AI Next Step: <span className="font-medium">{log.aiNextStep}</span></div>
              <div className="text-xs text-muted-foreground">AI Message: {log.aiMessage}</div>
            </div>
          </div>
          <div className="mt-6">
            <div className="font-semibold mb-2 flex items-center gap-2"><FileText className="h-4 w-4 text-primary" />Note Timeline</div>
            <div className="flex flex-col gap-1 text-xs">
              {log.timeline.map((t, i) => (
                <div key={i} className="pl-2 border-l-2 border-primary/30 flex gap-2 items-center">
                  <span className="font-medium">{t.date}</span>
                  <span className="text-muted-foreground">{t.action}</span>
                  <span className="text-muted-foreground">by {t.by}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 