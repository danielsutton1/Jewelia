"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ProductFilters({
  category, setCategory,
  material, setMaterial,
  gemstone, setGemstone,
  stockStatus, setStockStatus,
  priceRange, setPriceRange
}: {
  category: string, setCategory: (v: string) => void,
  material: string, setMaterial: (v: string) => void,
  gemstone: string, setGemstone: (v: string) => void,
  stockStatus: string, setStockStatus: (v: string) => void,
  priceRange: string, setPriceRange: (v: string) => void
}) {
  const categories = [
    { id: "all", label: "All Categories" },
    { id: "rings", label: "Rings" },
    { id: "necklaces", label: "Necklaces" },
    { id: "earrings", label: "Earrings" },
    { id: "bracelets", label: "Bracelets" },
    { id: "pendants", label: "Pendants" },
    { id: "watches", label: "Watches" },
  ]
  const materials = [
    { id: "all", label: "All Materials" },
    { id: "gold", label: "Gold (Coming Soon)" },
    { id: "silver", label: "Silver (Coming Soon)" },
    { id: "platinum", label: "Platinum (Coming Soon)" },
    { id: "rose-gold", label: "Rose Gold (Coming Soon)" },
    { id: "stainless-steel", label: "Stainless Steel (Coming Soon)" },
  ]
  const gemstones = [
    { id: "all", label: "All Gemstones" },
    { id: "diamond", label: "Diamond (Coming Soon)" },
    { id: "ruby", label: "Ruby (Coming Soon)" },
    { id: "sapphire", label: "Sapphire (Coming Soon)" },
    { id: "emerald", label: "Emerald (Coming Soon)" },
    { id: "pearl", label: "Pearl (Coming Soon)" },
  ]
  const stockStatuses = [
    { id: "all", label: "All Stock" },
    { id: "in-stock", label: "In Stock" },
    { id: "low-stock", label: "Low Stock" },
    { id: "out-of-stock", label: "Out of Stock" },
  ]
  const priceRanges = [
    { id: "all", label: "All Prices" },
    { id: "0-500", label: "$0–$500" },
    { id: "500-1000", label: "$500–$1000" },
    { id: "1000-2000", label: "$1000–$2000" },
    { id: "2000+", label: "$2000+" },
  ]
  return <>
    <Select value={category} onValueChange={setCategory}>
      <SelectTrigger className="min-w-[150px]">
        <SelectValue placeholder="Category" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((c) => (
          <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
    <Select value={material} onValueChange={setMaterial} disabled>
      <SelectTrigger className="min-w-[150px] opacity-50">
        <SelectValue placeholder="Material" />
      </SelectTrigger>
      <SelectContent>
        {materials.map((m) => (
          <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
    <Select value={gemstone} onValueChange={setGemstone} disabled>
      <SelectTrigger className="min-w-[150px] opacity-50">
        <SelectValue placeholder="Gemstone" />
      </SelectTrigger>
      <SelectContent>
        {gemstones.map((g) => (
          <SelectItem key={g.id} value={g.id}>{g.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
    <Select value={stockStatus} onValueChange={setStockStatus}>
      <SelectTrigger className="min-w-[150px]">
        <SelectValue placeholder="Stock Status" />
      </SelectTrigger>
      <SelectContent>
        {stockStatuses.map((s) => (
          <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
    <Select value={priceRange} onValueChange={setPriceRange}>
      <SelectTrigger className="min-w-[150px]">
        <SelectValue placeholder="Price Range" />
      </SelectTrigger>
      <SelectContent>
        {priceRanges.map((p) => (
          <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </>
}
