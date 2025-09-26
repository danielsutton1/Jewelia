"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Eye, MoreHorizontal, CheckCircle, XCircle, MessageSquare } from "lucide-react"
import Link from "next/link"

// Mock data for pending contracts
const pendingContracts = [
  {
    id: "CON-2023-008",
    name: "Supply Agreement - Gem Source",
    type: "Supplier",
    counterparty: "Gem Source International",
    submittedBy: "Sarah Johnson",
    submittedDate: "2023-07-10",
    value: "$95,000",
    status: "pending_legal",
    urgency: "medium",
  },
  {
    id: "CON-2023-009",
    name: "Retail Partnership - Luxury Boutiques",
    type: "Partnership",
    counterparty: "Luxury Boutiques Network",
    submittedBy: "Michael Chen",
    submittedDate: "2023-07-08",
    value: "$150,000",
    status: "pending_approval",
    urgency: "high",
  },
  {
    id: "CON-2023-010",
    name: "Consulting Agreement - Market Expansion",
    type: "Consulting",
    counterparty: "Global Market Advisors",
    submittedBy: "Jessica Williams",
    submittedDate: "2023-07-05",
    value: "$65,000",
    status: "pending_review",
    urgency: "low",
  },
  {
    id: "CON-2023-011",
    name: "Equipment Purchase - Laser Engraver",
    type: "Purchase",
    counterparty: "Precision Equipment Co.",
    submittedBy: "Robert Taylor",
    submittedDate: "2023-07-12",
    value: "$28,500",
    status: "pending_approval",
    urgency: "medium",
  },
  {
    id: "CON-2023-012",
    name: "Maintenance Agreement - Security Systems",
    type: "Service",
    counterparty: "SecureTech Solutions",
    submittedBy: "Amanda Lopez",
    submittedDate: "2023-07-09",
    value: "$12,000",
    status: "pending_legal",
    urgency: "low",
  },
  {
    id: "CON-2023-013",
    name: "Exhibition Agreement - International Jewelry Show",
    type: "Event",
    counterparty: "Global Exhibitions Inc.",
    submittedBy: "David Kim",
    submittedDate: "2023-07-11",
    value: "$35,000",
    status: "pending_approval",
    urgency: "high",
  },
  {
    id: "CON-2023-014",
    name: "Insurance Policy - Inventory Coverage",
    type: "Insurance",
    counterparty: "Secure Assets Insurance",
    submittedBy: "Emily Rodriguez",
    submittedDate: "2023-07-07",
    value: "$22,000",
    status: "pending_review",
    urgency: "medium",
  },
]

export function PendingContracts() {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contract ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Counterparty</TableHead>
              <TableHead>Submitted By</TableHead>
              <TableHead>Submitted Date</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Urgency</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingContracts.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell className="font-medium">{contract.id}</TableCell>
                <TableCell>{contract.name}</TableCell>
                <TableCell>{contract.type}</TableCell>
                <TableCell>{contract.counterparty}</TableCell>
                <TableCell>{contract.submittedBy}</TableCell>
                <TableCell>{contract.submittedDate}</TableCell>
                <TableCell>{contract.value}</TableCell>
                <TableCell>
                  {contract.status === "pending_review" && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Pending Review
                    </Badge>
                  )}
                  {contract.status === "pending_legal" && (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      Legal Review
                    </Badge>
                  )}
                  {contract.status === "pending_approval" && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      Awaiting Approval
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {contract.urgency === "high" && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      High
                    </Badge>
                  )}
                  {contract.urgency === "medium" && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      Medium
                    </Badge>
                  )}
                  {contract.urgency === "low" && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Low
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
                        <CheckCircle className="mr-2 h-4 w-4" /> Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <XCircle className="mr-2 h-4 w-4" /> Reject
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <MessageSquare className="mr-2 h-4 w-4" /> Add Comment
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
