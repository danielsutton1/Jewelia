"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { MoreHorizontal, ArrowUpDown, Eye, Edit, Trash, Copy, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { useApi } from "@/lib/api-service"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import Link from "next/link"
import { toast } from "sonner"
import { Drawer } from "@/components/ui/drawer"
import { copyToClipboard } from "@/components/ui/utils";

// Sample product data
export const products = [
  {
    id: "PRD-001",
    name: "Diamond Engagement Ring",
    images: [
      "/assorted-jewelry-display.png",
      "/diamond-ring-closeup.png",
      "/diamond-ring-side.png"
    ],
    image: "/assorted-jewelry-display.png",
    category: "Rings",
    price: 1299.99,
    stock: 12,
    status: "In Stock",
    sku: "RING-DIA-001",
  },
  {
    id: "PRD-002",
    name: "Gold Chain Necklace",
    images: [
      "/gold-necklace.png",
      "/gold-necklace-on-model.png"
    ],
    image: "/gold-necklace.png",
    category: "Necklaces",
    price: 599.99,
    stock: 8,
    status: "In Stock",
    sku: "NECK-GLD-002",
  },
  {
    id: "PRD-003",
    name: "Silver Hoop Earrings",
    image: "/silver-earrings.png",
    category: "Earrings",
    price: 129.99,
    stock: 24,
    status: "In Stock",
    sku: "EAR-SLV-003",
  },
  {
    id: "PRD-004",
    name: "Pearl Bracelet",
    image: "/placeholder-epkys.png",
    category: "Bracelets",
    price: 249.99,
    stock: 0,
    status: "Out of Stock",
    sku: "BRC-PRL-004",
  },
  {
    id: "PRD-005",
    name: "Sapphire Pendant",
    image: "/sapphire-pendant.png",
    category: "Pendants",
    price: 349.99,
    stock: 5,
    status: "Low Stock",
    sku: "PND-SPH-005",
  },
  {
    id: "PRD-006",
    name: "Platinum Wedding Band",
    image: "/placeholder-oktuv.png",
    category: "Rings",
    price: 899.99,
    stock: 15,
    status: "In Stock",
    sku: "RING-PLT-006",
  },
  {
    id: "PRD-007",
    name: "Ruby Stud Earrings",
    image: "/placeholder-e5jke.png",
    category: "Earrings",
    price: 499.99,
    stock: 3,
    status: "Low Stock",
    sku: "EAR-RBY-007",
  },
  {
    id: "PRD-008",
    name: "Emerald Tennis Bracelet",
    image: "/emerald-bracelet.png",
    category: "Bracelets",
    price: 1499.99,
    stock: 2,
    status: "Low Stock",
    sku: "BRC-EMR-008",
  },
]

/**
 * ProductsTable (Reusable)
 * Props:
 * - products: array of product objects (optional, defaults to sample/mock array)
 * - onSelectProduct: (productId: string) => void (optional, for controlled selection)
 * - selectedProductIds: string[] (optional, for controlled selection)
 * - actionButtonLabel: string (optional, e.g., 'Add to Trade', defaults to 'Add to Cart')
 * - onActionButtonClick: (productId: string) => void (optional, for custom action)
 * - showCartButton: boolean (optional, defaults to true)
 * - actionsMenu: (product: Product) => React.ReactNode (optional, for custom dropdown actions)
 */
import React from 'react'

