"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import FileUpload from "./file-upload"

interface DocumentSharingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: () => void
}

export default function DocumentSharingDialog({ open, onOpenChange, onComplete }: DocumentSharingDialogProps) {
  const [partner, setPartner] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // In a real app, this would send the data to the API
    console.log({
      partner,
      title,
      description,
      files: uploadedFiles,
    })

    onComplete()
  }

  const handleUploadComplete = (files: File[]) => {
    setUploadedFiles(files)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Share Documents</DialogTitle>
            <DialogDescription>Upload and share documents with your partners.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="partner">Partner</Label>
              <Select value={partner} onValueChange={setPartner}>
                <SelectTrigger id="partner">
                  <SelectValue placeholder="Select partner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="partner-1">Goldsmith Supplies</SelectItem>
                  <SelectItem value="partner-2">Diamond Direct</SelectItem>
                  <SelectItem value="partner-3">Precision Casting</SelectItem>
                  <SelectItem value="partner-4">Artisan Engraving</SelectItem>
                  <SelectItem value="partner-5">Master Plating</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Document title" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the documents"
              />
            </div>

            <div className="space-y-2">
              <Label>Documents</Label>
              <FileUpload onUploadComplete={handleUploadComplete} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!partner || !title || uploadedFiles.length === 0}>
              Share Documents
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
