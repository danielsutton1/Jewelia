'use client'

import { Switch } from "@/components/ui/switch"
import { useDemo } from "@/lib/demo-context"
import { Label } from "@/components/ui/label"

export function DemoModeToggle() {
  const { isDemoMode, toggleDemoMode } = useDemo()

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="demo-mode"
        checked={isDemoMode}
        onCheckedChange={toggleDemoMode}
      />
      <Label htmlFor="demo-mode" className="text-sm font-medium">
        Demo Mode
      </Label>
    </div>
  )
} 
 
 