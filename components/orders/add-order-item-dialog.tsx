import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

// Inventory item type (simplified for dialog)
export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  image: string;
  description?: string;
  unitPrice: number;
}

interface AddOrderItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (item: InventoryItem) => void;
}

// Mock inventory fetch (replace with real API call)
const mockInventory: InventoryItem[] = [
  {
    id: "inv-1",
    name: "Diamond Solitaire Ring",
    sku: "DR-0123",
    image: "/sparkling-diamond-ring.png",
    unitPrice: 3499.99,
    description: "1.0ct round brilliant diamond in 18k white gold setting",
  },
  {
    id: "inv-2",
    name: "Pearl Necklace",
    sku: "NL-0456",
    image: "/pearl-necklace.png",
    unitPrice: 899.99,
    description: "18-inch strand of AAA white freshwater pearls with silver clasp",
  },
  {
    id: "inv-3",
    name: "Emerald Tennis Bracelet",
    sku: "BR-0789",
    image: "/emerald-bracelet.png",
    unitPrice: 2199.99,
    description: "7-inch bracelet with 12 emerald stones set in 14k yellow gold",
  },
];

export function AddOrderItemDialog({ open, onOpenChange, onAdd }: AddOrderItemDialogProps) {
  const [search, setSearch] = useState("");
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selected, setSelected] = useState<InventoryItem | null>(null);

  useEffect(() => {
    // Replace with real API call
    setInventory(mockInventory);
  }, []);

  const filtered = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (selected) {
      onAdd(selected);
      onOpenChange(false);
      setSelected(null);
      setSearch("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Select Item from Inventory</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Search by name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4"
        />
        <div className="max-h-64 overflow-y-auto space-y-2">
          {filtered.length === 0 && <div className="text-muted-foreground text-sm">No items found.</div>}
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-2 rounded cursor-pointer border ${selected?.id === item.id ? "border-primary bg-primary/10" : "border-transparent hover:bg-muted"}`}
              onClick={() => setSelected(item)}
            >
              <div className="relative h-12 w-12 rounded overflow-hidden border">
                <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-muted-foreground">SKU: {item.sku}</div>
              </div>
              <div className="font-medium">${item.unitPrice.toFixed(2)}</div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!selected}>
            Add Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
 
 