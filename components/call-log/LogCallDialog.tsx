import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
// Placeholder components for avatars/thumbnails
const UserAvatar = ({ customer }: { customer: string }) => <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">👤</div>;
const DesignThumbnail = ({ design }: { design: string }) => design ? <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">💍</div> : null;
import { format } from "date-fns";

// Minimal Select implementation for demo
const Select = ({ value, onChange, options, placeholder }: { value: string, onChange: (v: string) => void, options: { value: string, label: string }[], placeholder?: string }) => (
  <select value={value} onChange={e => onChange(e.target.value)} className="border rounded px-2 py-1">
    <option value="">{placeholder}</option>
    {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
  </select>
);

// Minimal Tabs implementation for demo
const Tabs = ({ value, onValueChange, children }: { value: string, onValueChange: (v: string) => void, children: React.ReactNode }) => {
  // Filter out null/undefined and non-object children
  const validChildren = React.Children.toArray(children).filter(child => React.isValidElement(child));
  const tabLabels = validChildren.map((child: any) => child.props.label);
  return (
    <div>
      <div className="flex gap-2 mb-2">
        {tabLabels.map((label, idx) => (
          <button key={label} className={`px-3 py-1 rounded ${value === (validChildren[idx] as any).props.value ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`} onClick={() => onValueChange((validChildren[idx] as any).props.value)}>{label}</button>
        ))}
      </div>
      {validChildren.find((child: any) => child.props.value === value)}
    </div>
  );
};
const Tab = ({ children }: { value: string, label: string, children: React.ReactNode }) => <div>{children}</div>;

export type CallLogRevision = { notes: string; editedAt: Date; editedBy: string };
export type CallLogData = {
  id?: string;
  customer: string;
  design: string;
  callType: string;
  callDateTime: Date;
  duration: string | number;
  outcome: string;
  notes: string;
  assignee: string;
  revisions: CallLogRevision[];
};

export function LogCallDialog({ open, onOpenChange, initialData, onSave }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: CallLogData;
  onSave: (data: CallLogData) => void;
}) {
  const [customer, setCustomer] = useState(initialData?.customer || "");
  const [design, setDesign] = useState(initialData?.design || "");
  const [callType, setCallType] = useState(initialData?.callType || "outbound");
  const [callDateTime, setCallDateTime] = useState<Date>(initialData?.callDateTime ? new Date(initialData.callDateTime) : new Date());
  const [duration, setDuration] = useState(initialData?.duration || "");
  const [outcome, setOutcome] = useState(initialData?.outcome || "completed");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [assignee, setAssignee] = useState(initialData?.assignee || "");
  const [tab, setTab] = useState("details");
  const [revisions, setRevisions] = useState<CallLogRevision[]>(initialData?.revisions || []);

  const handleSave = () => {
    let updatedRevisions = revisions;
    if (initialData && notes !== initialData.notes) {
      updatedRevisions = [
        ...revisions,
        { notes: initialData.notes, editedAt: new Date(), editedBy: "Current User" }
      ];
    }
    onSave({
      customer, design, callType, callDateTime: callDateTime || new Date(), duration, outcome, notes, assignee, revisions: updatedRevisions
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogTitle>{initialData ? "Edit Call Log" : "Log a Call"}</DialogTitle>
        <Tabs value={tab} onValueChange={setTab}>
          <Tab value="details" label="Details">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <UserAvatar customer={customer} />
                <Input value={customer} onChange={e => setCustomer(e.target.value)} placeholder="Customer" />
              </div>
              <div className="flex items-center gap-2">
                <DesignThumbnail design={design} />
                <Select value={design} onChange={setDesign} options={[]} placeholder="Design (optional)" />
              </div>
              <Select value={callType} onChange={setCallType} options={[
                { value: "inbound", label: "Inbound" },
                { value: "outbound", label: "Outbound" }
              ]} />
              <Calendar mode="single" selected={callDateTime} onSelect={(date: Date | undefined) => { if (date) setCallDateTime(date); }} />
              <Input value={duration} onChange={e => setDuration(e.target.value)} placeholder="Duration (min)" />
              <Select value={outcome} onChange={setOutcome} options={[
                { value: "completed", label: "Completed" },
                { value: "no_answer", label: "No Answer" },
                { value: "voicemail", label: "Voicemail" }
              ]} />
              <Input value={assignee} onChange={e => setAssignee(e.target.value)} placeholder="Assignee" />
            </div>
          </Tab>
          <Tab value="notes" label="Notes">
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Call notes..." rows={6} />
          </Tab>
          {initialData && (
            <Tab value="revisions" label={`Revision History (${revisions.length})`}>
              <div className="space-y-2">
                {revisions.map((rev, idx) => (
                  <div key={idx} className="border rounded p-2 bg-gray-50">
                    <div className="text-xs text-gray-500 mb-1">
                      Edited by {rev.editedBy} on {format(new Date(rev.editedAt), "PPpp")}
                    </div>
                    <div className="whitespace-pre-line">{rev.notes}</div>
                  </div>
                ))}
              </div>
            </Tab>
          )}
        </Tabs>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>{initialData ? "Save Changes" : "Log Call"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 