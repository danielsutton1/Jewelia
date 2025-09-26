"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

export function ProductSync() {
  const [autoSync, setAutoSync] = useState(true)
  const [syncFrequency, setSyncFrequency] = useState("hourly")
  const [syncInProgress, setSyncInProgress] = useState(false)

  // Mock data for product sync
  const syncData = {
    lastSync: "2023-11-15T14:30:00Z",
    totalProducts: 1284,
    syncedProducts: 1284,
    failedProducts: 0,
    syncStatus: "success",
  }

  const handleManualSync = () => {
    setSyncInProgress(true)
    // Simulate sync process
    setTimeout(() => {
      setSyncInProgress(false)
    }, 3000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Product Synchronization</h3>
          <p className="text-sm text-muted-foreground">Configure how your products are synchronized with Jewelia</p>
        </div>
        <Badge
          variant="outline"
          className={
            syncData.syncStatus === "success"
              ? "bg-green-50 text-green-700 border-green-200 gap-1"
              : syncData.syncStatus === "warning"
                ? "bg-amber-50 text-amber-700 border-amber-200 gap-1"
                : "bg-red-50 text-red-700 border-red-200 gap-1"
          }
        >
          {syncData.syncStatus === "success" ? (
            <CheckCircle className="h-3.5 w-3.5" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5" />
          )}
          {syncData.syncStatus === "success" ? "Synced" : "Sync Issues"}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-sync">Automatic Synchronization</Label>
            <Switch id="auto-sync" checked={autoSync} onCheckedChange={setAutoSync} />
          </div>
          <p className="text-xs text-muted-foreground">
            Enable automatic synchronization of products based on the selected frequency
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sync-frequency">Sync Frequency</Label>
          <Select value={syncFrequency} onValueChange={setSyncFrequency} disabled={!autoSync}>
            <SelectTrigger id="sync-frequency">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15min">Every 15 minutes</SelectItem>
              <SelectItem value="30min">Every 30 minutes</SelectItem>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium">Sync Options</h4>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-start space-x-2">
            <Checkbox id="sync-images" defaultChecked />
            <div>
              <Label htmlFor="sync-images" className="text-sm">
                Sync Product Images
              </Label>
              <p className="text-xs text-muted-foreground">Include product images in the synchronization process</p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox id="sync-descriptions" defaultChecked />
            <div>
              <Label htmlFor="sync-descriptions" className="text-sm">
                Sync Descriptions
              </Label>
              <p className="text-xs text-muted-foreground">
                Include product descriptions in the synchronization process
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox id="sync-variants" defaultChecked />
            <div>
              <Label htmlFor="sync-variants" className="text-sm">
                Sync Variants
              </Label>
              <p className="text-xs text-muted-foreground">Include product variants in the synchronization process</p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox id="sync-metadata" defaultChecked />
            <div>
              <Label htmlFor="sync-metadata" className="text-sm">
                Sync Metadata
              </Label>
              <p className="text-xs text-muted-foreground">Include product metadata in the synchronization process</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-medium">Last Synchronization</h4>
            <p className="text-xs text-muted-foreground">{new Date(syncData.lastSync).toLocaleString()}</p>
          </div>
          <Button onClick={handleManualSync} disabled={syncInProgress}>
            {syncInProgress ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync Now
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-muted p-3 text-center">
            <div className="text-xs font-medium text-muted-foreground">Total Products</div>
            <div className="mt-1 text-xl font-bold">{syncData.totalProducts}</div>
          </div>
          <div className="rounded-lg bg-muted p-3 text-center">
            <div className="text-xs font-medium text-muted-foreground">Synced Products</div>
            <div className="mt-1 text-xl font-bold text-green-600">{syncData.syncedProducts}</div>
          </div>
          <div className="rounded-lg bg-muted p-3 text-center">
            <div className="text-xs font-medium text-muted-foreground">Failed Products</div>
            <div className="mt-1 text-xl font-bold text-red-600">{syncData.failedProducts}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
