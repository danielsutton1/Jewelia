"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AddConsignedItemPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [value, setValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)
    try {
      const res = await fetch("/api/inventory/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, value: Number(value) }),
      })
      if (!res.ok) throw new Error("Failed to add item to inventory.")
      setSuccess(true)
      setTimeout(() => router.push("/dashboard/consignment"), 1000)
    } catch (err: any) {
      setError(err.message || "An error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Add Consigned Item</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Item Name</Label>
          <Input id="name" value={name} onChange={e => setName(e.target.value)} required disabled={loading} />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Input id="description" value={description} onChange={e => setDescription(e.target.value)} required disabled={loading} />
        </div>
        <div>
          <Label htmlFor="value">Value</Label>
          <Input id="value" type="number" value={value} onChange={e => setValue(e.target.value)} required disabled={loading} />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">Item added to inventory!</div>}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="secondary" onClick={() => router.push("/dashboard/consignment")}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Item"}</Button>
        </div>
      </form>
    </div>
  )
} 
 