"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Building, User, FileText, Clock, Tag, MapPin } from "lucide-react"

// Mock contract data
const contractData: { [key: string]: {
  id: string;
  name: string;
  type: string;
  category: string;
  counterparty: string;
  counterpartyContact: string;
  counterpartyEmail: string;
  counterpartyPhone: string;
  counterpartyAddress: string;
  internalOwner: string;
  internalDepartment: string;
  startDate: string;
  endDate: string;
  signedDate: string;
  effectiveDate: string;
  value: string;
  currency: string;
  paymentTerms: string;
  autoRenew: boolean;
  renewalTerm: string;
  renewalNotice: string;
  terminationRights: string;
  governingLaw: string;
  disputeResolution: string;
  description: string;
  tags: string[];
} } = {
  "CON-2023-001": {
    id: "CON-2023-001",
    name: "Supplier Agreement - Diamond Direct",
    type: "Supplier",
    category: "Procurement",
    counterparty: "Diamond Direct Inc.",
    counterpartyContact: "John Smith, Procurement Director",
    counterpartyEmail: "john.smith@diamonddirect.example",
    counterpartyPhone: "+1 (555) 123-4567",
    counterpartyAddress: "123 Gem Street, New York, NY 10001",
    internalOwner: "Sarah Johnson, Purchasing Manager",
    internalDepartment: "Procurement",
    startDate: "2023-01-15",
    endDate: "2024-01-14",
    signedDate: "2023-01-10",
    effectiveDate: "2023-01-15",
    value: "$125,000",
    currency: "USD",
    paymentTerms: "Net 30",
    autoRenew: true,
    renewalTerm: "1 year",
    renewalNotice: "60 days",
    terminationRights: "30 days written notice",
    governingLaw: "State of New York",
    disputeResolution: "Arbitration",
    description:
      "Agreement for the supply of premium diamonds and gemstones for Jewelia's high-end collections. Includes special pricing for bulk orders and priority access to rare stones.",
    tags: ["diamonds", "gemstones", "premium", "procurement"],
  },
  "CON-2023-003": {
    id: "CON-2023-003",
    name: "Distribution Agreement - Luxury Retailers",
    type: "Distribution",
    category: "Sales",
    counterparty: "Luxury Retailers Network",
    counterpartyContact: "Emma Davis, CEO",
    counterpartyEmail: "emma.davis@luxuryretailers.example",
    counterpartyPhone: "+1 (555) 987-6543",
    counterpartyAddress: "456 Luxury Avenue, Beverly Hills, CA 90210",
    internalOwner: "Michael Chen, Sales Director",
    internalDepartment: "Sales",
    startDate: "2023-03-10",
    endDate: "2024-03-09",
    signedDate: "2023-03-05",
    effectiveDate: "2023-03-10",
    value: "$180,000",
    currency: "USD",
    paymentTerms: "Net 45",
    autoRenew: false,
    renewalTerm: "To be negotiated",
    renewalNotice: "90 days",
    terminationRights: "60 days written notice",
    governingLaw: "State of California",
    disputeResolution: "Mediation then Litigation",
    description:
      "Exclusive distribution agreement for Jewelia's premium collections through the Luxury Retailers Network's high-end stores across North America. Includes marketing support and seasonal promotions.",
    tags: ["distribution", "retail", "luxury", "exclusive"],
  },
}

export function ContractSummary({ id }: { id: string }) {
  const contract = contractData[id] || {
    id,
    name: "Contract Details",
    type: "Unknown",
    category: "Unknown",
    counterparty: "Unknown",
    counterpartyContact: "Unknown",
    counterpartyEmail: "unknown@example.com",
    counterpartyPhone: "Unknown",
    counterpartyAddress: "Unknown",
    internalOwner: "Unknown",
    internalDepartment: "Unknown",
    startDate: "Unknown",
    endDate: "Unknown",
    signedDate: "Unknown",
    effectiveDate: "Unknown",
    value: "Unknown",
    currency: "USD",
    paymentTerms: "Unknown",
    autoRenew: false,
    renewalTerm: "Unknown",
    renewalNotice: "Unknown",
    terminationRights: "Unknown",
    governingLaw: "Unknown",
    disputeResolution: "Unknown",
    description: "No description available",
    tags: []
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Contract Overview</CardTitle>
          <CardDescription>Key information about this contract</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Contract Type</p>
              <p className="text-sm text-muted-foreground">{contract.type}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Category</p>
              <p className="text-sm text-muted-foreground">{contract.category}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Contract Value</p>
              <p className="text-sm text-muted-foreground">{contract.value} {contract.currency}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Payment Terms</p>
              <p className="text-sm text-muted-foreground">{contract.paymentTerms}</p>
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">Description</p>
            <p className="text-sm text-muted-foreground">{contract.description}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">Tags</p>
            <div className="flex flex-wrap gap-2">
              {contract.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Dates & Timeline</CardTitle>
          <CardDescription>Important dates for this contract</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Start Date</p>
                <p className="text-sm text-muted-foreground">{contract.startDate}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">End Date</p>
                <p className="text-sm text-muted-foreground">{contract.endDate}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Signed Date</p>
                <p className="text-sm text-muted-foreground">{contract.signedDate}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Effective Date</p>
                <p className="text-sm text-muted-foreground">{contract.effectiveDate}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">Renewal Terms</p>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">
                {contract.autoRenew ? "Auto-renews for " + contract.renewalTerm : "No auto-renewal"}
                {contract.renewalNotice && `, ${contract.renewalNotice} notice required`}
              </p>
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">Termination Rights</p>
            <p className="text-sm text-muted-foreground">{contract.terminationRights}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Counterparty Information</CardTitle>
          <CardDescription>Details about the other party</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Company</p>
              <p className="text-sm text-muted-foreground">{contract.counterparty}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Primary Contact</p>
              <p className="text-sm text-muted-foreground">{contract.counterpartyContact}</p>
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">Contact Information</p>
            <p className="text-sm text-muted-foreground">{contract.counterpartyEmail}</p>
            <p className="text-sm text-muted-foreground">{contract.counterpartyPhone}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Address</p>
              <p className="text-sm text-muted-foreground">{contract.counterpartyAddress}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Internal Information</CardTitle>
          <CardDescription>Internal ownership and governance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Contract Owner</p>
              <p className="text-sm text-muted-foreground">{contract.internalOwner}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Department</p>
              <p className="text-sm text-muted-foreground">{contract.internalDepartment}</p>
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">Governing Law</p>
            <p className="text-sm text-muted-foreground">{contract.governingLaw}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">Dispute Resolution</p>
            <p className="text-sm text-muted-foreground">{contract.disputeResolution}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Contract Lifecycle Management System</CardTitle>
          <CardDescription>System Overview</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            {/*
            I've created a comprehensive contract lifecycle management system for the Jewelia CRM. This system provides tools for managing the entire contract lifecycle from creation to renewal or termination.

            ## Key Features Implemented:

            ### Contract Database
            - **Active Agreements**: Dashboard view of all active contracts with filtering and sorting capabilities
            - **Expiration Tracking**: Visual timeline and calendar integration for tracking contract expirations
            - **Renewal Alerts**: Automated notification system for upcoming renewals with configurable alert periods
            - **Version Control**: Complete version history with comparison tools and audit trails

            ### Contract Details
            */}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
