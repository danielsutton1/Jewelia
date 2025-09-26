"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  Settings, 
  Save, 
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Target,
  Users,
  Bell,
  Camera,
  FileText,
  Shield,
  Zap,
  Download,
  Upload,
  Eye,
  Plus,
  Trash2
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface QualitySettings {
  passRateThreshold: number
  efficiencyTarget: number
  maxInspectionTime: number
  autoEscalation: boolean
  photoRequired: boolean
  signatureRequired: boolean
  notifications: {
    failureAlert: boolean
    backlogWarning: boolean
    performanceReport: boolean
    qualityTrends: boolean
  }
  standards: {
    stoneSetting: {
      tolerance: number
      requiredChecks: string[]
    }
    finishQuality: {
      tolerance: number
      requiredChecks: string[]
    }
    measurements: {
      tolerance: number
      requiredChecks: string[]
    }
    metalQuality: {
      tolerance: number
      requiredChecks: string[]
    }
  }
  automation: {
    autoAssign: boolean
    priorityQueue: boolean
    qualityGates: boolean
    retestRules: boolean
  }
}

const defaultSettings: QualitySettings = {
  passRateThreshold: 90,
  efficiencyTarget: 85,
  maxInspectionTime: 20,
  autoEscalation: true,
  photoRequired: true,
  signatureRequired: true,
  notifications: {
    failureAlert: true,
    backlogWarning: true,
    performanceReport: false,
    qualityTrends: true,
  },
  standards: {
    stoneSetting: {
      tolerance: 0.1,
      requiredChecks: ["Security", "Alignment", "Polish", "Setting Height"]
    },
    finishQuality: {
      tolerance: 0.05,
      requiredChecks: ["Surface Finish", "Polish", "Scratches", "Consistency"]
    },
    measurements: {
      tolerance: 0.2,
      requiredChecks: ["Ring Size", "Stone Dimensions", "Weight", "Thickness"]
    },
    metalQuality: {
      tolerance: 0.1,
      requiredChecks: ["Purity", "Color", "Hardness", "Finish"]
    }
  },
  automation: {
    autoAssign: true,
    priorityQueue: true,
    qualityGates: true,
    retestRules: true,
  },
}

