"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SendMessagePage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;
  const [message, setMessage] = useState("");
  const [staffMember, setStaffMember] = useState("");

  const handleSend = () => {
    toast({ title: "Message Sent", description: `Message sent for order ${orderId}.` });
    router.push(`/dashboard/orders/${orderId}`);
  };

  return (
    <div className="container mx-auto py-10 max-w-lg">
      <h1 className="text-3xl font-bold mb-4">Send Message</h1>
      <p className="mb-2">Order ID: <span className="font-mono">{orderId}</span></p>
      <div className="p-6 border rounded-md bg-muted space-y-6">
        <div className="space-y-2">
          <Label htmlFor="staff-member">Staff Member</Label>
          <Select value={staffMember} onValueChange={setStaffMember}>
            <SelectTrigger id="staff-member">
              <SelectValue placeholder="Select staff member" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="staff-1">John Smith</SelectItem>
              <SelectItem value="staff-2">Sarah Johnson</SelectItem>
              <SelectItem value="staff-3">Michael Brown</SelectItem>
              <SelectItem value="staff-4">Emily Davis</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea 
            id="message"
            placeholder="Type your message..." 
            value={message} 
            onChange={e => setMessage(e.target.value)} 
            rows={6} 
            required 
          />
        </div>
        <div className="flex gap-2 justify-end pt-4">
          <Button variant="outline" onClick={() => router.push(`/dashboard/orders/${orderId}`)}>Cancel</Button>
          <Button onClick={handleSend} disabled={!staffMember || !message}>Send Message</Button>
        </div>
      </div>
    </div>
  );
} 
 
 