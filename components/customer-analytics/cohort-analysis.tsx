"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Sample cohort data - retention percentages by month
const cohortData = [
  {
    cohort: "Jan 2023",
    m0: 100,
    m1: 65,
    m2: 52,
    m3: 48,
    m4: 45,
    m5: 42,
    m6: 40,
    m7: 38,
    m8: 37,
    m9: 36,
    m10: 35,
    m11: 35,
    m12: 34,
  },
  {
    cohort: "Feb 2023",
    m0: 100,
    m1: 68,
    m2: 55,
    m3: 50,
    m4: 47,
    m5: 44,
    m6: 42,
    m7: 40,
    m8: 39,
    m9: 38,
    m10: 37,
    m11: 36,
    m12: 0,
  },
  {
    cohort: "Mar 2023",
    m0: 100,
    m1: 70,
    m2: 58,
    m3: 52,
    m4: 49,
    m5: 46,
    m6: 44,
    m7: 42,
    m8: 41,
    m9: 40,
    m10: 39,
    m11: 0,
    m12: 0,
  },
  {
    cohort: "Apr 2023",
    m0: 100,
    m1: 67,
    m2: 56,
    m3: 51,
    m4: 48,
    m5: 45,
    m6: 43,
    m7: 41,
    m8: 40,
    m9: 39,
    m10: 0,
    m11: 0,
    m12: 0,
  },
  {
    cohort: "May 2023",
    m0: 100,
    m1: 69,
    m2: 57,
    m3: 52,
    m4: 49,
    m5: 46,
    m6: 44,
    m7: 42,
    m8: 41,
    m9: 0,
    m10: 0,
    m11: 0,
    m12: 0,
  },
  {
    cohort: "Jun 2023",
    m0: 100,
    m1: 72,
    m2: 60,
    m3: 55,
    m4: 52,
    m5: 49,
    m6: 47,
    m7: 45,
    m8: 0,
    m9: 0,
    m10: 0,
    m11: 0,
    m12: 0,
  },
  {
    cohort: "Jul 2023",
    m0: 100,
    m1: 74,
    m2: 62,
    m3: 57,
    m4: 54,
    m5: 51,
    m6: 49,
    m7: 0,
    m8: 0,
    m9: 0,
    m10: 0,
    m11: 0,
    m12: 0,
  },
  {
    cohort: "Aug 2023",
    m0: 100,
    m1: 73,
    m2: 61,
    m3: 56,
    m4: 53,
    m5: 50,
    m6: 0,
    m7: 0,
    m8: 0,
    m9: 0,
    m10: 0,
    m11: 0,
    m12: 0,
  },
  {
    cohort: "Sep 2023",
    m0: 100,
    m1: 75,
    m2: 63,
    m3: 58,
    m4: 55,
    m5: 0,
    m6: 0,
    m7: 0,
    m8: 0,
    m9: 0,
    m10: 0,
    m11: 0,
    m12: 0,
  },
  {
    cohort: "Oct 2023",
    m0: 100,
    m1: 76,
    m2: 64,
    m3: 59,
    m4: 0,
    m5: 0,
    m6: 0,
    m7: 0,
    m8: 0,
    m9: 0,
    m10: 0,
    m11: 0,
    m12: 0,
  },
  {
    cohort: "Nov 2023",
    m0: 100,
    m1: 77,
    m2: 65,
    m3: 0,
    m4: 0,
    m5: 0,
    m6: 0,
    m7: 0,
    m8: 0,
    m9: 0,
    m10: 0,
    m11: 0,
    m12: 0,
  },
  {
    cohort: "Dec 2023",
    m0: 100,
    m1: 78,
    m2: 0,
    m3: 0,
    m4: 0,
    m5: 0,
    m6: 0,
    m7: 0,
    m8: 0,
    m9: 0,
    m10: 0,
    m11: 0,
    m12: 0,
  },
  {
    cohort: "Jan 2024",
    m0: 100,
    m1: 0,
    m2: 0,
    m3: 0,
    m4: 0,
    m5: 0,
    m6: 0,
    m7: 0,
    m8: 0,
    m9: 0,
    m10: 0,
    m11: 0,
    m12: 0,
  },
]

