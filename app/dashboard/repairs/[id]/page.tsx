"use client"

import { useParams } from "next/navigation"
import { RepairDetails } from "@/components/repairs/repair-details"

export default function RepairDetailsPage() {
  const params = useParams()
  const id = params.id as string

  // You can add data fetching logic here if needed,
  // or pass the ID to the component to handle its own data fetching.
  return (
    <div className="p-6">
      <RepairDetails repairId={id} />
    </div>
  )
} 