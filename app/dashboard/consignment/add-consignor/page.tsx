"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AddConsignorPage() {
  const router = useRouter()
  const [consignor, setConsignor] = useState({ name: "", email: "", phone: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically handle the submission, e.g., sending data to an API
    console.log("Consignor added:", consignor)
    router.push("/dashboard/consignment")
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-4">Add Consignor</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={consignor.name}
            onChange={(e) => setConsignor({ ...consignor, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={consignor.email}
            onChange={(e) => setConsignor({ ...consignor, email: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={consignor.phone}
            onChange={(e) => setConsignor({ ...consignor, phone: e.target.value })}
            required
          />
        </div>
        <Button type="submit">Add Consignor</Button>
      </form>
    </div>
  )
} 
 