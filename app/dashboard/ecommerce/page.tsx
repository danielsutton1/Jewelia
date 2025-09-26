"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useState } from "react"
import { ShoppingCart } from "lucide-react"

const DEMO_USER_ID = "demo-user-123" // Replace with real user_id from auth

export default function EcommerceIntegrationPage() {
  // Shopify state
  const [shopifyConnected, setShopifyConnected] = useState(false)
  const [shopifyApiKey, setShopifyApiKey] = useState("")
  const [shopifyStore, setShopifyStore] = useState("")
  const [shopifyStatus, setShopifyStatus] = useState<string | null>(null)
  const [shopifyError, setShopifyError] = useState<string | null>(null)
  const [shopifyProduct, setShopifyProduct] = useState<any>({})
  const [shopifyUploadResult, setShopifyUploadResult] = useState<any>(null)
  const [shopifyInventory, setShopifyInventory] = useState<any>({})
  const [shopifySyncResult, setShopifySyncResult] = useState<any>(null)
  const [shopifyLogs, setShopifyLogs] = useState<any[]>([])
  const [shopifyLoading, setShopifyLoading] = useState(false)

  // WooCommerce state
  const [wooConnected, setWooConnected] = useState(false)
  const [wooStore, setWooStore] = useState("")
  const [wooConsumerKey, setWooConsumerKey] = useState("")
  const [wooConsumerSecret, setWooConsumerSecret] = useState("")
  const [wooStatus, setWooStatus] = useState<string | null>(null)
  const [wooError, setWooError] = useState<string | null>(null)
  const [wooProduct, setWooProduct] = useState<any>({})
  const [wooUploadResult, setWooUploadResult] = useState<any>(null)
  const [wooInventory, setWooInventory] = useState<any>({})
  const [wooSyncResult, setWooSyncResult] = useState<any>(null)
  const [wooLogs, setWooLogs] = useState<any[]>([])
  const [wooLoading, setWooLoading] = useState(false)

  // --- Shopify Handlers ---
  async function handleShopifyConnect() {
    setShopifyLoading(true)
    setShopifyError(null)
    setShopifyStatus(null)
    try {
      const res = await fetch("/api/shopify/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: shopifyApiKey, storeUrl: shopifyStore, user_id: DEMO_USER_ID }),
      })
      const data = await res.json()
      if (data.success) {
        setShopifyConnected(true)
        setShopifyStatus("Connected!")
      } else {
        setShopifyError(data.error || "Failed to connect.")
      }
    } catch (err: any) {
      setShopifyError(err.message)
    } finally {
      setShopifyLoading(false)
    }
  }

  async function handleShopifyUpload() {
    setShopifyLoading(true)
    setShopifyUploadResult(null)
    setShopifyError(null)
    try {
      const res = await fetch("/api/shopify/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: shopifyProduct, user_id: DEMO_USER_ID }),
      })
      const data = await res.json()
      setShopifyUploadResult(data)
      if (!data.success) setShopifyError(data.error)
    } catch (err: any) {
      setShopifyError(err.message)
    } finally {
      setShopifyLoading(false)
    }
  }

  async function handleShopifySync() {
    setShopifyLoading(true)
    setShopifySyncResult(null)
    setShopifyError(null)
    try {
      const res = await fetch("/api/shopify/sync-inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...shopifyInventory, user_id: DEMO_USER_ID }),
      })
      const data = await res.json()
      setShopifySyncResult(data)
      if (!data.success) setShopifyError(data.error)
    } catch (err: any) {
      setShopifyError(err.message)
    } finally {
      setShopifyLoading(false)
    }
  }

  async function fetchShopifyLogs() {
    setShopifyLoading(true)
    try {
      const res = await fetch(`/api/shopify/logs?user_id=${DEMO_USER_ID}`)
      const data = await res.json()
      setShopifyLogs(data.logs || [])
    } catch {}
    setShopifyLoading(false)
  }

  // --- WooCommerce Handlers ---
  async function handleWooConnect() {
    setWooLoading(true)
    setWooError(null)
    setWooStatus(null)
    try {
      const res = await fetch("/api/woocommerce/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consumer_key: wooConsumerKey, consumer_secret: wooConsumerSecret, storeUrl: wooStore, user_id: DEMO_USER_ID }),
      })
      const data = await res.json()
      if (data.success) {
        setWooConnected(true)
        setWooStatus("Connected!")
      } else {
        setWooError(data.error || "Failed to connect.")
      }
    } catch (err: any) {
      setWooError(err.message)
    } finally {
      setWooLoading(false)
    }
  }

  async function handleWooUpload() {
    setWooLoading(true)
    setWooUploadResult(null)
    setWooError(null)
    try {
      const res = await fetch("/api/woocommerce/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: wooProduct, user_id: DEMO_USER_ID }),
      })
      const data = await res.json()
      setWooUploadResult(data)
      if (!data.success) setWooError(data.error)
    } catch (err: any) {
      setWooError(err.message)
    } finally {
      setWooLoading(false)
    }
  }

  async function handleWooSync() {
    setWooLoading(true)
    setWooSyncResult(null)
    setWooError(null)
    try {
      const res = await fetch("/api/woocommerce/sync-inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...wooInventory, user_id: DEMO_USER_ID }),
      })
      const data = await res.json()
      setWooSyncResult(data)
      if (!data.success) setWooError(data.error)
    } catch (err: any) {
      setWooError(err.message)
    } finally {
      setWooLoading(false)
    }
  }

  async function fetchWooLogs() {
    setWooLoading(true)
    try {
      const res = await fetch(`/api/woocommerce/logs?user_id=${DEMO_USER_ID}`)
      const data = await res.json()
      setWooLogs(data.logs || [])
    } catch {}
    setWooLoading(false)
  }

  return (
    <div className="container mx-auto py-4 sm:py-6 p-3 sm:p-4 md:p-6 max-w-7xl w-full space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
        <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight ecommerce-heading">E-commerce Integration</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2 ecommerce-subtext">
            Connect your inventory to Shopify and WooCommerce. Upload products, sync inventory, and view logs.
          </p>
        </div>
      </div>
      <Tabs defaultValue="shopify" className="space-y-3 sm:space-y-4">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1 sm:p-2">
          <TabsTrigger value="shopify" className="text-xs sm:text-sm min-h-[44px] px-2 sm:px-4 py-2 sm:py-3">Shopify</TabsTrigger>
          <TabsTrigger value="woocommerce" className="text-xs sm:text-sm min-h-[44px] px-2 sm:px-4 py-2 sm:py-3">WooCommerce</TabsTrigger>
          <TabsTrigger value="logs" className="text-xs sm:text-sm min-h-[44px] px-2 sm:px-4 py-2 sm:py-3">Sync Logs</TabsTrigger>
        </TabsList>
        {/* Shopify Tab */}
        <TabsContent value="shopify" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Shopify Connection</CardTitle>
              <CardDescription className="text-sm sm:text-base">Connect your Shopify store to enable product and inventory sync.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              {shopifyConnected ? (
                <div>
                  <div className="mb-2 text-sm sm:text-base">Connected to: <b>{shopifyStore}</b></div>
                  <Button variant="destructive" onClick={() => setShopifyConnected(false)} className="min-h-[44px] min-w-[44px] text-xs sm:text-sm">Disconnect</Button>
                  {shopifyStatus && <div className="text-green-600 mt-2 text-sm sm:text-base">{shopifyStatus}</div>}
                </div>
              ) : (
                <div className="flex flex-col gap-2 sm:gap-3 max-w-md">
                  <Input placeholder="Shopify Store URL (yourstore.myshopify.com)" value={shopifyStore} onChange={e => setShopifyStore(e.target.value)} className="min-h-[44px] text-sm" />
                  <Input placeholder="Shopify Admin API Key" value={shopifyApiKey} onChange={e => setShopifyApiKey(e.target.value)} className="min-h-[44px] text-sm" />
                  <Button onClick={handleShopifyConnect} disabled={!shopifyStore || !shopifyApiKey || shopifyLoading} className="min-h-[44px] min-w-[44px] text-xs sm:text-sm">Connect</Button>
                  {shopifyError && <div className="text-red-600 mt-2 text-sm">{shopifyError}</div>}
                  {shopifyStatus && <div className="text-green-600 mt-2 text-sm sm:text-base">{shopifyStatus}</div>}
                </div>
              )}
            </CardContent>
          </Card>
          {/* Product Upload */}
          {shopifyConnected && (
            <Card className="mt-4 sm:mt-6">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Upload Product</CardTitle>
                <CardDescription className="text-sm sm:text-base">Upload a product to Shopify.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-2 sm:space-y-3">
                <Input placeholder="Name" onChange={e => setShopifyProduct((p: any) => ({ ...p, title: e.target.value }))} className="min-h-[44px] text-sm" />
                <Input placeholder="SKU" onChange={e => setShopifyProduct((p: any) => ({ ...p, sku: e.target.value }))} className="min-h-[44px] text-sm" />
                <Input placeholder="Price" type="number" onChange={e => setShopifyProduct((p: any) => ({ ...p, variants: [{ ...(p.variants?.[0] || {}), price: e.target.value }] }))} className="min-h-[44px] text-sm" />
                <Input placeholder="Description" onChange={e => setShopifyProduct((p: any) => ({ ...p, body_html: e.target.value }))} className="min-h-[44px] text-sm" />
                <Input placeholder="Image URL" onChange={e => setShopifyProduct((p: any) => ({ ...p, images: [{ src: e.target.value }] }))} className="min-h-[44px] text-sm" />
                <Button onClick={handleShopifyUpload} disabled={shopifyLoading} className="min-h-[44px] min-w-[44px] text-xs sm:text-sm">Upload</Button>
                {shopifyUploadResult && (
                  <div className="mt-2 text-xs sm:text-sm">
                    {shopifyUploadResult.success ? (
                      <span className="text-green-600">Product uploaded! Shopify ID: {shopifyUploadResult.shopifyProductId}</span>
                    ) : (
                      <span className="text-red-600">{shopifyUploadResult.error}</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          {/* Inventory Sync */}
          {shopifyConnected && (
            <Card className="mt-4 sm:mt-6">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Sync Inventory</CardTitle>
                <CardDescription className="text-sm sm:text-base">Update inventory for a Shopify product.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-2 sm:space-y-3">
                <Input placeholder="Inventory Item ID" onChange={e => setShopifyInventory((inv: any) => ({ ...inv, inventory_item_id: e.target.value }))} className="min-h-[44px] text-sm" />
                <Input placeholder="Location ID" onChange={e => setShopifyInventory((inv: any) => ({ ...inv, location_id: e.target.value }))} className="min-h-[44px] text-sm" />
                <Input placeholder="Quantity" type="number" onChange={e => setShopifyInventory((inv: any) => ({ ...inv, quantity: Number(e.target.value) }))} className="min-h-[44px] text-sm" />
                <Button onClick={handleShopifySync} disabled={shopifyLoading} className="min-h-[44px] min-w-[44px] text-xs sm:text-sm">Sync Inventory</Button>
                {shopifySyncResult && (
                  <div className="mt-2 text-xs sm:text-sm">
                    {shopifySyncResult.success ? (
                      <span className="text-green-600">Inventory synced!</span>
                    ) : (
                      <span className="text-red-600">{shopifySyncResult.error}</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          {/* Logs */}
          {shopifyConnected && (
            <Card className="mt-4 sm:mt-6">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Shopify Sync Logs</CardTitle>
                <CardDescription className="text-sm sm:text-base">Recent sync actions and errors.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <Button size="sm" variant="outline" onClick={fetchShopifyLogs} disabled={shopifyLoading} className="min-h-[44px] min-w-[44px] text-xs sm:text-sm">Refresh Logs</Button>
                <div className="mt-2 max-h-48 overflow-y-auto text-xs">
                  {shopifyLogs.length === 0 ? (
                    <div className="text-muted-foreground">No logs yet.</div>
                  ) : (
                    <ul>
                      {shopifyLogs.map((log, i) => (
                        <li key={log.id || i} className={log.status === 'error' ? 'text-red-600' : ''}>
                          [{log.created_at}] {log.action} - {log.status} {log.details?.error && `- ${log.details.error}`}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        {/* WooCommerce Tab */}
        <TabsContent value="woocommerce" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">WooCommerce Connection</CardTitle>
              <CardDescription className="text-sm sm:text-base">Connect your WooCommerce store to enable product and inventory sync.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              {wooConnected ? (
                <div>
                  <div className="mb-2 text-sm sm:text-base">Connected to: <b>{wooStore}</b></div>
                  <Button variant="destructive" onClick={() => setWooConnected(false)} className="min-h-[44px] min-w-[44px] text-xs sm:text-sm">Disconnect</Button>
                  {wooStatus && <div className="text-green-600 mt-2 text-sm sm:text-base">{wooStatus}</div>}
                </div>
              ) : (
                <div className="flex flex-col gap-2 sm:gap-3 max-w-md">
                  <Input placeholder="WooCommerce Store URL (yourstore.com)" value={wooStore} onChange={e => setWooStore(e.target.value)} className="min-h-[44px] text-sm" />
                  <Input placeholder="Consumer Key" value={wooConsumerKey} onChange={e => setWooConsumerKey(e.target.value)} className="min-h-[44px] text-sm" />
                  <Input placeholder="Consumer Secret" value={wooConsumerSecret} onChange={e => setWooConsumerSecret(e.target.value)} className="min-h-[44px] text-sm" />
                  <Button onClick={handleWooConnect} disabled={!wooStore || !wooConsumerKey || !wooConsumerSecret || wooLoading} className="min-h-[44px] min-w-[44px] text-xs sm:text-sm">Connect</Button>
                  {wooError && <div className="text-red-600 mt-2 text-sm">{wooError}</div>}
                  {wooStatus && <div className="text-green-600 mt-2 text-sm sm:text-base">{wooStatus}</div>}
                </div>
              )}
            </CardContent>
          </Card>
          {/* Product Upload */}
          {wooConnected && (
            <Card className="mt-4 sm:mt-6">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Upload Product</CardTitle>
                <CardDescription className="text-sm sm:text-base">Upload a product to WooCommerce.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-2 sm:space-y-3">
                <Input placeholder="Name" onChange={e => setWooProduct((p: any) => ({ ...p, name: e.target.value }))} className="min-h-[44px] text-sm" />
                <Input placeholder="SKU" onChange={e => setWooProduct((p: any) => ({ ...p, sku: e.target.value }))} className="min-h-[44px] text-sm" />
                <Input placeholder="Price" type="number" onChange={e => setWooProduct((p: any) => ({ ...p, regular_price: e.target.value }))} className="min-h-[44px] text-sm" />
                <Input placeholder="Description" onChange={e => setWooProduct((p: any) => ({ ...p, description: e.target.value }))} className="min-h-[44px] text-sm" />
                <Input placeholder="Image URL" onChange={e => setWooProduct((p: any) => ({ ...p, images: [{ src: e.target.value }] }))} className="min-h-[44px] text-sm" />
                <Button onClick={handleWooUpload} disabled={wooLoading} className="min-h-[44px] min-w-[44px] text-xs sm:text-sm">Upload</Button>
                {wooUploadResult && (
                  <div className="mt-2 text-xs sm:text-sm">
                    {wooUploadResult.success ? (
                      <span className="text-green-600">Product uploaded! WooCommerce ID: {wooUploadResult.woocommerceProductId}</span>
                    ) : (
                      <span className="text-red-600">{wooUploadResult.error}</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          {/* Inventory Sync */}
          {wooConnected && (
            <Card className="mt-4 sm:mt-6">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Sync Inventory</CardTitle>
                <CardDescription className="text-sm sm:text-base">Update inventory for a WooCommerce product.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-2 sm:space-y-3">
                <Input placeholder="Product ID" onChange={e => setWooInventory((inv: any) => ({ ...inv, woocommerceProductId: e.target.value }))} className="min-h-[44px] text-sm" />
                <Input placeholder="Quantity" type="number" onChange={e => setWooInventory((inv: any) => ({ ...inv, quantity: Number(e.target.value) }))} className="min-h-[44px] text-sm" />
                <Button onClick={handleWooSync} disabled={wooLoading} className="min-h-[44px] min-w-[44px] text-xs sm:text-sm">Sync Inventory</Button>
                {wooSyncResult && (
                  <div className="mt-2 text-xs sm:text-sm">
                    {wooSyncResult.success ? (
                      <span className="text-green-600">Inventory synced!</span>
                    ) : (
                      <span className="text-red-600">{wooSyncResult.error}</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          {/* Logs */}
          {wooConnected && (
            <Card className="mt-4 sm:mt-6">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">WooCommerce Sync Logs</CardTitle>
                <CardDescription className="text-sm sm:text-base">Recent sync actions and errors.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <Button size="sm" variant="outline" onClick={fetchWooLogs} disabled={wooLoading} className="min-h-[44px] min-w-[44px] text-xs sm:text-sm">Refresh Logs</Button>
                <div className="mt-2 max-h-48 overflow-y-auto text-xs">
                  {wooLogs.length === 0 ? (
                    <div className="text-muted-foreground">No logs yet.</div>
                  ) : (
                    <ul>
                      {wooLogs.map((log, i) => (
                        <li key={log.id || i} className={log.status === 'error' ? 'text-red-600' : ''}>
                          [{log.created_at}] {log.action} - {log.status} {log.details?.error && `- ${log.details.error}`}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        {/* Logs Tab (All) */}
        <TabsContent value="logs" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Sync Logs</CardTitle>
              <CardDescription className="text-sm sm:text-base">View sync history and error reports for all integrations.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="text-muted-foreground text-sm sm:text-base">Select a platform and connect to view logs.</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
 