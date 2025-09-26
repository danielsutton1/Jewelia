"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StarRating } from "./star-rating"
import type { ServiceRequestFeedback } from "@/types/service-request"

interface FeedbackFormProps {
  requestId: string
  providerId: string
  providerName: string
  existingFeedback?: ServiceRequestFeedback
  onSubmit: (feedback: Omit<ServiceRequestFeedback, "id" | "createdAt">) => void
}

export function FeedbackForm({ requestId, providerId, providerName, existingFeedback, onSubmit }: FeedbackFormProps) {
  const [overallRating, setOverallRating] = useState(existingFeedback?.rating || 0)
  const [qualityRating, setQualityRating] = useState(existingFeedback?.categories.quality || 0)
  const [communicationRating, setCommunicationRating] = useState(existingFeedback?.categories.communication || 0)
  const [timelinessRating, setTimelinessRating] = useState(existingFeedback?.categories.timeliness || 0)
  const [valueRating, setValueRating] = useState(existingFeedback?.categories.value || 0)
  const [comment, setComment] = useState(existingFeedback?.comment || "")
  const [publicReview, setPublicReview] = useState(existingFeedback?.publicReview || false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const feedback = {
      requestId,
      providerId,
      rating: overallRating,
      comment,
      createdBy: "Current User", // In a real app, this would be the current user
      categories: {
        quality: qualityRating,
        communication: communicationRating,
        timeliness: timelinessRating,
        value: valueRating,
      },
      publicReview,
    }

    onSubmit(feedback)
  }

  const isFormValid = () => {
    return overallRating > 0 && comment.trim().length > 0
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Provider Feedback</CardTitle>
        <CardDescription>Rate your experience with {providerName} for this service request</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-base">Overall Rating</Label>
            <div className="mt-2">
              <StarRating rating={overallRating} onChange={setOverallRating} size="large" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Quality of Work</Label>
              <div className="mt-1">
                <StarRating rating={qualityRating} onChange={setQualityRating} />
              </div>
            </div>
            <div>
              <Label>Communication</Label>
              <div className="mt-1">
                <StarRating rating={communicationRating} onChange={setCommunicationRating} />
              </div>
            </div>
            <div>
              <Label>Timeliness</Label>
              <div className="mt-1">
                <StarRating rating={timelinessRating} onChange={setTimelinessRating} />
              </div>
            </div>
            <div>
              <Label>Value for Money</Label>
              <div className="mt-1">
                <StarRating rating={valueRating} onChange={setValueRating} />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="comment">Comments</Label>
            <Textarea
              id="comment"
              placeholder="Share your experience with this provider..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-1 min-h-[120px]"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="public-review"
              checked={publicReview}
              onCheckedChange={(checked) => setPublicReview(checked as boolean)}
            />
            <Label htmlFor="public-review" className="text-sm">
              Make this review public to other users
            </Label>
          </div>

          <Button type="submit" disabled={!isFormValid()}>
            Submit Feedback
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
