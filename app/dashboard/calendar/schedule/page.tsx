"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AppointmentForm } from "@/components/calendar/appointment-form"
import { ArrowLeft, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function ScheduleAppointmentPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12 max-w-4xl w-full">
        {/* Elegant Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100 min-h-[44px] min-w-[44px]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full mb-4 shadow-lg">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-emerald-700 to-emerald-900 bg-clip-text text-transparent mb-2 schedule-heading">
              Schedule Appointment
            </h1>
            <p className="text-emerald-600 font-medium schedule-subtext">
              Schedule a new appointment with a customer
            </p>
          </div>
        </div>
        {/* Form Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100/50 overflow-hidden px-2 sm:px-6 md:px-10 py-4 sm:py-8">
          <AppointmentForm />
        </div>
      </div>
    </div>
  )
} 
 
 