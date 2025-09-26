"use client"

import { useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const SEGMENT_LABELS: Record<string, string> = {
  vip: "VIP Customers",
  regular: "Regular Buyers",
  occasional: "Occasional Buyers",
  new: "New Customers",
  "at-risk": "At Risk",
}

function CreateCampaignForm() {
  const searchParams = useSearchParams()
  const segment = searchParams.get("segment")
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [schedule, setSchedule] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !message) {
      toast.error("Please fill in all required fields.")
      return
    }
    setSubmitting(true)
    setTimeout(() => {
      toast.success("Campaign created and scheduled!")
      setSubmitting(false)
    }, 1500)
  }

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-6 md:py-10 px-3 sm:px-4 md:px-6">
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl md:text-2xl">Create Campaign</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {segment && (
            <div className="mb-3 sm:mb-4 p-3 rounded bg-muted">
              <div className="font-semibold text-xs sm:text-sm mb-1">Target Segment:</div>
              <div className="text-sm sm:text-base">{SEGMENT_LABELS[segment] || segment}</div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Campaign Name</label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter campaign name"
                required
                className="min-h-[44px] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Message</label>
              <Textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Write your campaign message..."
                rows={5}
                required
                className="text-sm min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Schedule (optional)</label>
              <Input
                type="datetime-local"
                value={schedule}
                onChange={e => setSchedule(e.target.value)}
                className="min-h-[44px] text-sm"
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full min-h-[44px] text-sm sm:text-base">
              {submitting ? "Creating..." : "Create Campaign"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CreateCampaignPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto py-4 sm:py-6 md:py-10 px-3 sm:px-4 md:px-6">Loading...</div>}>
      <CreateCampaignForm />
    </Suspense>
  )
} 