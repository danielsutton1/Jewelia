"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Clock, CheckCircle, XCircle, Printer, Share2 } from "lucide-react"

interface InspectionHeaderProps {
  inspection: {
    id: string
    partnerName: string
    itemType: string
    orderNumber: string
    receivedDate: string
    priority: string
    status: string
    description: string
    inspector: string
    lastUpdated: string
  }
}

export function InspectionHeader({ inspection }: InspectionHeaderProps) {
  const router = useRouter()
  const [showPassDialog, setShowPassDialog] = useState(false)
  const [showFailDialog, setShowFailDialog] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        )
      case "in progress":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> In Progress
          </Badge>
        )
      case "passed":
        return (
          <Badge variant="success" className="flex items-center gap-1 bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3" /> Passed
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Failed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">High</Badge>
      case "medium":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Medium</Badge>
      case "low":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const handleBack = () => {
    router.back()
  }

  const handlePass = () => {
    // Logic to mark inspection as passed
    setShowPassDialog(false)
    // Update status and redirect or show confirmation
  }

  const handleFail = () => {
    // Logic to mark inspection as failed
    setShowFailDialog(false)
    // Update status and redirect or show confirmation
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Inspection {inspection.id}</h1>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Partner</p>
                <p className="font-medium">{inspection.partnerName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Item Type</p>
                <p className="font-medium">{inspection.itemType}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Order Number</p>
                <p className="font-medium">{inspection.orderNumber}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Received Date</p>
                <p className="font-medium">{inspection.receivedDate}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Priority</p>
                <div>{getPriorityBadge(inspection.priority)}</div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div>{getStatusBadge(inspection.status)}</div>
              </div>
              <div className="space-y-1 md:col-span-2 lg:col-span-3">
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="font-medium">{inspection.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Inspector: {inspection.inspector}</span>
            <span>•</span>
            <span>Last updated: {new Date(inspection.lastUpdated).toLocaleString()}</span>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button variant="destructive" size="sm" className="gap-1" onClick={() => setShowFailDialog(true)}>
              <XCircle className="h-4 w-4" />
              Fail
            </Button>
            <Button
              variant="default"
              size="sm"
              className="gap-1 bg-green-600 hover:bg-green-700"
              onClick={() => setShowPassDialog(true)}
            >
              <CheckCircle className="h-4 w-4" />
              Pass
            </Button>
          </div>
        </div>
      </div>

      {/* Pass Confirmation Dialog */}
      <AlertDialog open={showPassDialog} onOpenChange={setShowPassDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Passed</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this inspection as passed? This will finalize the inspection and notify the
              partner.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePass} className="bg-green-600 hover:bg-green-700">
              Yes, Mark as Passed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Fail Confirmation Dialog */}
      <AlertDialog open={showFailDialog} onOpenChange={setShowFailDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Failed</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this inspection as failed? This will require corrective action from the
              partner.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleFail} className="bg-destructive hover:bg-destructive/90">
              Yes, Mark as Failed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
