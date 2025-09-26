"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Copy,
  RotateCcw,
  Factory,
  ClipboardEdit,
  UserPlus,
  MessageSquarePlus,
  Calendar,
  Printer,
  Mail,
  Bell,
  MoreHorizontal,
  CheckCircle2,
  Loader2,
  MessageSquare,
  CreditCard,
  CornerUpLeft,
  RefreshCw,
  StickyNote,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { MessageCustomerDialog } from "./message-customer-dialog"
import { MessageAssigneeDialog } from "./message-assignee-dialog"
import { Fragment } from "react"

interface OrderQuickActionsProps {
  orderId: string
  variant?: "dropdown" | "actionBar" | "compact" | "highlighted"
  onActionComplete?: (action: string) => void
  currentStatus?: string
  disabled?: boolean
  customerName: string
  assigneeName: string
  exclude?: string[]
  include?: string[]
  noWrap?: boolean
}

export function OrderQuickActions({
  orderId,
  variant = "actionBar",
  onActionComplete,
  currentStatus = "Pending",
  disabled = false,
  customerName,
  assigneeName,
  exclude = [],
  include,
  noWrap = false,
}: OrderQuickActionsProps) {
  const router = useRouter()
  const [activeDialog, setActiveDialog] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  const handleAction = (action: string) => {
    setActiveDialog(action)
  }

  const actionsConfig = {
    payment: {
      label: "Process Payment",
      icon: CreditCard,
      action: () => console.log("Processing payment for", orderId),
      group: "primary",
      description: "Process a payment for this order",
      badge: undefined,
    },
    reminder: {
      label: "Send Reminder",
      icon: Bell,
      action: () => console.log("Sending reminder for", orderId),
      group: "primary",
      description: "Send a payment reminder to the customer",
      badge: undefined,
    },
    assign: {
      label: "Assign to Staff",
      icon: UserPlus,
      action: () => console.log("Assigning staff for", orderId),
      group: "secondary",
      description: "Assign this order to a staff member",
      badge: undefined,
    },
    production: {
      label: "Send to Production",
      icon: Factory,
      action: () => console.log("Sending to production for", orderId),
      group: "secondary",
      description: "Move this order to production",
      badge: currentStatus === "Pending" ? "Recommended" : undefined,
    },
    note: {
      label: "Add Note",
      icon: StickyNote,
      action: () => console.log("Adding note for", orderId),
      group: "secondary",
      description: "Add a note to this order",
      badge: undefined,
    },
    pickup: {
      label: "Schedule Pickup",
      icon: Calendar,
      action: () => console.log("Scheduling pickup for", orderId),
      group: "secondary",
      description: "Schedule a pickup time for the customer",
      badge: undefined,
    },
    duplicate: {
      label: "Duplicate Order",
      icon: Copy,
      action: () => console.log("Duplicating order", orderId),
      group: "utility",
      description: "Create a copy of this order",
      badge: undefined,
    },
    return: {
      label: "Create Return",
      icon: CornerUpLeft,
      action: () => console.log("Creating return for", orderId),
      group: "utility",
      description: "Process a return for this order",
      badge: undefined,
    },
    status: {
      label: "Change Status",
      icon: RefreshCw,
      action: () => console.log("Changing status for", orderId),
      group: "utility",
      description: "Update the order status",
      badge: undefined,
    },
    followUp: {
      label: "Create Follow-up",
      icon: MessageSquarePlus,
      description: "Schedule a follow-up task",
      group: "utility",
      action: () => console.log("Creating follow-up for", orderId),
      badge: undefined,
    },
  }

  const actions = Object.entries(actionsConfig).map(([id, config]) => ({
    id,
    ...config,
  }))

  // Filter actions based on variant
  let visibleActions = actions.filter((action) => {
    if (exclude.includes(action.id)) {
      return false
    }
    if (variant === "compact") {
      return action.group === "primary"
    }
    if (variant === "highlighted") {
      return false
    }
    return true
  })

  if (include) {
    visibleActions = include
      .map(id => visibleActions.find(a => a.id === id))
      .filter((a): a is (typeof visibleActions)[0] => !!a)
  }

  const handleActionClick = (actionId: string) => {
    const action = actions.find((a) => a.id === actionId)
    if (action && 'action' in action && typeof action.action === 'function') {
      action.action()
    }
    toast({
      title: `Action: ${action?.label}`,
      description: "This is a mock action.",
    })
  }

  const Wrapper = noWrap ? Fragment : "div"
  const wrapperProps = noWrap ? {} : { className: "flex flex-wrap gap-2" }

  const renderDialogs = () => {
    return actions.map((action) => (
      <Dialog key={action.id} open={activeDialog === action.id} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{action.label}</DialogTitle>
            <DialogDescription>{action.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {action.id === "assign" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="assignee">Assign to</Label>
                  <Select>
                    <SelectTrigger id="assignee">
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sarah">Sarah Johnson</SelectItem>
                      <SelectItem value="michael">Michael Chen</SelectItem>
                      <SelectItem value="emma">Emma Wilson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assign-notes">Notes</Label>
                  <Textarea
                    id="assign-notes"
                    placeholder="Add notes about the assignment"
                    rows={3}
                  />
                </div>
              </div>
            )}
            {action.id === "production" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="production-notes">Production Notes</Label>
                  <Textarea
                    id="production-notes"
                    placeholder="Add production instructions"
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="notify-customer" />
                  <Label htmlFor="notify-customer">Notify customer</Label>
                </div>
              </div>
            )}
            {action.id === "note" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="note-content">Note</Label>
                  <Textarea
                    id="note-content"
                    placeholder="Add a note to this order"
                    rows={4}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="internal-note" />
                  <Label htmlFor="internal-note">Internal note only</Label>
                </div>
              </div>
            )}
            {action.id === "pickup" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pickup-date">Pickup Date</Label>
                  <Input
                    id="pickup-date"
                    type="datetime-local"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pickup-notes">Notes</Label>
                  <Textarea
                    id="pickup-notes"
                    placeholder="Add pickup instructions"
                    rows={3}
                  />
                </div>
              </div>
            )}
            {action.id === "duplicate" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="duplicate-options">Duplicate Options</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="duplicate-items" defaultChecked />
                      <Label htmlFor="duplicate-items">Include items</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="duplicate-customer" defaultChecked />
                      <Label htmlFor="duplicate-customer">Same customer</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="duplicate-notes" />
                      <Label htmlFor="duplicate-notes">Include notes</Label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {action.id === "return" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="return-reason">Return Reason</Label>
                  <Select>
                    <SelectTrigger id="return-reason">
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="damaged">Item Damaged</SelectItem>
                      <SelectItem value="wrong_item">Wrong Item</SelectItem>
                      <SelectItem value="quality">Quality Issues</SelectItem>
                      <SelectItem value="customer">Customer Request</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="return-notes">Notes</Label>
                  <Textarea
                    id="return-notes"
                    placeholder="Add details about the return"
                    rows={3}
                  />
                </div>
              </div>
            )}
            {action.id === "status" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-status">New Status</Label>
                  <Select>
                    <SelectTrigger id="new-status">
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status-notes">Notes</Label>
                  <Textarea
                    id="status-notes"
                    placeholder="Add notes about the status change"
                    rows={3}
                  />
                </div>
              </div>
            )}
            {action.id === "followUp" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="followup-date">Follow-up Date</Label>
                  <Input
                    id="followup-date"
                    type="datetime-local"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="followup-notes">Notes</Label>
                  <Textarea
                    id="followup-notes"
                    placeholder="Add follow-up details"
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveDialog(null)}>
              Cancel
            </Button>
            <Button onClick={() => {
              handleActionClick(action.id)
              setActiveDialog(null)
            }}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    ))
  }

  if (variant === "dropdown") {
  return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={disabled}>
            <Button variant="outline" size="sm">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                  Actions
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Order Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {actions
              .filter((a) => a.group === "primary")
              .map((action) => (
                <DropdownMenuItem
                  key={action.id}
                  onClick={() => setActiveDialog(action.id)}
                  disabled={loading !== null}
                >
                  <action.icon className="h-4 w-4 mr-2" />
                  <span>{action.label}</span>
                  {action.badge && (
                    <Badge variant="outline" className="ml-auto text-xs">
                      {action.badge}
                    </Badge>
                  )}
                </DropdownMenuItem>
              ))}
            <DropdownMenuSeparator />
            {actions
              .filter((a) => a.group === "secondary")
              .map((action) => (
                <DropdownMenuItem
                  key={action.id}
                  onClick={() => setActiveDialog(action.id)}
                  disabled={loading !== null}
                >
                  <action.icon className="h-4 w-4 mr-2" />
                  <span>{action.label}</span>
                </DropdownMenuItem>
              ))}
            <DropdownMenuSeparator />
            {actions
              .filter((a) => a.group === "utility")
              .map((action) => (
                <DropdownMenuItem
                  key={action.id}
                  onClick={() => setActiveDialog(action.id)}
                  disabled={loading !== null}
                >
                  <action.icon className="h-4 w-4 mr-2" />
                  <span>{action.label}</span>
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {renderDialogs()}
      </>
    )
  }

  return (
      <>
        <div className="flex flex-wrap gap-2">
          <TooltipProvider>
            {visibleActions.map((action) => (
              <Tooltip key={action.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveDialog(action.id)}
                    disabled={disabled || loading !== null}
                    className="relative"
                  >
                    {loading === action.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <action.icon className="h-4 w-4 mr-2" />
                        {variant !== "compact" && action.label}
                        {action.badge && variant !== "compact" && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {action.badge}
                          </Badge>
                        )}
                        {action.badge && variant === "compact" && (
                          <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                            !
                          </Badge>
                        )}
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{action.description}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
        {renderDialogs()}
      </>
  )
}

