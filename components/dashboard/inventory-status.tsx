import { AlertTriangle, CheckCircle, Package } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

const inventoryItems = [
  {
    id: 1,
    name: "Silver Necklace",
    stock: 24,
    total: 50,
    status: "normal",
  },
  {
    id: 2,
    name: "Gold Earrings",
    stock: 5,
    total: 30,
    status: "low",
  },
  {
    id: 3,
    name: "Diamond Ring",
    stock: 12,
    total: 20,
    status: "normal",
  },
  {
    id: 4,
    name: "Pearl Bracelet",
    stock: 0,
    total: 15,
    status: "out",
  },
]

export function InventoryStatus() {
  return (
    <div className="space-y-4">
      {inventoryItems.map((item) => (
        <div key={item.id} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <Link href={`/dashboard/inventory/${item.id}`} className="font-medium text-blue-600 underline hover:text-blue-800 transition-colors">
                {item.name}
              </Link>
            </div>
            {item.status === "normal" ? (
              <div className="flex items-center gap-1 text-emerald-500">
                <CheckCircle className="h-4 w-4" />
                <span className="text-xs">In Stock</span>
              </div>
            ) : item.status === "low" ? (
              <div className="flex items-center gap-1 text-amber-500">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs">Low Stock</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs">Out of Stock</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Progress
              value={(item.stock / item.total) * 100}
              className={`h-2 ${
                item.status === "normal"
                  ? "bg-emerald-100"
                  : item.status === "low"
                    ? "bg-amber-100"
                    : "bg-destructive/20"
              }`}
            />
            <span className="text-xs text-muted-foreground">
              {item.stock}/{item.total}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
