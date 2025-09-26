"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useRef } from "react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function ReportIssueDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [issueDetails, setIssueDetails] = useState({
    customer: "",
    issueNumber: `ISS-${Date.now().toString().slice(-6)}`,
    dateReported: new Date().toISOString().split('T')[0],
    issueType: "",
    priority: "",
    status: "open",
    staff: "",
    assignedTo: "",
    description: "",
    relatedOrder: "",
    relatedQuote: "",
    expectedResolution: "",
    internalNotes: "",
    attachments: [] as File[]
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setIssueDetails(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }))
  }

  const removeFile = (index: number) => {
    setIssueDetails(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Issue reported successfully!")
    setIssueDetails({
      customer: "",
      issueNumber: `ISS-${Date.now().toString().slice(-6)}`,
      dateReported: new Date().toISOString().split('T')[0],
      issueType: "",
      priority: "",
      status: "open",
      staff: "",
      assignedTo: "",
      description: "",
      relatedOrder: "",
      relatedQuote: "",
      expectedResolution: "",
      internalNotes: "",
      attachments: []
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Issue</DialogTitle>
          <DialogDescription>
            Log a customer complaint, repair request, or service issue with full tracking.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Header Information */}
            <div className="grid grid-cols-2 gap-4">
              <Input 
                placeholder="Customer Name or ID" 
                value={issueDetails.customer} 
                onChange={(e) => setIssueDetails({...issueDetails, customer: e.target.value})}
                required
              />
              <Input 
                placeholder="Issue Number" 
                value={issueDetails.issueNumber} 
                onChange={(e) => setIssueDetails({...issueDetails, issueNumber: e.target.value})}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input 
                type="date"
                placeholder="Date Reported" 
                value={issueDetails.dateReported} 
                onChange={(e) => setIssueDetails({...issueDetails, dateReported: e.target.value})}
                required
              />
              <Input 
                placeholder="Staff Member" 
                value={issueDetails.staff} 
                onChange={(e) => setIssueDetails({...issueDetails, staff: e.target.value})}
              />
            </div>

            {/* Issue Classification */}
            <div className="grid grid-cols-3 gap-4">
              <Select onValueChange={(value) => setIssueDetails({...issueDetails, issueType: value})} required>
                <SelectTrigger>
                  <SelectValue placeholder="Issue Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="repair">Jewelry Repair</SelectItem>
                  <SelectItem value="product-defect">Product Defect</SelectItem>
                  <SelectItem value="sizing-issue">Sizing Issue</SelectItem>
                  <SelectItem value="service-complaint">Service Complaint</SelectItem>
                  <SelectItem value="shipping-issue">Shipping Issue</SelectItem>
                  <SelectItem value="billing-error">Billing Error</SelectItem>
                  <SelectItem value="warranty-claim">Warranty Claim</SelectItem>
                  <SelectItem value="custom-design-issue">Custom Design Issue</SelectItem>
                  <SelectItem value="appointment-issue">Appointment Issue</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={(value) => setIssueDetails({...issueDetails, priority: value})} required>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={(value) => setIssueDetails({...issueDetails, status: value})} required>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority and Status Display */}
            <div className="flex gap-4">
              {issueDetails.priority && (
                <Badge className={getPriorityColor(issueDetails.priority)}>
                  Priority: {issueDetails.priority.charAt(0).toUpperCase() + issueDetails.priority.slice(1)}
                </Badge>
              )}
              {issueDetails.status && (
                <Badge className={getStatusColor(issueDetails.status)}>
                  Status: {issueDetails.status.replace('-', ' ').charAt(0).toUpperCase() + issueDetails.status.replace('-', ' ').slice(1)}
                </Badge>
              )}
            </div>

            {/* Assignment and Related Items */}
            <div className="grid grid-cols-3 gap-4">
              <Input 
                placeholder="Assign To Staff" 
                value={issueDetails.assignedTo} 
                onChange={(e) => setIssueDetails({...issueDetails, assignedTo: e.target.value})}
              />
              <Input 
                placeholder="Related Order #" 
                value={issueDetails.relatedOrder} 
                onChange={(e) => setIssueDetails({...issueDetails, relatedOrder: e.target.value})}
              />
              <Input 
                placeholder="Related Quote #" 
                value={issueDetails.relatedQuote} 
                onChange={(e) => setIssueDetails({...issueDetails, relatedQuote: e.target.value})}
              />
            </div>

            {/* Expected Resolution */}
            <div>
              <label className="text-sm font-medium">Expected Resolution Date</label>
              <Input 
                type="date"
                placeholder="Expected Resolution Date" 
                value={issueDetails.expectedResolution} 
                onChange={(e) => setIssueDetails({...issueDetails, expectedResolution: e.target.value})}
              />
            </div>

            {/* File Attachments */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Attachments (Photos/Documents)</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Files
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              {issueDetails.attachments.length > 0 && (
                <div className="space-y-2">
                  {issueDetails.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm truncate">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description and Notes */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Issue Description</label>
                <Textarea 
                  placeholder="Detailed description of the issue..."
                  value={issueDetails.description} 
                  onChange={(e) => setIssueDetails({...issueDetails, description: e.target.value})}
                  required
                  rows={6}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Internal Notes (Private)</label>
                <Textarea 
                  placeholder="Internal notes for staff..."
                  value={issueDetails.internalNotes} 
                  onChange={(e) => setIssueDetails({...issueDetails, internalNotes: e.target.value})}
                  rows={6}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Report Issue</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
 