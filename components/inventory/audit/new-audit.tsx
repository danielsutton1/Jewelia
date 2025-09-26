"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LocationSelection } from "./audit-steps/location-selection"
import { AuditSetup } from "./audit-steps/audit-setup"
import { InventoryScanning } from "./audit-steps/inventory-scanning"
import { DiscrepancyReview } from "./audit-steps/discrepancy-review"
import { AuditCompletion } from "./audit-steps/audit-completion"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Save } from "lucide-react"

export function NewAudit() {
  const [currentStep, setCurrentStep] = useState(1)
  const [auditData, setAuditData] = useState({
    name: "",
    description: "",
    locations: [],
    assignedUsers: [],
    isBlindCount: false,
    startDate: new Date(),
    expectedEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    scannedItems: [],
    discrepancies: [],
  })

  const totalSteps = 5
  const progress = (currentStep / totalSteps) * 100

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSave = () => {
    // In a real app, this would save the audit data to the server
    console.log("Saving audit data:", auditData)
    alert("Audit saved successfully!")
  }

  const updateAuditData = (data: Partial<typeof auditData>) => {
    setAuditData({ ...auditData, ...data })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">New Physical Inventory Audit</h2>
        <Button variant="outline" onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Draft
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>
            Step {currentStep} of {totalSteps}
          </span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {currentStep === 1 && <AuditSetup auditData={auditData} updateAuditData={updateAuditData} />}
          {currentStep === 2 && <LocationSelection auditData={auditData} updateAuditData={updateAuditData} />}
          {currentStep === 3 && <InventoryScanning auditData={auditData} updateAuditData={updateAuditData} />}
          {currentStep === 4 && <DiscrepancyReview auditData={auditData} updateAuditData={updateAuditData} />}
          {currentStep === 5 && <AuditCompletion auditData={auditData} />}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        {currentStep < totalSteps ? (
          <Button onClick={handleNext}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={() => alert("Audit completed!")}>Complete Audit</Button>
        )}
      </div>
    </div>
  )
}
