import type { Metadata } from "next"
import JewelryItemForm from "@/components/inventory/jewelry-item-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Add Jewelry Item | Jewelia CRM",
  description: "Add a new jewelry item to your inventory",
}

export default function AddJewelryItemPage() {
  return (
    <div className="p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Add Jewelry Item</CardTitle>
          <CardDescription>Add a new jewelry item to your inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <JewelryItemForm />
        </CardContent>
      </Card>
    </div>
  )
}
