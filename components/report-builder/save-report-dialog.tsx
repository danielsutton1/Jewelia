"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface SaveReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SaveReportDialog({ open, onOpenChange }: SaveReportDialogProps) {
  const [reportName, setReportName] = useState("")
  const [description, setDescription] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [addToFavorites, setAddToFavorites] = useState(false)

  const handleSave = () => {
    // Logic to save the report
    console.log("Saving report:", {
      name: reportName,
      description,
      isPublic,
      addToFavorites,
    })

    // Reset form and close dialog
    setReportName("")
    setDescription("")
    setIsPublic(false)
    setAddToFavorites(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Report</DialogTitle>
          <DialogDescription>Save this report to access it later or share with your team.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="report-name">Report Name</Label>
            <Input
              id="report-name"
              placeholder="Enter report name"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter report description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="public" checked={isPublic} onCheckedChange={(checked) => setIsPublic(checked as boolean)} />
            <Label htmlFor="public" className="text-sm font-normal">
              Make this report public to all team members
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="favorites"
              checked={addToFavorites}
              onCheckedChange={(checked) => setAddToFavorites(checked as boolean)}
            />
            <Label htmlFor="favorites" className="text-sm font-normal">
              Add to favorites
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!reportName}>
            Save Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
