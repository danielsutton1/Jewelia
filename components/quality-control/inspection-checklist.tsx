"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Save } from "lucide-react"

interface InspectionChecklistProps {
  inspectionId: string
}

// Mock checklist data
const checklistItems = [
  {
    id: "item-integrity",
    category: "General",
    label: "Item integrity check",
    description: "Verify the item is not damaged and all components are intact",
  },
  {
    id: "gemstone-security",
    category: "Gemstones",
    label: "Gemstone security",
    description: "Ensure all gemstones are securely set",
  },
  {
    id: "prong-condition",
    category: "Gemstones",
    label: "Prong condition",
    description: "Check that prongs are properly formed and not damaged",
  },
  {
    id: "metal-finish",
    category: "Metal",
    label: "Metal finish",
    description: "Verify the metal finish is consistent and free of scratches",
  },
  {
    id: "polish-quality",
    category: "Metal",
    label: "Polish quality",
    description: "Check that the item is properly polished with no dull areas",
  },
  {
    id: "clasp-function",
    category: "Functionality",
    label: "Clasp function",
    description: "Test that clasps open and close properly",
  },
  {
    id: "hinge-movement",
    category: "Functionality",
    label: "Hinge movement",
    description: "Verify hinges move smoothly without resistance",
  },
  {
    id: "hallmark-presence",
    category: "Markings",
    label: "Hallmark presence",
    description: "Check that required hallmarks are present and legible",
  },
  {
    id: "weight-verification",
    category: "Specifications",
    label: "Weight verification",
    description: "Verify the item weight matches specifications",
  },
  {
    id: "size-verification",
    category: "Specifications",
    label: "Size verification",
    description: "Confirm the item size matches specifications",
  },
]

export function InspectionChecklist({ inspectionId }: InspectionChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})

  const handleCheckItem = (id: string, checked: boolean) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: checked,
    }))
  }

  const handleNoteChange = (id: string, note: string) => {
    setNotes((prev) => ({
      ...prev,
      [id]: note,
    }))
  }

  const saveChecklist = () => {
    // Logic to save checklist data
    console.log("Saving checklist for inspection", inspectionId)
    console.log("Checked items:", checkedItems)
    console.log("Notes:", notes)
  }

  // Group items by category
  const categorizedItems: Record<string, typeof checklistItems> = {}
  checklistItems.forEach((item) => {
    if (!categorizedItems[item.category]) {
      categorizedItems[item.category] = []
    }
    categorizedItems[item.category].push(item)
  })

  // Calculate progress
  const totalItems = checklistItems.length
  const checkedCount = Object.values(checkedItems).filter(Boolean).length
  const progressPercentage = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Inspection Checklist</CardTitle>
            <Button onClick={saveChecklist} className="gap-2">
              <Save className="h-4 w-4" />
              Save Progress
            </Button>
          </div>
          <CardDescription>Complete all checklist items to finalize the inspection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm font-medium">
                {checkedCount}/{totalItems} items
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="space-y-8">
            {Object.entries(categorizedItems).map(([category, items]) => (
              <div key={category} className="space-y-4">
                <h3 className="font-semibold text-lg">{category}</h3>
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="space-y-2">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={item.id}
                          checked={checkedItems[item.id] || false}
                          onCheckedChange={(checked) => handleCheckItem(item.id, checked as boolean)}
                          className="mt-1"
                        />
                        <div className="space-y-1 w-full">
                          <Label htmlFor={item.id} className="font-medium">
                            {item.label}
                          </Label>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                          <Textarea
                            placeholder="Add notes (optional)"
                            className="mt-2 h-20"
                            value={notes[item.id] || ""}
                            onChange={(e) => handleNoteChange(item.id, e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
