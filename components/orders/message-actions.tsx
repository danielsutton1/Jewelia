"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MessageSquare, User, Users, Briefcase } from "lucide-react"
import { MessageCustomerDialog } from "./message-customer-dialog"
import { MessageAssigneeDialog } from "./message-assignee-dialog"
import { MessageExternalPartnerDialog } from "./message-external-partner-dialog"

interface MessageActionsProps {
  orderId: string
  customerName: string
  assigneeName: string
  partnerName: string
}

export function MessageActions({ orderId, customerName, assigneeName, partnerName }: MessageActionsProps) {
  const [dialog, setDialog] = useState<"customer" | "assignee" | "partner" | null>(null)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-gradient-to-r from-green-400 to-green-600 text-white">
            <MessageSquare className="mr-2 h-4 w-4" />
            Message
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setDialog("customer")}>
            <User className="mr-2 h-4 w-4" />
            <span>Customer</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDialog("assignee")}>
            <Users className="mr-2 h-4 w-4" />
            <span>Assignee</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDialog("partner")}>
            <Briefcase className="mr-2 h-4 w-4" />
            <span>External Partner</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <MessageCustomerDialog
        open={dialog === "customer"}
        onOpenChange={(open) => !open && setDialog(null)}
        orderId={orderId}
        customerName={customerName}
      />

      <MessageAssigneeDialog
        open={dialog === "assignee"}
        onOpenChange={(open) => !open && setDialog(null)}
        orderId={orderId}
        assigneeName={assigneeName}
        assignee={assigneeName}
      />

      <MessageExternalPartnerDialog
        open={dialog === "partner"}
        onOpenChange={(open) => !open && setDialog(null)}
        orderId={orderId}
        partnerName={partnerName}
      />
    </>
  )
} 
 