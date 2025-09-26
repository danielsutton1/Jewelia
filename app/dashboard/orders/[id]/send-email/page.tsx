"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

export default function SendEmailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = () => {
    toast({ title: "Email Sent", description: `Email sent for order ${orderId}.` });
    router.push(`/dashboard/orders/${orderId}`);
  };

  return (
    <div className="container mx-auto py-10 max-w-lg">
      <h1 className="text-3xl font-bold mb-4">Send Email</h1>
      <p className="mb-2">Order ID: <span className="font-mono">{orderId}</span></p>
      <div className="p-6 border rounded-md bg-muted space-y-6">
        <div>
          <label className="block font-medium mb-1">To</label>
          <Input placeholder="Recipient email" value={recipient} onChange={e => setRecipient(e.target.value)} required />
        </div>
        <div>
          <label className="block font-medium mb-1">Subject</label>
          <Input placeholder="Email subject" value={subject} onChange={e => setSubject(e.target.value)} required />
        </div>
        <div>
          <label className="block font-medium mb-1">Message</label>
          <Textarea placeholder="Type your message..." value={message} onChange={e => setMessage(e.target.value)} rows={6} required />
        </div>
        <div className="flex gap-2 justify-end pt-4">
          <Button variant="outline" onClick={() => router.push(`/dashboard/orders/${orderId}`)}>Cancel</Button>
          <Button onClick={handleSend}>Send Email</Button>
        </div>
      </div>
    </div>
  );
} 
 
 