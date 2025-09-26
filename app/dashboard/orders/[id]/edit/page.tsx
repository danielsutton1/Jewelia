"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { orders as sampleOrders } from "@/components/orders/orders-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { AddOrderItemDialog, InventoryItem } from "@/components/orders/add-order-item-dialog"

const statusOptions = ["Pending", "Processing", "Completed", "Cancelled"]

export default function EditOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;
  const order = sampleOrders.find((o) => o.id === orderId);

  // For demo, create fake items if not present
  const initialItems = order && Array.isArray(order.items)
    ? order.items.map((item: any, idx: number) => ({
        id: item.id || `item-${idx}`,
        name: item.name || `Item ${idx + 1}`,
        sku: item.sku || `SKU-${idx + 1}`,
        quantity: item.quantity || 1,
        unitPrice: item.price || 100,
      }))
    : [
        {
          id: "item-1",
          name: "Diamond Solitaire Ring",
          sku: "DR-0123",
          quantity: 1,
          unitPrice: 3499.99,
        },
      ];

  const [status, setStatus] = useState(order?.status || "Pending");
  const [items, setItems] = useState(initialItems);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  if (!order) {
    return <div className="container mx-auto py-10 text-destructive">Order not found.</div>;
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  // Handlers
  const handleItemChange = (idx: number, field: string, value: any) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, [field]: field === "quantity" ? Math.max(1, Number(value)) : Number(value) } : item
      )
    );
  };

  const handleRemoveItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddInventoryItem = (item: InventoryItem) => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        name: item.name,
        sku: item.sku,
        quantity: 1,
        unitPrice: item.unitPrice,
      },
    ]);
  };

  const handleSave = () => {
    toast({ title: "Order Saved", description: `Order ${orderId} changes have been saved.` });
    router.push("/dashboard/orders");
  };

  return (
    <div className="container mx-auto py-10 max-w-3xl">
      <h1 className="text-3xl font-bold mb-4">Edit Order</h1>
      <p className="mb-2">Order ID: <span className="font-mono">{orderId}</span></p>
      <div className="p-6 border rounded-md bg-muted space-y-6">
        <div>
          <label className="block font-medium mb-1">Customer</label>
          <div className="p-2 rounded bg-white border">
            <div className="font-medium">{order.customer.full_name}</div>
            <div className="text-xs text-muted-foreground">{order.customer.email}</div>
          </div>
        </div>
        <div>
          <label className="block font-medium mb-1">Status</label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block font-medium mb-1">Order Items</label>
          <div className="overflow-x-auto rounded border bg-white">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">SKU</th>
                  <th className="p-2 text-right">Quantity</th>
                  <th className="p-2 text-right">Unit Price</th>
                  <th className="p-2 text-right">Subtotal</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="p-2">{item.name}</td>
                    <td className="p-2">{item.sku}</td>
                    <td className="p-2 text-right">
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                        className="w-20"
                      />
                    </td>
                    <td className="p-2 text-right">
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, "unitPrice", e.target.value)}
                        className="w-24"
                      />
                    </td>
                    <td className="p-2 text-right">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                    <td className="p-2 text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(idx)}>
                        ✕
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end mt-2">
              <Button variant="outline" onClick={() => setAddDialogOpen(true)}>
                + Add Item
              </Button>
            </div>
          </div>
        </div>
        <AddOrderItemDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onAdd={handleAddInventoryItem}
        />
        <div className="flex justify-end gap-8 pt-4">
          <div>
            <div className="text-muted-foreground">Subtotal:</div>
            <div className="font-bold text-lg">${subtotal.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Items:</div>
            <div className="font-bold text-lg">{items.length}</div>
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-4">
          <Button variant="outline" onClick={() => router.push("/dashboard/orders")}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
} 
 
 