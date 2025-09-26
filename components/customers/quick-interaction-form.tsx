"use client"

import { useState } from "react"
import { 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  ShoppingBag, 
  AlertCircle,
  ShoppingCart,
  AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

import { ScheduleAppointmentDialog } from "./schedule-appointment-dialog"
import { SendFollowUpDialog } from "./send-follow-up-dialog"
import { CreateQuoteDialog } from "./create-quote-dialog"
import { LogPurchaseDialog } from "./log-purchase-dialog"
import { ReportIssueDialog } from "./report-issue-dialog"

const quickActions = [
  {
    title: "Add Customer Note",
    description: "Quickly add a note about a customer interaction",
    icon: Phone,
    buttonText: "Start Call Log",
    dialog: "logPhoneCall",
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    title: "Schedule Appointment",
    description: "Book an in-store consultation or meeting",
    icon: Calendar,
    buttonText: "Schedule Now",
    dialog: "scheduleAppointment",
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  },
  {
    title: "Send Follow-up",
    description: "Send a follow-up message to customers",
    icon: Mail,
    buttonText: "Send Message",
    dialog: "sendFollowUp",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50"
  },
  {
    title: "Create Quote",
    description: "Generate a quote for customers",
    icon: FileText,
    buttonText: "Create Quote",
    dialog: "createQuote",
    color: "text-orange-600",
    bgColor: "bg-orange-50"
  },
  {
    title: "Log Purchase",
    description: "Record a customer purchase or sale",
    icon: ShoppingCart,
    buttonText: "Log Sale",
    dialog: "logPurchase",
    color: "text-red-600",
    bgColor: "bg-red-50"
  },
  {
    title: "Report Issue",
    description: "Report and track customer issues",
    icon: AlertTriangle,
    buttonText: "Report Issue",
    dialog: "reportIssue",
    color: "text-amber-600",
    bgColor: "bg-amber-50"
  }
]

export function QuickInteractionForm({ openLogActivityDialog }: { openLogActivityDialog: () => void }) {
  const [dialogs, setDialogs] = useState({
    logPhoneCall: false,
    scheduleAppointment: false,
    sendFollowUp: false,
    createQuote: false,
    logPurchase: false,
    reportIssue: false
  })

  const handleOpenDialog = (dialog: keyof typeof dialogs) => {
    setDialogs(prev => ({ ...prev, [dialog]: true }))
  }

  const handleCloseDialog = (dialog: keyof typeof dialogs) => {
    setDialogs(prev => ({ ...prev, [dialog]: false }))
  }

  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Quick Actions</h2>
        <p className="text-muted-foreground">Perform common CRM tasks quickly and efficiently</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {quickActions.map((action) => {
          if (action.dialog === "logPhoneCall") {
            return (
              <Card 
                key={action.dialog} 
                className={`flex flex-col ${action.bgColor} rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 border-0`}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{action.title}</CardTitle>
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
                  <Button 
                    onClick={openLogActivityDialog}
                    className={`w-full ${action.color.replace('text-', 'bg-').replace('-600', '-500')} hover:${action.color.replace('text-', 'bg-').replace('-600', '-600')} text-white border-0`}
                  >
                    {action.buttonText}
                  </Button>
                </CardContent>
              </Card>
            )
          }
          return (
            <Card 
              key={action.dialog} 
              className={`flex flex-col ${action.bgColor} rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 border-0`}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{action.title}</CardTitle>
                <action.icon className={`h-5 w-5 ${action.color}`} />
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
                <Button 
                  onClick={() => handleOpenDialog(action.dialog as keyof typeof dialogs)}
                  className={`w-full ${action.color.replace('text-', 'bg-').replace('-600', '-500')} hover:${action.color.replace('text-', 'bg-').replace('-600', '-600')} text-white border-0`}
                >
                  {action.buttonText}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <ScheduleAppointmentDialog open={dialogs.scheduleAppointment} onOpenChange={(open) => setDialogs(prev => ({...prev, scheduleAppointment: open}))} />
      <SendFollowUpDialog open={dialogs.sendFollowUp} onOpenChange={(open) => setDialogs(prev => ({...prev, sendFollowUp: open}))} />
      <CreateQuoteDialog open={dialogs.createQuote} onOpenChange={(open) => setDialogs(prev => ({...prev, createQuote: open}))} />
      <LogPurchaseDialog open={dialogs.logPurchase} onOpenChange={(open) => setDialogs(prev => ({...prev, logPurchase: open}))} />
      <ReportIssueDialog open={dialogs.reportIssue} onOpenChange={(open) => setDialogs(prev => ({...prev, reportIssue: open}))} />
    </>
  )
} 