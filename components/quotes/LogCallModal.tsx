"use client"

import { useState } from "react"
import { Phone, User, Calendar, Clock, MessageSquare, Sparkles, ArrowRight } from "lucide-react"
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

const CALL_TYPES = [
  { value: "inbound-call", label: "Inbound Call", icon: Phone },
  { value: "outbound-call", label: "Outbound Call", icon: Phone },
  { value: "walk-in", label: "Walk-in", icon: User },
  { value: "email", label: "Email", icon: MessageSquare },
  { value: "referral", label: "Referral", icon: User },
  { value: "social-media", label: "Social Media", icon: MessageSquare },
  { value: "other", label: "Other", icon: MessageSquare },
]

const CLIENT_TYPES = [
  { value: "new", label: "New Client" },
  { value: "existing", label: "Existing Client" },
  { value: "vip", label: "VIP Client" },
  { value: "referral", label: "Referral" },
]

interface LogCallModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LogCallModal({ open, onOpenChange }: LogCallModalProps) {
  const [callType, setCallType] = useState("")
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [clientType, setClientType] = useState("")
  const [callNotes, setCallNotes] = useState("")
  const [aiAnalysis, setAiAnalysis] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [suggestedNextStep, setSuggestedNextStep] = useState("")

  const handleAnalyzeNotes = async () => {
    if (!callNotes.trim()) return

    setIsAnalyzing(true)
    
    // Simulate AI analysis
    setTimeout(() => {
      const analysis = `Based on the call notes, I've identified:
      
• **Client Intent**: ${callNotes.includes('engagement') || callNotes.includes('wedding') ? 'Wedding/Engagement' : 'General inquiry'}
• **Urgency Level**: ${callNotes.includes('urgent') || callNotes.includes('soon') ? 'High' : 'Medium'}
• **Budget Range**: ${callNotes.includes('expensive') || callNotes.includes('luxury') ? 'High-end' : 'Standard'}
• **Timeline**: ${callNotes.includes('June') || callNotes.includes('wedding') ? 'Wedding timeline - 3-6 months' : 'Flexible'}

**Key Requirements Extracted:**
${callNotes.includes('diamond') ? '• Diamond jewelry requested' : ''}
${callNotes.includes('custom') ? '• Custom design needed' : ''}
${callNotes.includes('ring') ? '• Ring style preferred' : ''}

**Recommended Next Step**: Move to "Waiting to be Designed" stage and assign to design team.`

      setAiAnalysis(analysis)
      setSuggestedNextStep("waitingDesign")
      setIsAnalyzing(false)
    }, 2000)
  }

  const handleSave = () => {
    // TODO: Save call log to database/API
    console.log("Saving call log:", {
      callType,
      clientName,
      clientEmail,
      clientPhone,
      clientType,
      callNotes,
      aiAnalysis,
      suggestedNextStep,
    })
    
    // Reset form
    setCallType("")
    setClientName("")
    setClientEmail("")
    setClientPhone("")
    setClientType("")
    setCallNotes("")
    setAiAnalysis("")
    setSuggestedNextStep("")
    
    onOpenChange(false)
  }

  const handleCancel = () => {
    // Reset form
    setCallType("")
    setClientName("")
    setClientEmail("")
    setClientPhone("")
    setClientType("")
    setCallNotes("")
    setAiAnalysis("")
    setSuggestedNextStep("")
    
    onOpenChange(false)
  }

  const handleMoveToNextStage = () => {
    // TODO: Move quote to next stage (waitingDesign)
    console.log("Moving to next stage:", suggestedNextStep)
    handleSave()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Phone className="h-5 w-5 text-emerald-600" />
            Log Call
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Call Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Call Type</label>
            <Select value={callType} onValueChange={setCallType}>
              <SelectTrigger>
                <SelectValue placeholder="Select call type" />
              </SelectTrigger>
              <SelectContent>
                {CALL_TYPES.map((type) => {
                  const Icon = type.icon
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Client Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Client Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Client Name</label>
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Enter client name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Client Type</label>
                <Select value={clientType} onValueChange={setClientType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLIENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@email.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Call Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Call Notes</label>
            <Textarea
              placeholder="Describe the call, client requirements, budget, timeline, etc..."
              value={callNotes}
              onChange={(e) => setCallNotes(e.target.value)}
              rows={4}
            />
            <Button
              onClick={handleAnalyzeNotes}
              disabled={!callNotes.trim() || isAnalyzing}
              className="mt-2 bg-blue-600 hover:bg-blue-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
            </Button>
          </div>

          {/* AI Analysis Results */}
          {aiAnalysis && (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                AI Analysis
              </h3>
              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-200">
                <pre className="text-sm text-blue-800 whitespace-pre-wrap font-sans">
                  {aiAnalysis}
                </pre>
              </div>
              
              {/* Suggested Next Step */}
              {suggestedNextStep && (
                <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-200">
                  <h4 className="font-medium text-emerald-800 mb-2">Suggested Next Step</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-700">
                      Move to "Waiting to be Designed"
                    </Badge>
                    <Button
                      onClick={handleMoveToNextStage}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <ArrowRight className="h-4 w-4 mr-1" />
                      Proceed
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={!callType || !clientName}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              Save Call Log
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 