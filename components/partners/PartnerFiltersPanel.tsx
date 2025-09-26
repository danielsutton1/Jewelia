import { PartnerCategory, PartnerSpecialty } from "@/types/partner-management"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"

interface PartnerFilters {
  search: string
  specialties: PartnerSpecialty[]
  location: string
  minRating: number
  connectionStatus: "all" | "connected" | "pending" | "not_connected"
}

interface PartnerFiltersPanelProps {
  filters: PartnerFilters
  onChange: (filters: PartnerFilters) => void
}

const specialtyOptions: PartnerSpecialty[] = [
  "casting",
  "stone-setter",
  "polisher",
  "cad-designer",
  "appraiser",
  "consignment-partner",
  "all"
]

const locationOptions = ["New York", "Los Angeles", "London", "Bangkok", "Dubai"] // TODO: Supabase

export function PartnerFiltersPanel({ filters, onChange }: PartnerFiltersPanelProps) {
  const [local, setLocal] = useState<PartnerFilters>({ ...filters, specialties: (filters.specialties.length ? filters.specialties : ["all"]) as PartnerSpecialty[] })

  const handleApply = () => onChange(local)
  const handleReset = () => {
    const reset: PartnerFilters = { search: "", specialties: ["all"], location: "", minRating: 0, connectionStatus: "all" }
    setLocal(reset)
    onChange(reset)
  }

  const handleSpecialtyChange = (spec: PartnerSpecialty, checked: boolean) => {
    setLocal(f => {
      if (spec === "all") {
        return { ...f, specialties: ["all"] as PartnerSpecialty[] }
      }
      const newSpecialties: PartnerSpecialty[] = checked
        ? [...f.specialties.filter(s => s !== "all"), spec]
        : f.specialties.filter(s => s !== spec)
      return { ...f, specialties: newSpecialties.length ? newSpecialties : ["all"] as PartnerSpecialty[] }
    })
  }

  return (
    <div className="flex flex-wrap gap-4 items-end mb-6">
      <Input
        placeholder="Search companies..."
        value={local.search}
        onChange={e => setLocal(f => ({ ...f, search: e.target.value }))}
        className="w-56"
      />
      <div>
        <label className="block text-xs mb-1">Specialties</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-56 justify-between">
              {local.specialties.length === 0
                ? "Select specialties"
                : local.specialties.map(spec =>
                    spec.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                  ).join(", ")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2">
            <div className="flex flex-col gap-1">
              {specialtyOptions.map(spec => (
                <label key={spec} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={local.specialties.includes(spec)}
                    onCheckedChange={checked => handleSpecialtyChange(spec, checked as boolean)}
                  />
                  <span>{spec.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div>
        <label className="block text-xs mb-1">Location</label>
        <select
          value={local.location}
          onChange={e => setLocal(f => ({ ...f, location: e.target.value }))}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="">All</option>
          {locationOptions.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs mb-1">Min Rating</label>
        <input
          type="number"
          min={0}
          max={5}
          step={0.1}
          value={local.minRating}
          onChange={e => setLocal(f => ({ ...f, minRating: Number(e.target.value) }))}
          className="border rounded px-2 py-1 w-16 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs mb-1">Status</label>
        <select
          value={local.connectionStatus}
          onChange={e => setLocal(f => ({ ...f, connectionStatus: e.target.value as PartnerFilters["connectionStatus"] }))}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="all">All</option>
          <option value="connected">Connected</option>
          <option value="pending">Pending</option>
          <option value="not_connected">Not Connected</option>
        </select>
      </div>
      <Button onClick={handleApply} className="ml-2">Apply</Button>
      <Button variant="outline" onClick={handleReset}>Reset</Button>
    </div>
  )
} 