"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface TermsSelectionProps {
  initialTerms?: string
  initialNotes?: string
  onSave: (data: { terms: string; notes?: string }) => void
}

export function TermsSelection({ initialTerms, initialNotes, onSave }: TermsSelectionProps) {
  const [open, setOpen] = useState(false)
  const [selectedTerms, setSelectedTerms] = useState(initialTerms || "")
  const [notes, setNotes] = useState(initialNotes || "")

  useEffect(() => {
    if (initialTerms) {
      setSelectedTerms(initialTerms)
    }
    if (initialNotes) {
      setNotes(initialNotes)
    }
  }, [initialTerms, initialNotes])

  const paymentTerms = [
    { value: "Net 30", label: "Net 30 - Payment due within 30 days" },
    { value: "Net 45", label: "Net 45 - Payment due within 45 days" },
    { value: "Net 60", label: "Net 60 - Payment due within 60 days" },
    { value: "2/10 Net 30", label: "2/10 Net 30 - 2% discount if paid within 10 days, otherwise due in 30 days" },
    { value: "COD", label: "COD - Cash On Delivery" },
    { value: "CIA", label: "CIA - Cash In Advance" },
    { value: "50% Advance", label: "50% Advance - 50% payment in advance, 50% upon delivery" },
    { value: "Letter of Credit", label: "Letter of Credit" },
    { value: "Custom", label: "Custom Terms" },
  ]

  const handleTermsSelect = (value: string) => {
    setSelectedTerms(value)
    setOpen(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      terms: selectedTerms,
      notes,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="terms-select">Payment Terms</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
              id="terms-select"
            >
              {selectedTerms || "Select payment terms..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0">
            <Command>
              <CommandInput placeholder="Search terms..." />
              <CommandList>
                <CommandEmpty>No payment terms found.</CommandEmpty>
                <CommandGroup>
                  {paymentTerms.map((term) => (
                    <CommandItem key={term.value} value={term.value} onSelect={() => handleTermsSelect(term.value)}>
                      <Check
                        className={cn("mr-2 h-4 w-4", selectedTerms === term.value ? "opacity-100" : "opacity-0")}
                      />
                      <div className="flex flex-col">
                        <span>{term.value}</span>
                        <span className="text-xs text-muted-foreground">{term.label}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional notes or terms"
          rows={4}
        />
      </div>

      <Button type="submit">Save Terms</Button>
    </form>
  )
}
