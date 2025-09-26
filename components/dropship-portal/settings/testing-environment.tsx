"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Play, RefreshCw, StopCircle } from "lucide-react"
import { copyToClipboard } from "@/components/ui/utils";

export function TestingEnvironment() {
  const [testingEnabled, setTestingEnabled] = useState(true)
  const [testingMode, setTestingMode] = useState("sandbox")
  const [testingStatus, setTestingStatus] = useState("ready")
  const [isRunning, setIsRunning] = useState(false)

  const handleStartTest = () => {
    setIsRunning(true)
    setTestingStatus("running")
    // Simulate test completion after 3 seconds
    setTimeout(() => {
      setIsRunning(false)
      setTestingStatus("completed")
    }, 3000)
  }

  const handleStopTest = () => {
    setIsRunning(false)
    setTestingStatus("stopped")
  }

  const handleResetEnvironment = () => {
    setTestingStatus("ready")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Testing Environment</h3>
          <p className="text-sm text-muted-foreground">Configure and control your testing environment</p>
        </div>
        <Badge
          variant="outline"
          className={
            testingStatus === "ready"
              ? "bg-blue-50 text-blue-700 border-blue-200 gap-1"
              : testingStatus === "running"
                ? "bg-amber-50 text-amber-700 border-amber-200 gap-1"
                : testingStatus === "completed"
                  ? "bg-green-50 text-green-700 border-green-200 gap-1"
                  : "bg-red-50 text-red-700 border-red-200 gap-1"
          }
        >
          {testingStatus === "ready" ? (
            <CheckCircle className="h-3.5 w-3.5" />
          ) : testingStatus === "running" ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : testingStatus === "completed" ? (
            <CheckCircle className="h-3.5 w-3.5" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5" />
          )}
          {testingStatus.charAt(0).toUpperCase() + testingStatus.slice(1)}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="testing-enabled">Enable Testing Environment</Label>
            <Switch id="testing-enabled" checked={testingEnabled} onCheckedChange={setTestingEnabled} />
          </div>
          <p className="text-xs text-muted-foreground">
            Enable or disable the testing environment for your integration
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="testing-mode">Testing Mode</Label>
          <Select value={testingMode} onValueChange={setTestingMode} disabled={!testingEnabled}>
            <SelectTrigger id="testing-mode">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sandbox">Sandbox (Isolated Environment)</SelectItem>
              <SelectItem value="mirror">Mirror (Copy of Production)</SelectItem>
              <SelectItem value="simulation">Simulation (Generated Data)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium">Test Configuration</h4>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="test-products">Number of Test Products</Label>
            <Input id="test-products" type="number" defaultValue="10" disabled={!testingEnabled} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="test-orders">Number of Test Orders</Label>
            <Input id="test-orders" type="number" defaultValue="5" disabled={!testingEnabled} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="test-inventory">Simulate Inventory Changes</Label>
            <Select defaultValue="yes" disabled={!testingEnabled}>
              <SelectTrigger id="test-inventory">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="test-shipping">Simulate Shipping Updates</Label>
            <Select defaultValue="yes" disabled={!testingEnabled}>
              <SelectTrigger id="test-shipping">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-medium">Environment Controls</h4>
            <p className="text-xs text-muted-foreground">Start, stop, or reset your testing environment</p>
          </div>
          <div className="flex gap-2">
            {!isRunning ? (
              <Button onClick={handleStartTest} disabled={!testingEnabled || testingStatus === "completed"}>
                <Play className="mr-2 h-4 w-4" />
                Start Test
              </Button>
            ) : (
              <Button onClick={handleStopTest} variant="destructive">
                <StopCircle className="mr-2 h-4 w-4" />
                Stop Test
              </Button>
            )}
            <Button variant="outline" onClick={handleResetEnvironment} disabled={isRunning}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4">
          <h5 className="text-sm font-medium mb-2">Testing Environment URL</h5>
          <div className="flex gap-2">
            <Input value="https://jewelia-dropship-testing.vercel.app/api/v1" readOnly />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                copyToClipboard("https://jewelia-dropship-testing.vercel.app/api/v1");
              }}
            >
              Copy
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Use this URL for your API requests during testing. All requests to this endpoint will be processed in the
            testing environment.
          </p>
        </div>
      </div>
    </div>
  )
}
