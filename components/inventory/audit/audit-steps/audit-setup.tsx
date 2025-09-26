"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { MultiSelect } from "./multi-select"

interface AuditSetupProps {
  auditData: any
  updateAuditData: (data: any) => void
}

export function AuditSetup({ auditData, updateAuditData }: AuditSetupProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(auditData.startDate)
  const [endDate, setEndDate] = useState<Date | undefined>(auditData.expectedEndDate)

  // Mock users for assignment
  const availableUsers = [
    { value: "user1", label: "John Doe" },
    { value: "user2", label: "Jane Smith" },
    { value: "user3", label: "Alice Johnson" },
    { value: "user4", label: "Bob Wilson" },
    { value: "user5", label: "Carol Martinez" },
  ]

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateAuditData({ name: e.target.value })
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateAuditData({ description: e.target.value })
  }

  const handleBlindCountChange = (checked: boolean) => {
    updateAuditData({ isBlindCount: checked })
  }

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date)
    if (date) {
      updateAuditData({ startDate: date })
    }
  }

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date)
    if (date) {
      updateAuditData({ expectedEndDate: date })
    }
  }

  const handleUserAssignment = (selectedUsers: string[]) => {
    updateAuditData({ assignedUsers: selectedUsers })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Audit Setup</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Configure the basic settings for your physical inventory audit.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="audit-name">Audit Name</Label>
          <Input
            id="audit-name"
            placeholder="e.g., Q2 2023 Main Showroom Audit"
            value={auditData.name}
            onChange={handleNameChange}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="audit-description">Description</Label>
          <Textarea
            id="audit-description"
            placeholder="Brief description of the audit purpose and scope"
            value={auditData.description}
            onChange={handleDescriptionChange}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={startDate} onSelect={handleStartDateChange} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Expected Completion Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={endDate} onSelect={handleEndDateChange} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Assign Users</Label>
          <MultiSelect
            options={availableUsers}
            selectedValues={auditData.assignedUsers}
            onChange={handleUserAssignment}
            placeholder="Select users to participate in this audit"
          />
          <p className="text-xs text-muted-foreground mt-1">
            These users will have access to contribute to the audit process.
          </p>
        </div>

        <div className="flex items-center justify-between space-x-2 pt-2">
          <div className="space-y-0.5">
            <Label htmlFor="blind-count">Blind Count Mode</Label>
            <p className="text-sm text-muted-foreground">
              Counters won't see expected quantities during the audit process
            </p>
          </div>
          <Switch id="blind-count" checked={auditData.isBlindCount} onCheckedChange={handleBlindCountChange} />
        </div>
      </div>
    </div>
  )
}
