"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, X, Upload, Camera } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

interface CheckpointProps {
  title: string
  description: string
  checkpoint: {
    passed: boolean | null
    notes: string
    severity: string
    measurements: string
    photoUrl: string
  }
  onChange: (field: string, value: any) => void
}

export function CheckpointCategory({ title, description, checkpoint, onChange }: CheckpointProps) {
  const isMobile = useMobile()
  const [showCamera, setShowCamera] = useState(false)

  const handleFileChange = (e: any) => {
    const file = e.target.files[0]
    if (file) {
      // In a real app, you would upload this file to your server
      // For now, we'll just create a local URL
      const url = URL.createObjectURL(file)
      onChange("photoUrl", url)
    }
  }

  const handleCameraCapture = () => {
    // Toggle camera interface
    setShowCamera(!showCamera)
  }

  const simulateCameraCapture = () => {
    // In a real app, this would capture from the device camera
    // For now, we'll just simulate with a placeholder
    onChange("photoUrl", "/placeholder-pmjx2.png")
    setShowCamera(false)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <Label>Pass/Fail Assessment</Label>
            <RadioGroup
              className="flex space-x-4 mt-2"
              value={checkpoint.passed === null ? undefined : checkpoint.passed ? "pass" : "fail"}
              onValueChange={(value) => onChange("passed", value === "pass")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pass" id={`${title}-pass`} />
                <Label htmlFor={`${title}-pass`} className="flex items-center">
                  <Check className="h-4 w-4 mr-1 text-green-500" />
                  Pass
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fail" id={`${title}-fail`} />
                <Label htmlFor={`${title}-fail`} className="flex items-center">
                  <X className="h-4 w-4 mr-1 text-red-500" />
                  Fail
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor={`${title}-measurements`}>Measurements</Label>
            <Input
              id={`${title}-measurements`}
              placeholder="Enter relevant measurements"
              value={checkpoint.measurements}
              onChange={(e) => onChange("measurements", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor={`${title}-severity`}>Severity Level</Label>
            <Select value={checkpoint.severity} onValueChange={(value) => onChange("severity", value)}>
              <SelectTrigger id={`${title}-severity`}>
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Photo Evidence</Label>
            <div className="mt-2 flex flex-col space-y-2">
              <div className="flex space-x-2">
                <div className="relative border rounded-md p-1 flex-1">
                  <Label
                    htmlFor={`${title}-photo`}
                    className="flex flex-col items-center justify-center cursor-pointer p-4 border-2 border-dashed rounded-md h-32"
                  >
                    {checkpoint.photoUrl ? (
                      <img
                        src={checkpoint.photoUrl || "/placeholder.svg"}
                        alt="Inspection photo"
                        className="max-h-full object-contain"
                      />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Upload photo</span>
                      </>
                    )}
                  </Label>
                  <Input
                    id={`${title}-photo`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                {isMobile && (
                  <Button type="button" variant="outline" size="icon" onClick={handleCameraCapture}>
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {showCamera && (
                <div className="border rounded-md p-4">
                  <div className="bg-slate-200 h-40 flex items-center justify-center mb-2">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={simulateCameraCapture}
                  >
                    Capture Photo
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor={`${title}-notes`}>Notes</Label>
            <Textarea
              id={`${title}-notes`}
              placeholder="Enter detailed notes about this aspect"
              value={checkpoint.notes}
              onChange={(e) => onChange("notes", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
