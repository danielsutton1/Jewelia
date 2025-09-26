"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, Phone, Edit, MapPin, ArrowLeft } from "lucide-react"
import { getCustomer } from "@/lib/database"
import { Customer } from "@/types/database"
import { toast } from "sonner"

export default function CustomerDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const customerId = params?.id as string
  const [loading, setLoading] = useState(true)
  const [customer, setCustomer] = useState<Customer | null>(null)

  useEffect(() => {
    if (!customerId) {
      toast.error("Invalid customer ID.")
      router.push("/dashboard/customers")
      return
    }

    setLoading(true)
    
    getCustomer(customerId)
      .then((data) => {
        setCustomer(data)
      })
      .catch((error) => {
        console.error('Error loading customer:', error)
        toast.error("Customer not found.")
        router.push("/dashboard/customers")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [customerId, router])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-2 md:px-0">
        <div className="text-center">
          <div className="animate-spin rounded-full border-2 border-gray-300 border-t-emerald-600 h-8 w-8 mx-auto"></div>
          <p className="mt-4 text-emerald-700 font-medium">Loading customer details...</p>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-2 md:px-0">
        <div className="text-center text-destructive">
          <h1 className="text-2xl font-bold mb-4">Customer Not Found</h1>
          <p className="mb-4">The customer you're looking for doesn't exist.</p>
          <Link href="/dashboard/customers">
            <Button>Back to Customers</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-2 md:px-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/customers">
            <Button variant="outline" size="sm" className="border-emerald-200 text-emerald-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Customers
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-serif font-bold text-emerald-900">
              Customer Details
            </h1>
            <p className="text-muted-foreground">Customer ID: <span className="font-mono">{customerId}</span></p>
          </div>
        </div>
        <Link href={`/dashboard/customers/${customer.id}/edit`}>
          <Button variant="default" size="sm" className="bg-emerald-600 text-white font-semibold shadow-md">
            <Edit className="h-4 w-4 mr-1" /> Edit Customer
          </Button>
        </Link>
      </div>

      {/* Customer Information */}
      <Card className="shadow-md border-0 rounded-2xl bg-gradient-to-br from-emerald-50 to-white">
        <CardHeader>
          <CardTitle className="font-serif text-emerald-900 text-2xl">
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 border-4 border-emerald-400 shadow-lg">
              <AvatarImage src="/diverse-avatars.png" alt={customer.full_name} />
              <AvatarFallback className="text-2xl">{customer.full_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-emerald-900 mb-2">{customer.full_name}</h2>
              <p className="text-emerald-700 font-medium">{customer.company || "No company specified"}</p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{customer.email || "No email provided"}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{customer.phone || "No phone provided"}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{customer.address || "No address provided"}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {customer.notes && (
            <div>
              <h3 className="text-lg font-semibold text-emerald-900 mb-2">Notes</h3>
              <p className="text-gray-700 bg-white p-4 rounded-lg border">{customer.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 
 
 
 
 