"use client"

import { useEffect, useState } from "react"
import { useApi } from "@/lib/api-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"

export default function InventoryItemPage() {
  const api = useApi()
  const router = useRouter()
  const params = useParams()
  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const data = await api.inventory.get(String(params.id))
        if (!data) {
          setError("Item not found")
        } else {
          setItem(data)
        }
      } catch (e) {
        setError("Error fetching item")
      } finally {
        setLoading(false)
      }
    }
    if (params.id) fetchItem()
  }, [params.id])

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>
  }
  if (!item) {
    return <div className="p-8 text-center text-red-500">Item not found</div>
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/inventory">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Inventory
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{item.name}</h1>
        </div>
        <Button asChild>
          <Link href={`/inventory/${item.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Item
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">SKU</p>
                <p>{item.sku}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Category</p>
                <p>{item.category}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p>{item.status}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p>{item.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cost Price</p>
                <p>${item.cost?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Retail Price</p>
                <p>${item.retailPrice?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sale Price</p>
                <p>${item.salePrice?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Quantity</p>
                <p>{item.quantity}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {item.metalType && (
          <Card>
            <CardHeader>
              <CardTitle>Metal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Metal Type</p>
                  <p>{item.metalType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Purity</p>
                  <p>{item.purity}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Color</p>
                  <p>{item.metalColor}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Hallmarks</p>
                  <p>{item.hallmarks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {item.stoneType && (
          <Card>
            <CardHeader>
              <CardTitle>Stone Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Stone Type</p>
                  <p>{item.stoneType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Weight</p>
                  <p>{item.stoneWeight} carats</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Color</p>
                  <p>{item.stoneColor}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Clarity</p>
                  <p>{item.stoneClarity}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cut</p>
                  <p>{item.stoneCut}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Count</p>
                  <p>{item.stoneCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {item.watchMovement && (
          <Card>
            <CardHeader>
              <CardTitle>Watch Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Movement</p>
                  <p>{item.watchMovement}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Case Size</p>
                  <p>{item.watchCaseSize}mm</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Band Material</p>
                  <p>{item.watchBandMaterial}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Water Resistance</p>
                  <p>{item.watchWaterResistance}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="mt-1">{item.description}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Notes</p>
              <p className="mt-1">{item.notes}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Warranty Information</p>
              <p className="mt-1">{item.warrantyInfo}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Care Instructions</p>
              <p className="mt-1">{item.careInstructions}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
 
 