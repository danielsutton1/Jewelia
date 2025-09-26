import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts"

// Mock data for API usage
const usageData = [
  { name: "Mon", calls: 1200 },
  { name: "Tue", calls: 1800 },
  { name: "Wed", calls: 1600 },
  { name: "Thu", calls: 2200 },
  { name: "Fri", calls: 1900 },
  { name: "Sat", calls: 800 },
  { name: "Sun", calls: 600 },
]

export function UsageStatistics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Statistics</CardTitle>
        <CardDescription>API calls over the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={usageData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} calls`, "API Usage"]} labelFormatter={(label) => `${label}`} />
              <Bar dataKey="calls" fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total Calls (7 days)</p>
            <p className="text-2xl font-bold">10,100</p>
          </div>
          <div>
            <p className="text-muted-foreground">Average Daily</p>
            <p className="text-2xl font-bold">1,443</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
