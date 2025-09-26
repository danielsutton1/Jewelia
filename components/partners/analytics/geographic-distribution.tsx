"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export function GeographicDistribution() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Geographic Distribution</CardTitle>
        <CardDescription>Partner locations and regional performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative h-[300px] border rounded-md overflow-hidden">
          <Image
            src="/interconnected-purple-spheres.png"
            alt="Partner geographic distribution map"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
            <div className="bg-white/90 p-4 rounded-md text-center">
              <p className="text-sm">Interactive map would be displayed here</p>
              <p className="text-xs text-muted-foreground mt-1">
                Showing partner locations and regional performance metrics
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium">Top Regions</h4>
            <ul className="mt-2 space-y-2">
              <li className="text-sm flex justify-between">
                <span>North America</span>
                <span className="font-medium">42%</span>
              </li>
              <li className="text-sm flex justify-between">
                <span>Europe</span>
                <span className="font-medium">28%</span>
              </li>
              <li className="text-sm flex justify-between">
                <span>Asia</span>
                <span className="font-medium">22%</span>
              </li>
              <li className="text-sm flex justify-between">
                <span>Other</span>
                <span className="font-medium">8%</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium">Performance by Region</h4>
            <ul className="mt-2 space-y-2">
              <li className="text-sm flex justify-between">
                <span>North America</span>
                <span className="font-medium">4.6 / 5</span>
              </li>
              <li className="text-sm flex justify-between">
                <span>Europe</span>
                <span className="font-medium">4.7 / 5</span>
              </li>
              <li className="text-sm flex justify-between">
                <span>Asia</span>
                <span className="font-medium">4.5 / 5</span>
              </li>
              <li className="text-sm flex justify-between">
                <span>Other</span>
                <span className="font-medium">4.3 / 5</span>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
