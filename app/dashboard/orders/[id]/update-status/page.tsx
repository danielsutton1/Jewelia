"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

const processStages = [
  "Order Created",
  "Payment Received",
  "In Production",
  "Quality Check",
  "Ready for Pickup",
  "Completed"
]
const statusOptions = ["Pending", "Processing", "In Progress", "Completed", "Cancelled"]

export default function UpdateOrderStatusPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;
  const [stage, setStage] = useState(processStages[0]);
  const [status, setStatus] = useState(statusOptions[0]);
  const [note, setNote] = useState("");

  const handleSave = () => {
    toast({
      title: "Status Updated",
      description: `Order ${orderId}: ${stage} set to ${status}${note ? ` (Note: ${note})` : ''}.`
    });
    router.push(`/dashboard/orders/${orderId}`);
  };

  return (
    <div className="container mx-auto py-10 max-w-lg">
      <h1 className="text-3xl font-bold mb-4">Update Order Status</h1>
      <p className="mb-2">Order ID: <span className="font-mono">{orderId}</span></p>
      <div className="p-6 border rounded-md bg-muted space-y-6">
        <div>
          <label className="block font-medium mb-1">Process Stage</label>
          <Select value={stage} onValueChange={setStage}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select process stage" />
            </SelectTrigger>
            <SelectContent>
              {processStages.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block font-medium mb-1">Status</label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block font-medium mb-1">Note (optional)</label>
          <Textarea placeholder="Add a note about this status update..." value={note} onChange={e => setNote(e.target.value)} rows={3} />
        </div>
        <div className="flex gap-2 justify-end pt-4">
          <Button variant="outline" onClick={() => router.push(`/dashboard/orders/${orderId}`)}>Cancel</Button>
          <Button onClick={handleSave}>Save Status</Button>
        </div>
      </div>
    </div>
  );
} 
 
 