export function ProductsTable({
  products: productsProp,
  onSelectProduct,
  selectedProductIds,
  actionButtonLabel = 'Add to Cart',
  onActionButtonClick,
  showCartButton = true,
  actionsMenu,
  search = '',
  category = 'all',
  material = 'all',
  gemstone = 'all',
  stockStatus = 'all',
  priceRange = 'all',
}: {
  products?: typeof products,
  onSelectProduct?: (productId: string) => void,
  selectedProductIds?: string[],
  actionButtonLabel?: string,
  onActionButtonClick?: (productId: string) => void,
  showCartButton?: boolean,
  actionsMenu?: (product: typeof products[0]) => React.ReactNode,
  search?: string,
  category?: string,
  material?: string,
  gemstone?: string,
  stockStatus?: string,
  priceRange?: string,
} = {}) {
  let productsList = productsProp || products

  // Filtering logic
  productsList = productsList.filter(product => {
    // Search
    if (search && !product.name.toLowerCase().includes(search.toLowerCase()) && !product.sku.toLowerCase().includes(search.toLowerCase())) {
      return false
    }
    // Category
    if (category !== 'all' && product.category !== category) {
      return false
    }
    // Material (only if product.material exists)
    if (material !== 'all' && 'material' in product && product.material !== material) {
      return false
    }
    // Gemstone (only if product.gemstone exists)
    if (gemstone !== 'all' && 'gemstone' in product && product.gemstone !== gemstone) {
      return false
    }
    // Stock Status
    if (stockStatus !== 'all' && product.status !== stockStatus) {
      return false
    }
    // Price Range (stub, since no UI for min/max, but example logic)
    if (priceRange !== 'all') {
      if (priceRange === 'under-500' && product.price >= 500) return false
      if (priceRange === '500-1000' && (product.price < 500 || product.price > 1000)) return false
      if (priceRange === 'over-1000' && product.price <= 1000) return false
    }
    return true
  })
  const [selectedProducts, setSelectedProducts] = useState<string[]>(selectedProductIds || [])
  const [sorting, setSorting] = useState<"asc" | "desc" | null>(null)
  const [sortBy, setSortBy] = useState<string | null>(null)
  const router = useRouter()
  const api = useApi()
  const [imageModalProduct, setImageModalProduct] = useState<(typeof products[0]) | null>(null)
  const [modalImageIdx, setModalImageIdx] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const [presentMode, setPresentMode] = useState(false)
  const mainImgRef = useRef<HTMLImageElement | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const [cart, setCart] = useState<{id: string, quantity: number}[]>([])
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)

  const sortedProducts = [...productsList].sort((a, b) => {
    if (!sorting || !sortBy) return 0

    const aValue = a[sortBy as keyof typeof a] ?? ''
    const bValue = b[sortBy as keyof typeof b] ?? ''

    if (sorting === "asc") {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const handleSort = (column: string) => {
    if (sortBy === column) {
      if (sorting === "asc") {
        setSorting("desc")
      } else if (sorting === "desc") {
        setSorting(null)
        setSortBy(null)
      } else {
        setSorting("asc")
      }
    } else {
      setSortBy(column)
      setSorting("asc")
    }
  }

  const handleSelectAll = () => {
    if (selectedProducts.length === productsList.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(productsList.map((product) => product.id))
    }
  }

  const handleSelectProduct = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId))
    } else {
      setSelectedProducts([...selectedProducts, productId])
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "In Stock":
        return <Badge className="bg-emerald-500">In Stock</Badge>
      case "Low Stock":
        return <Badge className="bg-amber-500">Low Stock</Badge>
      case "Out of Stock":
        return (
          <Badge variant="outline" className="text-destructive border-destructive">
            Out of Stock
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleDuplicate = async (product: typeof products[0]) => {
    try {
      const data = await api.inventory.get(product.id)
      if (data) {
        const { id, createdAt, updatedAt, ...rest } = data
        await api.inventory.create(rest)
        alert(`Product duplicated: ${data.name}`)
      }
    } catch (e) {
      alert("Error duplicating product")
    }
  }

  const handleDelete = async (product: typeof products[0]) => {
    if (confirm(`Are you sure you want to delete ${product.name}?`)) {
      try {
        await api.inventory.delete(product.id)
        alert(`Deleted product: ${product.name}`)
        // Optionally refresh the list here
      } catch (e) {
        alert("Error deleting product")
      }
    }
  }

  // Helper to get images array for a product
  const getProductImages = (product: typeof products[0] | null) => {
    if (!product) return []
    if (Array.isArray(product.images) && product.images.length > 0) return product.images
    if (product.image) return [product.image]
    return ["/placeholder.svg"]
  }

  // Keyboard navigation for modal
  useEffect(() => {
    if (!imageModalProduct) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setModalImageIdx(idx => (idx + 1) % getProductImages(imageModalProduct).length)
      if (e.key === "ArrowLeft") setModalImageIdx(idx => (idx === 0 ? getProductImages(imageModalProduct).length - 1 : idx - 1))
      if (e.key === "Escape") setImageModalProduct(null)
      if (e.key === "f") setIsFullscreen(f => !f)
      if (e.key === "z") setIsZoomed(z => !z)
      if (e.key === "p") setPresentMode(p => !p)
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [imageModalProduct])

  // Fullscreen API
  useEffect(() => {
    if (!dialogRef.current) return
    if (isFullscreen) {
      dialogRef.current.requestFullscreen?.()
    } else {
      document.fullscreenElement && document.exitFullscreen?.()
    }
  }, [isFullscreen])

  // Touch swipe support
  useEffect(() => {
    if (!dialogRef.current) return
    let startX = 0
    let endX = 0
    const handleTouchStart = (e: TouchEvent) => { startX = e.touches[0].clientX }
    const handleTouchMove = (e: TouchEvent) => { endX = e.touches[0].clientX }
    const handleTouchEnd = () => {
      if (!imageModalProduct) return
      if (startX - endX > 50) setModalImageIdx(idx => (idx + 1) % getProductImages(imageModalProduct).length)
      if (endX - startX > 50) setModalImageIdx(idx => (idx === 0 ? getProductImages(imageModalProduct).length - 1 : idx - 1))
    }
    const node = dialogRef.current
    node.addEventListener("touchstart", handleTouchStart)
    node.addEventListener("touchmove", handleTouchMove)
    node.addEventListener("touchend", handleTouchEnd)
    return () => {
      node.removeEventListener("touchstart", handleTouchStart)
      node.removeEventListener("touchmove", handleTouchMove)
      node.removeEventListener("touchend", handleTouchEnd)
    }
  }, [imageModalProduct])

  // Share button logic
  const handleShare = () => {
    const url = getProductImages(imageModalProduct)[modalImageIdx]
    copyToClipboard(window.location.origin + url, (msg) => alert(msg));
  }

  // Zoom logic (simple toggle, TODO: pinch zoom for mobile)
  const handleZoom = () => setIsZoomed(z => !z)

  // Present mode hides all UI except image and product name
  const presentClass = presentMode ? "bg-black text-white" : ""

  const handleAddToCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find(item => item.id === productId)
      if (existing) {
        // Find product stock
        const product = productsList.find(p => p.id === productId)
        if (product && existing.quantity < product.stock) {
          toast.success("Increased quantity in cart!")
          return prev.map(item => item.id === productId ? { ...item, quantity: item.quantity + 1 } : item)
        } else {
          toast.error("Cannot add more than available stock!")
          return prev
        }
      }
      toast.success("Added to cart!")
      return [...prev, { id: productId, quantity: 1 }]
    })
  }

  // Update cartProducts and cartTotal logic
  const cartProducts = sortedProducts.filter(p => cart.some(item => item.id === p.id))
    .map(p => ({
      ...p,
      quantity: cart.find(item => item.id === p.id)?.quantity || 1
    }))
  const cartTotal = cartProducts.reduce((sum, p) => sum + p.price * p.quantity, 0)

  // Update handleRemoveFromCart
  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId))
  }

  // Add quantity controls for cart (for use in cart page)
  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity } : item))
  }

  // Handle checkout - save cart to localStorage and redirect to order summary
  const handleCheckout = () => {
    if (cartProducts.length === 0) return
    
    // Convert cart products to order items format expected by order summary
    const orderItems = cartProducts.map(product => ({
      id: `item-${product.id}`,
      image: getProductImages(product)[0],
      sku: product.sku,
      name: product.name,
      description: `${product.category} - ${product.name}`,
      quantity: product.quantity,
      unitPrice: product.price,
      discount: { type: "percentage" as const, value: 0, reason: "" },
      taxExempt: false,
      notes: "",
    }))

    // Save to localStorage (same key used by ItemAdditionInterface)
    localStorage.setItem("checkoutOrder", JSON.stringify(orderItems))
    
    // Clear cart
    setCart([])
    setCartDrawerOpen(false)
    
    // Show success message
    toast.success("Cart saved! Redirecting to checkout...")
    
    // Redirect to order summary page
    router.push("/dashboard/orders/summary")
  }

  return (
    <div className="rounded-md border relative">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={selectedProductIds ? selectedProductIds.length === productsList.length && productsList.length > 0 : selectedProducts.length === productsList.length && productsList.length > 0}
                onCheckedChange={() => {
                  if (onSelectProduct && selectedProductIds) {
                    // Call onSelectProduct for all or none
                    if (selectedProductIds.length === productsList.length) {
                      productsList.forEach(p => onSelectProduct(p.id)) // Unselect all
                    } else {
                      productsList.forEach(p => {
                        if (!selectedProductIds.includes(p.id)) onSelectProduct(p.id)
                      }) // Select all
                    }
                  } else {
                    handleSelectAll()
                  }
                }}
                aria-label="Select all products"
              />
            </TableHead>
            <TableHead className="w-[80px]">Image</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("name")}
                className="flex items-center gap-1 px-0 font-medium"
              >
                Product
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Category</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("price")}
                className="flex items-center gap-1 px-0 font-medium"
              >
                Price
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("stock")}
                className="flex items-center gap-1 px-0 font-medium"
              >
                Stock
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead className="w-[60px] text-center">Add to Cart</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedProducts.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <Checkbox
                  checked={selectedProductIds ? selectedProductIds.includes(product.id) : selectedProducts.includes(product.id)}
                  onCheckedChange={() => {
                    if (onSelectProduct && selectedProductIds) {
                      onSelectProduct(product.id)
                    } else {
                      handleSelectProduct(product.id)
                    }
                  }}
                  aria-label={`Select ${product.name}`}
                />
              </TableCell>
              <TableCell>
                <div className="h-10 w-10 rounded-md border bg-muted cursor-pointer" onClick={() => { setImageModalProduct(product); setModalImageIdx(0); setIsFullscreen(false); setIsZoomed(false); setPresentMode(false); }}>
                  <Image
                    src={getProductImages(product)[0]}
                    alt={product.name}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                </div>
              </TableCell>
              <TableCell className="font-medium">
                <Link href={`/dashboard/products/${product.id}`} className="text-emerald-700 hover:underline cursor-pointer">
                  {product.name}
                </Link>
              </TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>${product.price.toFixed(2)}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>{getStatusBadge(product.status)}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{product.sku}</TableCell>
              <TableCell className="text-center">
                <button
                  onClick={() => handleAddToCart(product.id)}
                  disabled={cart.some(item => item.id === product.id)}
                  aria-label={cart.some(item => item.id === product.id) ? "In cart" : "Add to cart"}
                  className={`rounded-full p-2 transition border-2 ${cart.some(item => item.id === product.id) ? 'bg-emerald-100 border-emerald-400 text-emerald-600' : 'hover:bg-emerald-50 border-transparent text-gray-500 hover:text-emerald-700'} disabled:opacity-60`}
                  title={cart.some(item => item.id === product.id) ? "Already in cart" : "Add to cart"}
                >
                  <ShoppingCart className="h-5 w-5" />
                </button>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/dashboard/products/${product.id}`)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/dashboard/products/${product.id}/edit`)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit product
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => handleDuplicate(product)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-destructive" onClick={() => handleDelete(product)}>
                      <Trash className="mr-2 h-4 w-4" />
                      Delete product
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* Advanced Image Modal */}
      <Dialog open={!!imageModalProduct} onOpenChange={(open) => { if (!open) setImageModalProduct(null) }}>
        <DialogContent ref={dialogRef} className={`max-w-3xl w-full flex flex-col items-center p-6 ${presentClass}`} style={presentMode ? { background: '#000' } : {}}>
          {imageModalProduct && (
            <div className="w-full flex flex-col items-center">
              <div className="flex flex-col md:flex-row w-full gap-6 items-center">
                {/* Main Image with Zoom/Fullscreen/Present */}
                <div className="relative group w-full flex flex-col items-center">
                  <button
                    className="focus:outline-none"
                    onClick={handleZoom}
                    title={isZoomed ? "Zoom out (z)" : "Zoom in (z)"}
                  >
                    <Image
                      ref={mainImgRef}
                      src={getProductImages(imageModalProduct)[modalImageIdx]}
                      alt={imageModalProduct.name}
                      width={isZoomed ? 900 : 480}
                      height={isZoomed ? 900 : 480}
                      className={`rounded-lg object-contain max-h-[70vh] border shadow-lg transition-transform ${isZoomed ? 'scale-150 cursor-zoom-out' : 'hover:scale-105 cursor-zoom-in'} ${presentMode ? 'bg-black' : ''}`}
                      style={{ background: presentMode ? '#000' : '#f8f8f8' }}
                    />
                  </button>
                  {/* Download button */}
                  {!presentMode && (
                    <a
                      href={getProductImages(imageModalProduct)[modalImageIdx]}
                      download
                      className="absolute top-2 right-2 bg-white/80 rounded-full p-2 shadow hover:bg-emerald-100 transition"
                      title="Download image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
                    </a>
                  )}
                  {/* Share button */}
                  {!presentMode && (
                    <button
                      onClick={handleShare}
                      className="absolute top-2 left-2 bg-white/80 rounded-full p-2 shadow hover:bg-emerald-100 transition"
                      title="Copy image URL"
                      aria-label="Copy image URL"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17l4 4 4-4m-4-5v9" /></svg>
                    </button>
                  )}
                  {/* Fullscreen button */}
                  {!presentMode && (
                    <button
                      onClick={() => setIsFullscreen(f => !f)}
                      className="absolute bottom-2 right-2 bg-white/80 rounded-full p-2 shadow hover:bg-emerald-100 transition"
                      title={isFullscreen ? "Exit Fullscreen (f)" : "Enter Fullscreen (f)"}
                      aria-label="Toggle fullscreen"
                    >
                      {isFullscreen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6v6H9z" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h7V2H2v9h2V4zm16 0v7h2V2h-9v2h7zm0 16h-7v2h9v-9h-2v7zm-16 0v-7H2v9h9v-2H4z" /></svg>
                      )}
                    </button>
                  )}
                  {/* Present mode button */}
                  {!presentMode && (
                    <button
                      onClick={() => setPresentMode(p => !p)}
                      className="absolute bottom-2 left-2 bg-white/80 rounded-full p-2 shadow hover:bg-emerald-100 transition"
                      title="Present mode (p)"
                      aria-label="Present mode"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" /></svg>
                    </button>
                  )}
                  {/* Prev/Next buttons */}
                  {getProductImages(imageModalProduct).length > 1 && !presentMode && (
                    <>
                      <button
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-emerald-100 transition"
                        onClick={() => setModalImageIdx((idx) => (idx === 0 ? getProductImages(imageModalProduct).length - 1 : idx - 1))}
                        aria-label="Previous image"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      </button>
                      <button
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-emerald-100 transition"
                        onClick={() => setModalImageIdx((idx) => (idx === getProductImages(imageModalProduct).length - 1 ? 0 : idx + 1))}
                        aria-label="Next image"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </>
                  )}
                  {/* Image count */}
                  {getProductImages(imageModalProduct).length > 1 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-2 py-1 rounded shadow">
                      {modalImageIdx + 1} / {getProductImages(imageModalProduct).length}
                    </div>
                  )}
                </div>
                {/* Product Info */}
                {!presentMode && (
                  <div className="flex flex-col gap-2 w-full max-w-xs">
                    <h2 className="text-xl font-bold text-emerald-700 mb-1">{imageModalProduct.name}</h2>
                    <div className="text-lg font-semibold text-gray-700">${imageModalProduct.price.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">SKU: {imageModalProduct.sku}</div>
                    <div className="text-sm text-gray-500">Category: {imageModalProduct.category}</div>
                    <div className="text-sm text-gray-500">Status: {getStatusBadge(imageModalProduct.status)}</div>
                    <div className="text-sm text-gray-500">Stock: {imageModalProduct.stock}</div>
                  </div>
                )}
              </div>
              {/* Thumbnails */}
              {getProductImages(imageModalProduct).length > 1 && !presentMode && (
                <div className="flex gap-2 mt-6 justify-center w-full">
                  {getProductImages(imageModalProduct).map((img, idx) => (
                    <button
                      key={img}
                      className={`border-2 rounded-md p-0.5 ${modalImageIdx === idx ? 'border-emerald-600' : 'border-transparent'} transition`}
                      onClick={() => setModalImageIdx(idx)}
                      aria-label={`Show image ${idx + 1}`}
                    >
                      <Image
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        width={56}
                        height={56}
                        className="rounded object-cover h-14 w-14"
                      />
                    </button>
                  ))}
                </div>
              )}
              {/* Present mode: only show product name and image */}
              {presentMode && (
                <div className="mt-4 text-center w-full">
                  <h2 className="text-2xl font-bold mb-2">{imageModalProduct.name}</h2>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Floating Cart Button */}
      {showCartButton && cart.length > 0 && (
        <Link
          href="/dashboard/cart"
          className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white rounded-full shadow-lg flex items-center gap-2 px-5 py-3 hover:bg-emerald-700 transition"
          aria-label="Open cart"
        >
          <ShoppingCart className="h-6 w-6" />
          <span className="font-bold">{cart.length}</span>
          <span className="hidden sm:inline">View Cart</span>
        </Link>
      )}
    </div>
  )
}
