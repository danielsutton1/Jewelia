import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Edit, Trash, Share2, Heart, ShoppingCart, Package, Tag, Clock, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  // In a real app, you would fetch the product data based on the ID
  const product = {
    id: resolvedParams.id,
    name: "Diamond Engagement Ring",
    description:
      "A beautiful 1.5 carat diamond engagement ring set in 18k white gold with a classic solitaire setting.",
    price: 1299.99,
    comparePrice: 1499.99,
    images: ["/sparkling-diamond-ring.png", "/placeholder-fi0lx.png", "/placeholder-ky43w.png"],
    category: "Rings",
    subcategory: "Engagement Rings",
    sku: "RING-DIA-001",
    barcode: "123456789012",
    stock: 12,
    status: "In Stock",
    materials: ["18k White Gold", "Diamond"],
    gemstones: [
      {
        type: "Diamond",
        carat: "1.5",
        cut: "Round Brilliant",
        color: "F",
        clarity: "VS1",
      },
    ],
    dimensions: {
      ringSize: "6",
      width: "2.3mm",
      weight: "4.2g",
    },
    tags: ["Engagement", "Diamond", "White Gold", "Solitaire"],
    vendor: "Luxury Diamonds Co.",
    createdAt: "2023-01-15",
    updatedAt: "2023-04-22",
    salesData: {
      totalSold: 28,
      revenue: 36399.72,
      averageRating: 4.8,
      reviewCount: 15,
    },
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{product.name}</h1>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Product Images */}
        <div className="flex flex-col gap-4 lg:w-1/2">
          <div className="overflow-hidden rounded-lg border bg-white">
            <Image
              src={product.images[0] || "/placeholder.svg"}
              alt={product.name}
              width={600}
              height={600}
              className="h-auto w-full object-cover"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {product.images.map((image, index) => (
              <div key={index} className="overflow-hidden rounded-lg border bg-white">
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${product.name} ${index + 1}`}
                  width={200}
                  height={200}
                  className="h-auto w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-6 lg:w-1/2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Product Information</CardTitle>
                  <CardDescription>Details and specifications</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">${product.price.toFixed(2)}</h2>
                    {product.comparePrice && (
                      <span className="text-lg text-muted-foreground line-through">
                        ${product.comparePrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <Badge className="bg-emerald-500">{product.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {product.stock} in stock • SKU: {product.sku}
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="mb-2 font-medium">Description</h3>
                <p className="text-sm text-muted-foreground">{product.description}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="mb-2 font-medium">Category</h3>
                  <p className="text-sm text-muted-foreground">
                    {product.category} / {product.subcategory}
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-medium">Vendor</h3>
                  <p className="text-sm text-muted-foreground">{product.vendor}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-2 font-medium">Materials</h3>
                <div className="flex flex-wrap gap-2">
                  {product.materials.map((material, index) => (
                    <Badge key={index} variant="outline">
                      {material}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-2 font-medium">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1 gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Add to Order
                </Button>
                <Button variant="destructive" size="icon">
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="sales">Sales Data</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2 rounded-lg border p-3">
                  <Package className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <h4 className="font-medium">Inventory</h4>
                    <p className="text-sm text-muted-foreground">{product.stock} units in stock</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-lg border p-3">
                  <Tag className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <h4 className="font-medium">SKU & Barcode</h4>
                    <p className="text-sm text-muted-foreground">
                      {product.sku} • {product.barcode}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-lg border p-3">
                  <Clock className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <h4 className="font-medium">Created</h4>
                    <p className="text-sm text-muted-foreground">{product.createdAt}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-lg border p-3">
                  <Clock className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <h4 className="font-medium">Last Updated</h4>
                    <p className="text-sm text-muted-foreground">{product.updatedAt}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="specifications" className="space-y-4 pt-4">
              <div className="rounded-lg border">
                <div className="bg-muted px-4 py-2 font-medium">Gemstone Details</div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    {product.gemstones.map((gemstone, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Type:</span>
                          <span className="text-sm">{gemstone.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Carat:</span>
                          <span className="text-sm">{gemstone.carat}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Cut:</span>
                          <span className="text-sm">{gemstone.cut}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Color:</span>
                          <span className="text-sm">{gemstone.color}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Clarity:</span>
                          <span className="text-sm">{gemstone.clarity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border">
                <div className="bg-muted px-4 py-2 font-medium">Dimensions</div>
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Ring Size:</span>
                      <span className="text-sm">{product.dimensions.ringSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Width:</span>
                      <span className="text-sm">{product.dimensions.width}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Weight:</span>
                      <span className="text-sm">{product.dimensions.weight}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="sales" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2 rounded-lg border p-3">
                  <ShoppingCart className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <h4 className="font-medium">Total Sold</h4>
                    <p className="text-sm text-muted-foreground">{product.salesData.totalSold} units</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-lg border p-3">
                  <BarChart3 className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <h4 className="font-medium">Revenue</h4>
                    <p className="text-sm text-muted-foreground">${product.salesData.revenue.toFixed(2)}</p>
                  </div>
                </div>
                <div className="col-span-2 flex items-start gap-2 rounded-lg border p-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className={`h-4 w-4 ${i < Math.floor(product.salesData.averageRating) ? "opacity-100" : "opacity-30"}`}
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ))}
                    <span className="ml-1 text-sm font-medium">
                      {product.salesData.averageRating} ({product.salesData.reviewCount} reviews)
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
