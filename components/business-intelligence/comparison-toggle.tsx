"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface ComparisonToggleProps {
  showComparison: boolean
  setShowComparison: (show: boolean) => void
}

export function ComparisonToggle({ showComparison, setShowComparison }: ComparisonToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <Switch id="comparison" checked={showComparison} onCheckedChange={setShowComparison} />
      <Label htmlFor="comparison">Compare to previous period</Label>
    </div>
  )
}
