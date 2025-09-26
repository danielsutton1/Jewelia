"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Download,
  Share2,
  FileEdit,
  MoreHorizontal,
  RefreshCw,
  Printer,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock contract data
const contractData: Record<string, {
  id: string;
  name: string;
  type: string;
  counterparty: string;
  startDate: string;
  endDate: string;
  status: string;
  complianceStatus: string;
}> = {
  "CON-2023-001": {
    id: "CON-2023-001",
    name: "Supplier Agreement - Diamond Direct",
    type: "Supplier",
    counterparty: "Diamond Direct Inc.",
    startDate: "2023-01-15",
    endDate: "2024-01-14",
    status: "active",
    complianceStatus: "compliant",
  },
  "CON-2023-003": {
    id: "CON-2023-003",
    name: "Distribution Agreement - Luxury Retailers",
    type: "Distribution",
    counterparty: "Luxury Retailers Network",
    startDate: "2023-03-10",
    endDate: "2024-03-09",
    status: "active",
    complianceStatus: "issues",
  },
  "CON-2023-008": {
    id: "CON-2023-008",
    name: "Supply Agreement - Gem Source",
    type: "Supplier",
    counterparty: "Gem Source International",
    startDate: "2023-07-15",
    endDate: "2024-07-14",
    status: "pending_legal",
    complianceStatus: "pending",
  },
}

export function ContractHeader({ id }: { id: string }) {
  const contract = contractData[id] || {
    id,
    name: "Contract Details",
    type: "Unknown",
    counterparty: "Unknown",
    startDate: "",
    endDate: "",
    status: "unknown",
    complianceStatus: "unknown",
  }

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{contract.name}</h1>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>{contract.id}</span>
          <span>•</span>
          <span>{contract.type}</span>
          <span>•</span>
          <span>{contract.counterparty}</span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {contract.status === "active" && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Active
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

        {contract.complianceStatus === "compliant" && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="mr-1 h-3 w-3" />
            Compliant
          </Badge>
        )}
        {contract.complianceStatus === "issues" && (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Issues
          </Badge>
        )}
        {contract.complianceStatus === "pending" && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Pending Review
          </Badge>
        )}

        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
        <Button variant="outline" size="sm">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
        <Button variant="outline" size="sm">
          <FileEdit className="mr-2 h-4 w-4" />
          Edit
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>
              <RefreshCw className="mr-2 h-4 w-4" /> Renew Contract
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Printer className="mr-2 h-4 w-4" /> Print
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <AlertTriangle className="mr-2 h-4 w-4" /> Report Issue
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
