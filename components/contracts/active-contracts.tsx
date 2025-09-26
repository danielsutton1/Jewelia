"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Eye, MoreHorizontal, Download, FileEdit, History, AlertTriangle } from "lucide-react"
import Link from "next/link"

// Mock data for active contracts
const contracts = [
  {
    id: "CON-2023-001",
    name: "Supplier Agreement - Diamond Direct",
    type: "Supplier",
    counterparty: "Diamond Direct Inc.",
    startDate: "2023-01-15",
    endDate: "2024-01-14",
    value: "$125,000",
    status: "active",
    complianceStatus: "compliant",
  },
  {
    id: "CON-2023-002",
    name: "Manufacturing Agreement - Precision Casting",
    type: "Manufacturing",
    counterparty: "Precision Casting Co.",
    startDate: "2023-02-01",
    endDate: "2025-01-31",
    value: "$250,000",
    status: "active",
    complianceStatus: "compliant",
  },
  {
    id: "CON-2023-003",
    name: "Distribution Agreement - Luxury Retailers",
    type: "Distribution",
    counterparty: "Luxury Retailers Network",
    startDate: "2023-03-10",
    endDate: "2024-03-09",
    value: "$180,000",
    status: "active",
    complianceStatus: "issues",
  },
  {
    id: "CON-2023-004",
    name: "Service Agreement - Artisan Engraving",
    type: "Service",
    counterparty: "Artisan Engraving LLC",
    startDate: "2023-04-01",
    endDate: "2024-03-31",
    value: "$45,000",
    status: "active",
    complianceStatus: "compliant",
  },
  {
    id: "CON-2023-005",
    name: "Lease Agreement - Workshop Space",
    type: "Lease",
    counterparty: "Metropolitan Properties",
    startDate: "2023-01-01",
    endDate: "2027-12-31",
    value: "$360,000",
    status: "active",
    complianceStatus: "compliant",
  },
  {
    id: "CON-2023-006",
    name: "Marketing Agreement - Digital Promotions",
    type: "Marketing",
    counterparty: "Digital Marketing Experts",
    startDate: "2023-05-15",
    endDate: "2024-05-14",
    value: "$75,000",
    status: "active",
    complianceStatus: "compliant",
  },
  {
    id: "CON-2023-007",
    name: "Licensing Agreement - Designer Collection",
    type: "Licensing",
    counterparty: "Elite Designs Inc.",
    startDate: "2023-06-01",
    endDate: "2026-05-31",
    value: "$225,000",
    status: "active",
    complianceStatus: "issues",
  },
]

export function ActiveContracts() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredContracts = contracts.filter(
    (contract) =>
      contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.counterparty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search contracts..."
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
              <TableHead>Type</TableHead>
              <TableHead>Counterparty</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Compliance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContracts.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell className="font-medium">{contract.id}</TableCell>
                <TableCell>{contract.name}</TableCell>
                <TableCell>{contract.type}</TableCell>
                <TableCell>{contract.counterparty}</TableCell>
                <TableCell>{contract.startDate}</TableCell>
                <TableCell>{contract.endDate}</TableCell>
                <TableCell>{contract.value}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Active
                  </Badge>
                </TableCell>
                <TableCell>
                  {contract.complianceStatus === "compliant" ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Compliant
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Issues
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
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <FileEdit className="mr-2 h-4 w-4" /> Edit Contract
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <History className="mr-2 h-4 w-4" /> View History
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
