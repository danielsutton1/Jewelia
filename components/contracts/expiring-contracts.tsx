"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Eye, MoreHorizontal, RefreshCw, AlertCircle, Clock } from "lucide-react"
import Link from "next/link"

// Helper function to calculate days remaining and percentage
function getDaysRemaining(endDate: string): { days: number; percentage: number } {
  const end = new Date(endDate)
  const today = new Date()
  const diffTime = end.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  // Calculate percentage remaining (assuming 90 days is the warning period)
  const percentage = Math.max(0, Math.min(100, (diffDays / 90) * 100))

  return { days: diffDays, percentage }
}

// Mock data for expiring contracts
const expiringContracts = [
  {
    id: "CON-2023-015",
    name: "Supply Agreement - Silver Source",
    type: "Supplier",
    counterparty: "Silver Source Ltd.",
    startDate: "2022-08-15",
    endDate: "2023-08-14",
    value: "$85,000",
    autoRenew: true,
    renewalWindow: "60 days",
    renewalNotified: true,
  },
  {
    id: "CON-2023-016",
    name: "Distribution Agreement - West Coast Retailers",
    type: "Distribution",
    counterparty: "West Coast Luxury Group",
    startDate: "2022-08-01",
    endDate: "2023-08-31",
    value: "$120,000",
    autoRenew: false,
    renewalWindow: "90 days",
    renewalNotified: true,
  },
  {
    id: "CON-2023-017",
    name: "Service Agreement - IT Support",
    type: "Service",
    counterparty: "TechPro Solutions",
    startDate: "2022-09-01",
    endDate: "2023-08-31",
    value: "$36,000",
    autoRenew: true,
    renewalWindow: "30 days",
    renewalNotified: false,
  },
  {
    id: "CON-2023-018",
    name: "Marketing Agreement - Social Media",
    type: "Marketing",
    counterparty: "Digital Marketing Pros",
    startDate: "2022-09-15",
    endDate: "2023-09-14",
    value: "$48,000",
    autoRenew: false,
    renewalWindow: "60 days",
    renewalNotified: true,
  },
  {
    id: "CON-2023-019",
    name: "Lease Agreement - Retail Space",
    type: "Lease",
    counterparty: "Premium Mall Properties",
    startDate: "2021-10-01",
    endDate: "2023-09-30",
    value: "$180,000",
    autoRenew: false,
    renewalWindow: "120 days",
    renewalNotified: true,
  },
  {
    id: "CON-2023-020",
    name: "Licensing Agreement - Gemstone Collection",
    type: "Licensing",
    counterparty: "Exclusive Designs LLC",
    startDate: "2022-10-15",
    endDate: "2023-10-14",
    value: "$95,000",
    autoRenew: true,
    renewalWindow: "90 days",
    renewalNotified: false,
  },
  {
    id: "CON-2023-021",
    name: "Insurance Policy - Business Liability",
    type: "Insurance",
    counterparty: "Guardian Insurance Co.",
    startDate: "2022-11-01",
    endDate: "2023-10-31",
    value: "$15,000",
    autoRenew: true,
    renewalWindow: "45 days",
    renewalNotified: false,
  },
]

export function ExpiringContracts() {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contract ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Counterparty</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Time Remaining</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Auto Renew</TableHead>
              <TableHead>Renewal Window</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expiringContracts.map((contract) => {
              const { days, percentage } = getDaysRemaining(contract.endDate)
              return (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">{contract.id}</TableCell>
                  <TableCell>{contract.name}</TableCell>
                  <TableCell>{contract.counterparty}</TableCell>
                  <TableCell>{contract.endDate}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>{days} days</span>
                        <span>{percentage.toFixed(0)}%</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell>{contract.value}</TableCell>
                  <TableCell>
                    {contract.autoRenew ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Yes
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">
                        No
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{contract.renewalWindow}</TableCell>
                  <TableCell>
                    {days <= 30 ? (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Critical
                      </Badge>
                    ) : days <= 60 ? (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        <Clock className="mr-1 h-3 w-3" />
                        Urgent
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Upcoming
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
                          <Link href={`/dashboard/contracts/${contract.id}`}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <RefreshCw className="mr-2 h-4 w-4" /> Initiate Renewal
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <AlertCircle className="mr-2 h-4 w-4" /> Send Reminder
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
