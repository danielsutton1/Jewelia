"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"

interface Supplier {
  id: string
  name: string
  category: string
}

interface SupplierSelectorProps {
  onSelect: (supplier: Supplier) => void
  selectedSupplierId?: string
}

export function SupplierSelector({ onSelect, selectedSupplierId }: SupplierSelectorProps) {
  const [open, setOpen] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)

  // Simulate fetching suppliers from API
  useEffect(() => {
    // In a real app, this would be an API call
    const mockSuppliers: Supplier[] = [
      { id: "supplier-001", name: "Diamond Direct", category: "Gemstones" },
      { id: "supplier-002", name: "Goldsmith Supplies", category: "Precious Metals" },
      { id: "supplier-003", name: "Gem Source", category: "Gemstones" },
      { id: "supplier-004", name: "Silver Source", category: "Precious Metals" },
      { id: "supplier-005", name: "Precision Casting", category: "Castings" },
      { id: "supplier-006", name: "Artisan Engraving", category: "Services" },
      { id: "supplier-007", name: "Master Plating", category: "Services" },
      { id: "supplier-008", name: "Express Shipping", category: "Logistics" },
      { id: "supplier-009", name: "Secure Logistics", category: "Logistics" },
      { id: "supplier-010", name: "Craft Alliance", category: "Tools" },
    ]
    setSuppliers(mockSuppliers)

    // If a selectedSupplierId is provided, find and set the selected supplier
    if (selectedSupplierId) {
      const supplier = mockSuppliers.find((s) => s.id === selectedSupplierId)
      if (supplier) {
        setSelectedSupplier(supplier)
      }
    }
  }, [selectedSupplierId])

  const handleSelect = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setOpen(false)
    onSelect(supplier)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="supplier-select">Supplier</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            id="supplier-select"
          >
            {selectedSupplier ? selectedSupplier.name : "Select supplier..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput placeholder="Search suppliers..." />
            <CommandList>
              <CommandEmpty>No supplier found.</CommandEmpty>
              <CommandGroup>
                {suppliers.map((supplier) => (
                  <CommandItem key={supplier.id} value={supplier.id} onSelect={() => handleSelect(supplier)}>
                    <Check
                      className={cn("mr-2 h-4 w-4", selectedSupplier?.id === supplier.id ? "opacity-100" : "opacity-0")}
                    />
                    <div className="flex flex-col">
                      <span>{supplier.name}</span>
                      <span className="text-xs text-muted-foreground">{supplier.category}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
