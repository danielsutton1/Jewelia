"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

// Mock customer data (same as details/edit pages)
const mockCustomers = [
  {
    id: "CUST-001",
    name: "Olivia Martin",
    company: "Martin Jewelers",
    email: "olivia.martin@email.com",
    phone: "+1 (555) 123-4567",
    status: "Active",
  },
  {
    id: "CUST-002",
    name: "Jackson Lee",
    company: "Lee Fine Gems",
    email: "jackson.lee@email.com",
    phone: "+1 (555) 234-5678",
    status: "Active",
  },
  {
    id: "CUST-003",
    name: "Isabella Nguyen",
    company: "Nguyen Luxury",
    email: "isabella.nguyen@email.com",
    phone: "+1 (555) 345-6789",
    status: "Inactive",
  },
  // ... add more as needed
]

export default function SendEmailToCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params?.id as string;
  const customer = mockCustomers.find((c) => c.id === customerId);

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, send email via API here
    toast({ title: "Email sent", description: `Email sent to ${customer?.email}` });
    router.push(`/dashboard/customers/${customerId}`);
  };

  if (!customer) {
    return (
      <div className="container mx-auto py-10 max-w-lg text-destructive">
        Customer not found.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 max-w-lg">
      <h1 className="text-3xl font-bold mb-4">Send Email to Customer</h1>
      <p className="mb-2">Customer ID: <span className="font-mono">{customerId}</span></p>
      <form onSubmit={handleSend} className="p-6 border rounded-md bg-muted space-y-6">
        <div className="space-y-2">
          <label htmlFor="to" className="font-medium">To</label>
          <Input id="to" value={customer.email} readOnly />
        </div>
        <div className="space-y-2">
          <label htmlFor="subject" className="font-medium">Subject</label>
          <Input id="subject" value={subject} onChange={e => setSubject(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <label htmlFor="message" className="font-medium">Message</label>
          <Textarea id="message" value={message} onChange={e => setMessage(e.target.value)} rows={6} required />
        </div>
        <div className="flex gap-2 justify-end pt-4">
          <Button variant="outline" type="button" onClick={() => router.push(`/dashboard/customers/${customerId}`)}>Cancel</Button>
          <Button type="submit" disabled={!subject || !message}>Send Email</Button>
        </div>
      </form>
    </div>
  );
} 
 
 