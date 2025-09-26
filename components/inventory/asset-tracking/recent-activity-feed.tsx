"use client"

import {
  FileClock,
  ArrowRightLeft,
  Check,
  PackageOpen,
  LucideIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { Asset, AssetActivity } from "@/types/inventory"

interface RecentActivityFeedProps {
  assets: Asset[]
}

const actionIcons: Record<AssetActivity["action"], LucideIcon> = {
  check_in: Check,
  check_out: PackageOpen,
  transfer: ArrowRightLeft,
  status_change: FileClock,
  report_missing: FileClock,
}

const actionTitles: Record<AssetActivity["action"], string> = {
    check_in: "Asset Checked In",
    check_out: "Asset Checked Out",
    transfer: "Asset Transferred",
    status_change: "Status Updated",
    report_missing: "Asset Reported Missing"
}

export function RecentActivityFeed({ assets }: RecentActivityFeedProps) {
  // Combine all history from all assets and sort by date
  const allActivities = assets
    .flatMap((asset) =>
      asset.history.map((activity) => ({ ...activity, assetName: asset.name, sku: asset.sku }))
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10); // Show latest 10 activities for brevity

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>A log of the latest asset movements.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {allActivities.map((activity, index) => {
            const Icon = actionIcons[activity.action]
            const title = actionTitles[activity.action]
            
            return (
              <div key={index} className="relative flex gap-4">
                <div className="absolute left-[8px] top-[4px] h-full w-0.5 bg-muted" />
                <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{title}</p>
                    <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">{activity.assetName}</span> ({activity.sku})
                  </p>
                  <p className="text-sm text-muted-foreground">
                    By: {activity.employee} to {activity.toLocation}
                  </p>
                  {activity.notes && (
                    <p className="mt-1 text-xs italic text-muted-foreground/80">"{activity.notes}"</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
} 
 