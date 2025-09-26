"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Search, Barcode, Grid, Plus, X, Eye, ShoppingCart, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

// Types
interface Product {
  id: string
  sku: string
  name: string
  price: number
  stock: number
  category: string
  image?: string
  status: string
}

interface OrderItem {
  product: Product
  quantity: number
  customizations?: string
}

export function ItemAdditionInterface() {
  const [activeTab, setActiveTab] = useState("browse")
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [barcodeInput, setBarcodeInput] = useState("")
  const [customItem, setCustomItem] = useState({
    description: "",
    material: "",
    laborHours: "1",
    price: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const barcodeInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  // Fetch products from API
  const fetchProducts = async () => {
    setIsLoadingProducts(true)
    try {
      const response = await fetch("/api/products")
      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }
      const data = await response.json()
      // Handle the correct data structure: data.data.products
      const productsArray = data.data?.products || data.data || []
      setProducts(Array.isArray(productsArray) ? productsArray : [])
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive"
      })
      setProducts([]) // Set empty array on error
    } finally {
      setIsLoadingProducts(false)
      setIsLoading(false)
    }
  }

  // Load products on component mount
  useEffect(() => {
    fetchProducts()
  }, [])

  // Focus barcode input when tab changes to barcode
  useEffect(() => {
    if (activeTab === "barcode" && barcodeInputRef.current) {
      barcodeInputRef.current.focus()
    }
  }, [activeTab])

  // Filter products based on search query and category
  useEffect(() => {
    let filtered = products

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    setFilteredProducts(filtered)
  }, [searchQuery, selectedCategory, products])

  // Calculate order total
  const orderTotal = orderItems.reduce((total, item) => total + item.product.price * item.quantity, 0)

  // Add product to order
  const addToOrder = (product: Product, quantity = 1) => {
    const existingItemIndex = orderItems.findIndex((item) => item.product.id === product.id)

    if (existingItemIndex >= 0) {
      // Update quantity if product already in order
      const updatedItems = [...orderItems]
      updatedItems[existingItemIndex].quantity += quantity
      setOrderItems(updatedItems)
      toast({
        title: "Product Updated",
        description: `Quantity updated for ${product.name}`
      })
    } else {
      // Add new product to order
      setOrderItems([...orderItems, { product, quantity }])
      toast({
        title: "Product Added",
        description: `${product.name} added to order`
      })
    }
  }

  // Remove item from order
  const removeFromOrder = (productId: string) => {
    setOrderItems(orderItems.filter((item) => item.product.id !== productId))
    toast({
      title: "Product Removed",
      description: "Product removed from order"
    })
  }

  // Update item quantity
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return

    const updatedItems = orderItems.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    setOrderItems(updatedItems)
  }

  // Handle barcode submission
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!barcodeInput) return

    // Ensure products is an array before searching
    if (!Array.isArray(products)) {
      toast({
        title: "Error",
        description: "Products not loaded. Please try again.",
        variant: "destructive"
      })
      return
    }

    // Search for the product by SKU
    const product = products.find((p) => p.sku.toLowerCase() === barcodeInput.toLowerCase())

    if (product) {
      addToOrder(product)
      setBarcodeInput("")
      toast({
        title: "Product Found",
        description: `${product.name} added to order`
      })
    } else {
      toast({
        title: "Product Not Found",
        description: `No product found with SKU: ${barcodeInput}`,
        variant: "destructive"
      })
    }
  }

  // Handle custom item creation
  const handleCustomItemSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!customItem.description || !customItem.price) {
      toast({
        title: "Missing Information",
        description: "Please fill in the required fields",
        variant: "destructive"
      })
      return
    }

    const price = Number.parseFloat(customItem.price)
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price",
        variant: "destructive"
      })
      return
    }

    // Create a custom product
    const customProduct: Product = {
      id: `custom-${Date.now()}`,
      sku: `CUSTOM-${Date.now().toString().slice(-4)}`,
      name: "Custom Item",
      price: price,
      stock: 1,
      category: "Custom",
      status: "active"
    }

    addToOrder(customProduct)

    // Reset form
    setCustomItem({
      description: "",
      material: "",
      laborHours: "1",
      price: "",
    })

    // Switch to browse tab
    setActiveTab("browse")
  }

  // Get unique categories from products
  const categories = Array.isArray(products) 
    ? Array.from(new Set(products.map((product) => product.category)))
    : []

  // Checkout handler
  const handleCheckout = async () => {
    if (orderItems.length === 0) {
      toast({
        title: "Empty Order",
        description: "Please add products to your order",
        variant: "destructive"
      })
      return
    }
    
    setIsCheckingOut(true)
    
    try {
      // Calculate total amount
      const totalAmount = orderItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
      
      // Prepare order data for API
      const orderData = {
        customerId: "1", // For demo purposes, use a default customer ID
        customerName: "Demo Customer",
        customerEmail: "demo@example.com",
        customerPhone: "555-0123",
        items: orderItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.product.price,
          material: item.customizations || "Standard",
          diamond: {},
          setting: {},
          customSpecs: item.customizations || ""
        })),
        totalAmount: totalAmount,
        taxAmount: totalAmount * 0.08, // 8% tax
        shippingAmount: 10,
        discountAmount: 0,
        notes: "Order created via item addition interface",
        deliveryMethod: "Standard Shipping",
        paymentMethod: "Credit Card",
        expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days from now
      }

      // Call the orders API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create order')
      }

      const result = await response.json()
      console.log('Order created successfully:', result)
      
      // Persist order to localStorage for summary page
      localStorage.setItem("checkoutOrder", JSON.stringify(orderItems))
      
      toast({
        title: "Order Created Successfully",
        description: "Your order has been created and saved."
      })
      
      router.push("/dashboard/orders/summary")
      
    } catch (error: any) {
      console.error('Failed to create order:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create order. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsCheckingOut(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading products...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row">
        {/* Left side - Item addition methods */}
        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="browse">
                <Grid className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Browse</span>
              </TabsTrigger>
              <TabsTrigger value="search">
                <Search className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Search</span>
              </TabsTrigger>
              <TabsTrigger value="barcode">
                <Barcode className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Barcode</span>
              </TabsTrigger>
              <TabsTrigger value="custom">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Custom</span>
              </TabsTrigger>
            </TabsList>

            {/* Browse Catalog Tab */}
            <TabsContent value="browse" className="border-none p-0 pt-4">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant={selectedCategory === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                  >
                    All
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>

                {isLoadingProducts ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading products...</span>
                    </div>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No products found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => (
                      <Card key={product.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm">{product.name}</h3>
                              <p className="text-xs text-muted-foreground">{product.sku}</p>
                            </div>
                            <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
                            <span className="text-xs text-muted-foreground">{product.category}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => setQuickViewProduct(product)}
                              variant="outline"
                              className="flex-1"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => addToOrder(product)}
                              disabled={product.stock === 0}
                              className="flex-1"
                            >
                              <ShoppingCart className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Search Tab */}
            <TabsContent value="search" className="border-none p-0 pt-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search products by name, SKU, or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={() => setSearchQuery("")} variant="outline" size="sm">
                    Clear
                  </Button>
                </div>
                
                {searchQuery && (
                  <div className="text-sm text-muted-foreground">
                    Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                  </div>
                )}

                {filteredProducts.length === 0 && searchQuery && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No products found for "{searchQuery}"</p>
                  </div>
                )}

                {filteredProducts.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => (
                      <Card key={product.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm">{product.name}</h3>
                              <p className="text-xs text-muted-foreground">{product.sku}</p>
                            </div>
                            <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
                            <span className="text-xs text-muted-foreground">{product.category}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => setQuickViewProduct(product)}
                              variant="outline"
                              className="flex-1"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => addToOrder(product)}
                              disabled={product.stock === 0}
                              className="flex-1"
                            >
                              <ShoppingCart className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Barcode Tab */}
            <TabsContent value="barcode" className="border-none p-0 pt-4">
              <div className="space-y-4">
                <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
                  <Input
                    ref={barcodeInputRef}
                    placeholder="Scan or enter product SKU..."
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!barcodeInput}>
                    Search
                  </Button>
                </form>
                
                <div className="text-sm text-muted-foreground">
                  Enter a product SKU to quickly add it to your order
                </div>
              </div>
            </TabsContent>

            {/* Custom Item Tab */}
            <TabsContent value="custom" className="border-none p-0 pt-4">
              <div className="space-y-4">
                <form onSubmit={handleCustomItemSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe the custom item..."
                        value={customItem.description}
                        onChange={(e) => setCustomItem({ ...customItem, description: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="material">Material</Label>
                      <Input
                        id="material"
                        placeholder="e.g., Gold, Silver, Platinum"
                        value={customItem.material}
                        onChange={(e) => setCustomItem({ ...customItem, material: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="laborHours">Labor Hours</Label>
                      <Input
                        id="laborHours"
                        type="number"
                        min="0"
                        step="0.5"
                        value={customItem.laborHours}
                        onChange={(e) => setCustomItem({ ...customItem, laborHours: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price *</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={customItem.price}
                        onChange={(e) => setCustomItem({ ...customItem, price: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Add Custom Item
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right side - Order summary */}
        <div className="w-full md:w-80">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Order Summary</h3>
              
              {orderItems.length === 0 ? (
                <p className="text-muted-foreground text-sm">No items in order</p>
              ) : (
                <div className="space-y-3">
                  {orderItems.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ${item.product.price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFromOrder(item.product.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-lg">${orderTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleCheckout}
                    disabled={isCheckingOut || orderItems.length === 0}
                    className="w-full"
                  >
                    {isCheckingOut ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Proceed to Checkout
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick View Dialog */}
      <Dialog open={!!quickViewProduct} onOpenChange={() => setQuickViewProduct(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{quickViewProduct?.name}</DialogTitle>
            <DialogDescription>
              SKU: {quickViewProduct?.sku}
            </DialogDescription>
          </DialogHeader>
          
          {quickViewProduct && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">${quickViewProduct.price.toFixed(2)}</span>
                <Badge variant={quickViewProduct.stock > 0 ? "default" : "destructive"}>
                  {quickViewProduct.stock > 0 ? `${quickViewProduct.stock} in stock` : "Out of stock"}
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>Category: {quickViewProduct.category}</p>
                <p>Status: {quickViewProduct.status}</p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    addToOrder(quickViewProduct)
                    setQuickViewProduct(null)
                  }}
                  disabled={quickViewProduct.stock === 0}
                  className="flex-1"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Order
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setQuickViewProduct(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