// Function to determine cell color based on retention value
function getCellColor(value: number) {
  if (value === 0) return "bg-gray-100"
  if (value === 100) return "bg-emerald-100"
  if (value >= 70) return "bg-emerald-50"
  if (value >= 50) return "bg-yellow-50"
  if (value >= 30) return "bg-orange-50"
  return "bg-red-50"
}

export function CohortAnalysis() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Cohort Analysis Grid</CardTitle>
          <CardDescription>Customer retention by acquisition cohort over time</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="retention">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="retention">Retention Rate</SelectItem>
              <SelectItem value="revenue">Revenue Retention</SelectItem>
              <SelectItem value="frequency">Purchase Frequency</SelectItem>
              <SelectItem value="aov">Average Order Value</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium">Cohort</TableHead>
                <TableHead className="text-center">M0</TableHead>
                <TableHead className="text-center">M1</TableHead>
                <TableHead className="text-center">M2</TableHead>
                <TableHead className="text-center">M3</TableHead>
                <TableHead className="text-center">M4</TableHead>
                <TableHead className="text-center">M5</TableHead>
                <TableHead className="text-center">M6</TableHead>
                <TableHead className="text-center">M7</TableHead>
                <TableHead className="text-center">M8</TableHead>
                <TableHead className="text-center">M9</TableHead>
                <TableHead className="text-center">M10</TableHead>
                <TableHead className="text-center">M11</TableHead>
                <TableHead className="text-center">M12</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cohortData.map((row) => (
                <TableRow key={row.cohort}>
                  <TableCell className="font-medium">{row.cohort}</TableCell>
                  <TableCell className={`text-center ${getCellColor(row.m0)}`}>{row.m0}%</TableCell>
                  <TableCell className={`text-center ${getCellColor(row.m1)}`}>
                    {row.m1 > 0 ? `${row.m1}%` : "-"}
                  </TableCell>
                  <TableCell className={`text-center ${getCellColor(row.m2)}`}>
                    {row.m2 > 0 ? `${row.m2}%` : "-"}
                  </TableCell>
                  <TableCell className={`text-center ${getCellColor(row.m3)}`}>
                    {row.m3 > 0 ? `${row.m3}%` : "-"}
                  </TableCell>
                  <TableCell className={`text-center ${getCellColor(row.m4)}`}>
                    {row.m4 > 0 ? `${row.m4}%` : "-"}
                  </TableCell>
                  <TableCell className={`text-center ${getCellColor(row.m5)}`}>
                    {row.m5 > 0 ? `${row.m5}%` : "-"}
                  </TableCell>
                  <TableCell className={`text-center ${getCellColor(row.m6)}`}>
                    {row.m6 > 0 ? `${row.m6}%` : "-"}
                  </TableCell>
                  <TableCell className={`text-center ${getCellColor(row.m7)}`}>
                    {row.m7 > 0 ? `${row.m7}%` : "-"}
                  </TableCell>
                  <TableCell className={`text-center ${getCellColor(row.m8)}`}>
                    {row.m8 > 0 ? `${row.m8}%` : "-"}
                  </TableCell>
                  <TableCell className={`text-center ${getCellColor(row.m9)}`}>
                    {row.m9 > 0 ? `${row.m9}%` : "-"}
                  </TableCell>
                  <TableCell className={`text-center ${getCellColor(row.m10)}`}>
                    {row.m10 > 0 ? `${row.m10}%` : "-"}
                  </TableCell>
                  <TableCell className={`text-center ${getCellColor(row.m11)}`}>
                    {row.m11 > 0 ? `${row.m11}%` : "-"}
                  </TableCell>
                  <TableCell className={`text-center ${getCellColor(row.m12)}`}>
                    {row.m12 > 0 ? `${row.m12}%` : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <div>
            <span className="font-medium">Average 3-month retention:</span> 54.8%
          </div>
          <div>
            <span className="font-medium">Average 6-month retention:</span> 45.2%
          </div>
          <div>
            <span className="font-medium">Average 12-month retention:</span> 34.5%
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
