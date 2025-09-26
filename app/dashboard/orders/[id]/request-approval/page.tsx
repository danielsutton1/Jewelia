"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

export default function RequestApprovalPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;
  const [notes, setNotes] = useState("");

  const handleRequest = () => {
    toast({ title: "Approval Requested", description: `Approval requested for order ${orderId}.` });
    router.push(`/dashboard/orders/${orderId}`);
  };

  return (
    <div className="container mx-auto py-10 max-w-lg">
      <h1 className="text-3xl font-bold mb-4">Request Approval</h1>
      <p className="mb-2">Order ID: <span className="font-mono">{orderId}</span></p>
      <div className="p-6 border rounded-md bg-muted space-y-6">
        <div>
          <label className="block font-medium mb-1">Approval Notes</label>
          <Textarea placeholder="Enter any notes or context for the approval request..." value={notes} onChange={e => setNotes(e.target.value)} rows={4} />
        </div>
        <div className="flex gap-2 justify-end pt-4">
          <Button variant="outline" onClick={() => router.push(`/dashboard/orders/${orderId}`)}>Cancel</Button>
          <Button onClick={handleRequest}>Request Approval</Button>
        </div>
      </div>
    </div>
  );
} 
 
 