export function QualitySettings() {
  const [settings, setSettings] = React.useState<QualitySettings>(defaultSettings)
  const [isSaving, setIsSaving] = React.useState(false)
  const [hasChanges, setHasChanges] = React.useState(false)
  const [isExporting, setIsExporting] = React.useState(false)
  const [isImporting, setIsImporting] = React.useState(false)

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleNestedSettingChange = (parentKey: keyof QualitySettings, childKey: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [parentKey]: {
        ...(prev[parentKey] as any),
        [childKey]: value
      }
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setHasChanges(false)
      toast({
        title: "Settings Saved",
        description: "Quality control settings have been updated successfully."
      })
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setSettings(defaultSettings)
    setHasChanges(true)
    toast({
      title: "Settings Reset",
      description: "Settings have been reset to default values."
    })
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Create JSON export
      const exportData = {
        settings,
        exportDate: new Date().toISOString(),
        version: "1.0"
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `quality-settings-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Export Complete",
        description: "Quality control settings have been exported successfully."
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export settings. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = () => {
    setIsImporting(true)
    try {
      // Simulate import process
      setTimeout(() => {
        toast({
          title: "Import Complete",
          description: "Quality control settings have been imported successfully."
        })
        setIsImporting(false)
      }, 1500)
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import settings. Please try again.",
        variant: "destructive"
      })
      setIsImporting(false)
    }
  }

  const handleViewStandards = (category: string) => {
    toast({
      title: "View Standards",
      description: `Opening detailed standards for ${category}...`
    })
    // In a real app, this would open a detailed standards view
  }

  const handleAddCheck = (category: keyof QualitySettings['standards']) => {
    toast({
      title: "Add Check",
      description: `Adding new check to ${category} standards...`
    })
    // In a real app, this would open an add check dialog
  }

  const handleRemoveCheck = (category: keyof QualitySettings['standards'], check: string) => {
    toast({
      title: "Remove Check",
      description: `Removing "${check}" from ${category} standards...`
    })
    // In a real app, this would remove the check
  }

  const handleTestAutomation = () => {
    toast({
      title: "Test Automation",
      description: "Running automation rules test..."
    })
    // In a real app, this would test the automation rules
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quality Control Settings</h2>
          <p className="text-muted-foreground">
            Configure quality standards, thresholds, and automation rules
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
          <Button variant="outline" onClick={handleImport} disabled={isImporting}>
            <Upload className="h-4 w-4 mr-2" />
            {isImporting ? "Importing..." : "Import"}
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quality Thresholds */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Quality Thresholds
            </CardTitle>
            <CardDescription>Set minimum quality standards and targets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Pass Rate Threshold (%)</Label>
              <Input
                type="number"
                value={settings.passRateThreshold}
                onChange={(e) => handleSettingChange("passRateThreshold", parseFloat(e.target.value))}
                min="0"
                max="100"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label>Efficiency Target (%)</Label>
              <Input
                type="number"
                value={settings.efficiencyTarget}
                onChange={(e) => handleSettingChange("efficiencyTarget", parseFloat(e.target.value))}
                min="0"
                max="100"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label>Maximum Inspection Time (minutes)</Label>
              <Input
                type="number"
                value={settings.maxInspectionTime}
                onChange={(e) => handleSettingChange("maxInspectionTime", parseInt(e.target.value))}
                min="1"
                max="60"
              />
            </div>
          </CardContent>
        </Card>

        {/* Inspection Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Inspection Requirements
            </CardTitle>
            <CardDescription>Configure mandatory inspection elements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Photo Documentation Required</Label>
                <p className="text-sm text-muted-foreground">
                  Require photos for all inspections
                </p>
              </div>
              <Switch
                checked={settings.photoRequired}
                onCheckedChange={(checked) => handleSettingChange("photoRequired", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Digital Signature Required</Label>
                <p className="text-sm text-muted-foreground">
                  Require inspector signature
                </p>
              </div>
              <Switch
                checked={settings.signatureRequired}
                onCheckedChange={(checked) => handleSettingChange("signatureRequired", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-Escalation</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically escalate failed inspections
                </p>
              </div>
              <Switch
                checked={settings.autoEscalation}
                onCheckedChange={(checked) => handleSettingChange("autoEscalation", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure alert and notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Failure Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Notify on inspection failures
                </p>
              </div>
              <Switch
                checked={settings.notifications.failureAlert}
                onCheckedChange={(checked) => handleNestedSettingChange("notifications", "failureAlert", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Backlog Warnings</Label>
                <p className="text-sm text-muted-foreground">
                  Alert on inspection backlog
                </p>
              </div>
              <Switch
                checked={settings.notifications.backlogWarning}
                onCheckedChange={(checked) => handleNestedSettingChange("notifications", "backlogWarning", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Performance Reports</Label>
                <p className="text-sm text-muted-foreground">
                  Weekly performance summaries
                </p>
              </div>
              <Switch
                checked={settings.notifications.performanceReport}
                onCheckedChange={(checked) => handleNestedSettingChange("notifications", "performanceReport", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Quality Trends</Label>
                <p className="text-sm text-muted-foreground">
                  Monthly quality trend reports
                </p>
              </div>
              <Switch
                checked={settings.notifications.qualityTrends}
                onCheckedChange={(checked) => handleNestedSettingChange("notifications", "qualityTrends", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Automation Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Automation Rules
            </CardTitle>
            <CardDescription>Configure automated quality control processes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-Assign Inspections</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically assign inspections to available inspectors
                </p>
              </div>
              <Switch
                checked={settings.automation.autoAssign}
                onCheckedChange={(checked) => handleNestedSettingChange("automation", "autoAssign", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Priority Queue</Label>
                <p className="text-sm text-muted-foreground">
                  Prioritize urgent inspections
                </p>
              </div>
              <Switch
                checked={settings.automation.priorityQueue}
                onCheckedChange={(checked) => handleNestedSettingChange("automation", "priorityQueue", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Quality Gates</Label>
                <p className="text-sm text-muted-foreground">
                  Enforce quality checkpoints
                </p>
              </div>
              <Switch
                checked={settings.automation.qualityGates}
                onCheckedChange={(checked) => handleNestedSettingChange("automation", "qualityGates", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Retest Rules</Label>
                <p className="text-sm text-muted-foreground">
                  Automatic retest scheduling
                </p>
              </div>
              <Switch
                checked={settings.automation.retestRules}
                onCheckedChange={(checked) => handleNestedSettingChange("automation", "retestRules", checked)}
              />
            </div>
            <Button variant="outline" onClick={handleTestAutomation} className="w-full">
              <Zap className="h-4 w-4 mr-2" />
              Test Automation Rules
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quality Standards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Quality Standards
          </CardTitle>
          <CardDescription>Define inspection standards and tolerances for each category</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(settings.standards).map(([category, standard]) => (
            <div key={category} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium capitalize">{category.replace(/([A-Z])/g, ' $1')}</h3>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewStandards(category)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleAddCheck(category as keyof QualitySettings['standards'])}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Check
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tolerance (±mm)</Label>
                  <Input
                    type="number"
                    value={standard.tolerance}
                    onChange={(e) => handleNestedSettingChange("standards" as keyof QualitySettings, category, {
                      ...standard,
                      tolerance: parseFloat(e.target.value)
                    })}
                    step="0.01"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Required Checks</Label>
                  <div className="space-y-2">
                    {standard.requiredChecks.map((check, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-md border">
                        <span className="text-sm">{check}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveCheck(category as keyof QualitySettings['standards'], check)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <Separator />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
} 
 