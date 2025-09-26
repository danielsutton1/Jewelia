'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import Link from "next/link"

interface Customer {
  id: string
  full_name: string
  email: string
  phone?: string
  created_at: string
  total_spent?: number
}

export function RecentSales() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/customers?limit=5')
        if (!response.ok) {
          throw new Error('Failed to fetch customers')
        }
        
        const data = await response.json()
        setCustomers(data.data || [])
      } catch (error) {
        console.error('Error fetching customers:', error)
        setError('Failed to load customers')
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        <span className="ml-2 text-gray-600">Loading customers...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No customers found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {customers.map((customer) => (
        <div key={customer.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/diverse-group-avatars.png" alt="Avatar" />
            <AvatarFallback>{getInitials(customer.full_name)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <Link 
              href={`/dashboard/customers/${customer.id}`} 
              className="text-sm font-medium leading-none text-blue-600 underline hover:text-blue-800"
            >
              {customer.full_name}
            </Link>
            <p className="text-sm text-muted-foreground">{customer.email}</p>
          </div>
          <div className="ml-auto font-medium">
            {customer.total_spent ? `+$${customer.total_spent.toFixed(2)}` : 'New Customer'}
          </div>
        </div>
      ))}
    </div>
  )
}
