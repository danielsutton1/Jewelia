"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PartnerForm } from "@/components/partners/partner-form"

export default function AddPartnerPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Partner</h1>
        <p className="text-muted-foreground mt-2">
          Register a new partner, supplier, or service provider
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Partner Information</CardTitle>
          <CardDescription>
            Enter the partner details below. All fields marked with an asterisk (*) are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PartnerForm />
        </CardContent>
      </Card>
    </div>
  )
} 
 
 