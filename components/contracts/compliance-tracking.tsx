"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Eye, MoreHorizontal, AlertTriangle, CheckCircle, FileText, Bell } from "lucide-react"
import Link from "next/link"

// Mock data for compliance tracking
const complianceData = [
  {
    id: "CON-2023-003",
    name: "Distribution Agreement - Luxury Retailers",
    counterparty: "Luxury Retailers Network",
    complianceScore: 75,
    lastReviewed: "2023-06-15",
    nextReview: "2023-09-15",
    issues: [
      { type: "reporting", description: "Quarterly sales report overdue", severity: "medium" },
      { type: "financial", description: "Payment terms not being followed", severity: "high" },
    ],
    status: "issues",
  },
  {
    id: "CON-2023-007",
    name: "Licensing Agreement - Designer Collection",
    counterparty: "Elite Designs Inc.",
    complianceScore: 65,
    lastReviewed: "2023-05-20",
    nextReview: "2023-08-20",
    issues: [
      { type: "legal", description: "Usage rights violation", severity: "high" },
      { type: "reporting", description: "Missing monthly usage reports", severity: "medium" },
      { type: "operational", description: "Quality standards not met", severity: "medium" },
    ],
    status: "issues",
  },
  {
    id: "CON-2023-022",
    name: "Manufacturing Agreement - Fine Metals",
    counterparty: "Fine Metals Processing",
    complianceScore: 85,
    lastReviewed: "2023-07-01",
    nextReview: "2023-10-01",
    issues: [{ type: "operational", description: "Delivery schedule delays", severity: "low" }],
    status: "minor_issues",
  },
  {
    id: "CON-2023-023",
    name: "Supplier Agreement - Gemstone Imports",
    counterparty: "International Gem Traders",
    complianceScore: 95,
    lastReviewed: "2023-07-05",
    nextReview: "2023-10-05",
    issues: [],
    status: "compliant",
  },
  {
    id: "CON-2023-024",
    name: "Service Agreement - Security Services",
    counterparty: "Guardian Security Inc.",
    complianceScore: 100,
    lastReviewed: "2023-07-10",
    nextReview: "2023-10-10",
    issues: [],
    status: "compliant",
  },
  {
    id: "CON-2023-025",
    name: "Partnership Agreement - Retail Expansion",
    counterparty: "Global Retail Partners",
    complianceScore: 90,
    lastReviewed: "2023-06-25",
    nextReview: "2023-09-25",
    issues: [{ type: "reporting", description: "Delayed market analysis report", severity: "low" }],
    status: "minor_issues",
  },
  {
    id: "CON-2023-026",
    name: "Employment Agreement - Executive Team",
    counterparty: "Multiple Executives",
    complianceScore: 100,
    lastReviewed: "2023-07-15",
    nextReview: "2023-10-15",
    issues: [],
    status: "compliant",
  },
]

export function ComplianceTracking() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredData = complianceData.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.counterparty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search compliance records..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contract ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Counterparty</TableHead>
              <TableHead>Compliance Score</TableHead>
              <TableHead>Last Reviewed</TableHead>
              <TableHead>Next Review</TableHead>
              <TableHead>Issues</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.counterparty}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>{item.complianceScore}%</span>
                    </div>
                    <Progress
                      value={item.complianceScore}
                      className="h-2"
                      indicatorClassName={
                        item.complianceScore >= 90
                          ? "bg-green-600"
                          : item.complianceScore >= 80
                            ? "bg-emerald-500"
                            : item.complianceScore >= 70
                              ? "bg-amber-500"
                              : "bg-red-500"
                      }
                    />
                  </div>
                </TableCell>
                <TableCell>{item.lastReviewed}</TableCell>
                <TableCell>{item.nextReview}</TableCell>
                <TableCell>{item.issues.length}</TableCell>
                <TableCell>
                  {item.status === "compliant" && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Compliant
                    </Badge>
                  )}
                  {item.status === "minor_issues" && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Minor Issues
                    </Badge>
                  )}
                  {item.status === "issues" && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Major Issues
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/contracts/${item.id}`}>
                          <Eye className="mr-2 h-4 w-4" /> View Contract
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileText className="mr-2 h-4 w-4" /> Compliance Report
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <CheckCircle className="mr-2 h-4 w-4" /> Mark Reviewed
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Bell className="mr-2 h-4 w-4" /> Set Alert
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
