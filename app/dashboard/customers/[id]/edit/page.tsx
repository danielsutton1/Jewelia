"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, Phone, MapPin, Edit, ArrowLeft, Save, X } from "lucide-react"
import { toast } from "sonner"
import { getCustomer, updateCustomer } from "@/lib/database"
import { Customer } from "@/types/database"
import Link from "next/link"

export default function EditCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params?.id as string;
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    setLoading(true)
    getCustomer(customerId)
      .then((data) => {
        if (!data) {
          throw new Error('Customer not found')
        }
        setCustomer(data)
        setFullName(data.full_name || "")
        setEmail(data.email || "")
        setPhone(data.phone || "")
        setAddress(data.address || "")
        setNotes(data.notes || "")
      })
      .catch(() => {
        toast.error("Customer not found.")
        router.push("/dashboard/customers")
      })
      .finally(() => setLoading(false))
  }, [customerId, router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true)
    try {
      await updateCustomer(customerId, {
        full_name: fullName,
        email,
        phone,
        address,
        notes,
      })
      toast.success("Customer updated successfully.")
      router.push(`/dashboard/customers/${customerId}`)
    } catch (error: any) {
      toast.error(error.message || "Failed to update customer.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-2 md:px-0">
        <div className="text-center text-muted-foreground">Loading customer details...</div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-2 md:px-0">
        <div className="text-center text-destructive">Customer not found.</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-2 md:px-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/customers/${customerId}`}>
            <Button variant="outline" size="sm" className="border-emerald-200 text-emerald-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Details
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-serif font-bold text-emerald-900" style={{ fontFamily: 'Playfair Display, serif' }}>
              Edit Customer
            </h1>
            <p className="text-muted-foreground">Customer ID: <span className="font-mono">{customerId}</span></p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave}>
        <Card className="shadow-md border-0 rounded-2xl bg-gradient-to-br from-emerald-50 to-white">
          <CardHeader>
            <CardTitle className="font-serif text-emerald-900 text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium text-muted-foreground">Full Name</label>
                <Input 
                  id="fullName" 
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)} 
                  required 
                  className="border-emerald-200 focus:border-emerald-500"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-muted-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-500" />
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                    className="pl-10 border-emerald-200 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-muted-foreground">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-500" />
                  <Input 
                    id="phone" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    required 
                    className="pl-10 border-emerald-200 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="address" className="text-sm font-medium text-muted-foreground">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-500" />
                  <Input 
                    id="address" 
                    value={address} 
                    onChange={e => setAddress(e.target.value)} 
                    className="pl-10 border-emerald-200 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium text-muted-foreground">Notes</label>
              <Input 
                id="notes" 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                className="border-emerald-200 focus:border-emerald-500"
              />
            </div>
            <div className="flex gap-3 justify-end pt-6 border-t border-emerald-200">
              <Link href={`/dashboard/customers/${customerId}`}>
                <Button variant="outline" type="button" className="border-emerald-200 text-emerald-700">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={saving} className="bg-emerald-600 text-white hover:bg-emerald-700">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
} 
 
 