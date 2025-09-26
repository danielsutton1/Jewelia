"use client"

import Head from "next/head"
import { JewelryGridView } from "@/components/inventory/jewelry-grid-view"
import { QuickFiltersBar } from "@/components/inventory/quick-filters-bar"
import type { JewelryItem } from "@/components/inventory/jewelry-grid-view"

// Sample jewelry data
const jewelryItems: JewelryItem[] = [
  {
    id: "1",
    name: "Diamond Solitaire Engagement Ring",
    sku: "R-DS-001",
    retailPrice: 2499.99,
    wholesalePrice: 1249.99,
    image: "/sparkling-diamond-ring.png",
    status: "available",
    location: "Main Showroom",
    category: "Rings",
    tags: ["diamond", "engagement", "solitaire"],
  },
  {
    id: "2",
    name: "Sapphire Pendant Necklace",
    sku: "N-SP-002",
    retailPrice: 1299.99,
    wholesalePrice: 649.99,
    image: "/sapphire-pendant.png",
    status: "reserved",
    location: "Display Cases",
    category: "Necklaces",
    tags: ["sapphire", "pendant", "gold"],
  },
  {
    id: "3",
    name: "Pearl Stud Earrings",
    sku: "E-PS-003",
    retailPrice: 499.99,
    wholesalePrice: 249.99,
    image: "/pearl-earrings.png",
    status: "available",
    location: "Display Cases",
    category: "Earrings",
    tags: ["pearl", "studs", "classic"],
  },
  {
    id: "4",
    name: "Gold Tennis Bracelet",
    sku: "B-GT-004",
    retailPrice: 3499.99,
    wholesalePrice: 1749.99,
    image: "/placeholder-0ylpa.png",
    status: "sold",
    location: "Vault",
    category: "Bracelets",
    tags: ["diamond", "tennis", "bracelet"],
  },
  {
    id: "5",
    name: "Emerald Cut Ring",
    sku: "R-EC-005",
    retailPrice: 4299.99,
    wholesalePrice: 2149.99,
    image: "/placeholder-4reo5.png",
    status: "available",
    location: "Main Showroom",
    category: "Rings",
    tags: ["emerald", "statement", "cocktail"],
  },
  {
    id: "6",
    name: "Diamond Hoop Earrings",
    sku: "E-DH-006",
    retailPrice: 1899.99,
    wholesalePrice: 949.99,
    image: "/placeholder-ekvvt.png",
    status: "available",
    location: "Workshop",
    category: "Earrings",
    tags: ["diamond", "hoops", "classic"],
  },
  {
    id: "7",
    name: "Ruby Anniversary Band",
    sku: "R-RA-007",
    retailPrice: 2799.99,
    wholesalePrice: 1399.99,
    image: "/placeholder-sq7qd.png",
    status: "available",
    location: "Main Showroom",
    category: "Rings",
    tags: ["ruby", "anniversary", "band"],
  },
  {
    id: "8",
    name: "Vintage Pearl Necklace",
    sku: "N-VP-008",
    retailPrice: 899.99,
    wholesalePrice: 449.99,
    image: "/pearl-necklace.png",
    status: "reserved",
    location: "Display Cases",
    category: "Necklaces",
    tags: ["pearl", "vintage", "strand"],
  },
  {
    id: "9",
    name: "Platinum Wedding Band",
    sku: "R-PW-009",
    retailPrice: 1599.99,
    wholesalePrice: 799.99,
    image: "/placeholder-cxzmn.png",
    status: "available",
    location: "Main Showroom",
    category: "Rings",
    tags: ["platinum", "wedding", "band"],
  },
  {
    id: "10",
    name: "Amethyst Drop Earrings",
    sku: "E-AD-010",
    retailPrice: 799.99,
    wholesalePrice: 399.99,
    image: "/placeholder-oc67l.png",
    status: "available",
    location: "Display Cases",
    category: "Earrings",
    tags: ["amethyst", "drop", "silver"],
  },
  {
    id: "11",
    name: "Rose Gold Chain Bracelet",
    sku: "B-RC-011",
    retailPrice: 699.99,
    wholesalePrice: 349.99,
    image: "/placeholder-zjy0g.png",
    status: "available",
    location: "Display Cases",
    category: "Bracelets",
    tags: ["rose gold", "chain", "delicate"],
  },
  {
    id: "12",
    name: "Opal Statement Ring",
    sku: "R-OS-012",
    retailPrice: 1299.99,
    wholesalePrice: 649.99,
    image: "/placeholder-sqtld.png",
    status: "sold",
    location: "Main Showroom",
    category: "Rings",
    tags: ["opal", "statement", "gold"],
  },
  {
    id: "13",
    name: "Diamond Tennis Necklace",
    sku: "N-DT-013",
    retailPrice: 5999.99,
    wholesalePrice: 2999.99,
    image: "/sparkling-diamond-necklace.png",
    status: "available",
    location: "Vault",
    category: "Necklaces",
    tags: ["diamond", "tennis", "luxury"],
  },
  {
    id: "14",
    name: "Turquoise Cuff Bracelet",
    sku: "B-TC-014",
    retailPrice: 899.99,
    wholesalePrice: 449.99,
    image: "/placeholder-3s3xh.png",
    status: "available",
    location: "Display Cases",
    category: "Bracelets",
    tags: ["turquoise", "cuff", "silver"],
  },
  {
    id: "15",
    name: "Citrine Cocktail Ring",
    sku: "R-CC-015",
    retailPrice: 1199.99,
    wholesalePrice: 599.99,
    image: "/placeholder.svg?height=300&width=300&query=citrine ring",
    status: "available",
    location: "Main Showroom",
    category: "Rings",
    tags: ["citrine", "cocktail", "statement"],
  },
  {
    id: "16",
    name: "Pearl Strand Bracelet",
    sku: "B-PS-016",
    retailPrice: 599.99,
    wholesalePrice: 299.99,
    image: "/placeholder.svg?height=300&width=300&query=pearl bracelet",
    status: "available",
    location: "Display Cases",
    category: "Bracelets",
    tags: ["pearl", "strand", "classic"],
  },
  // Mock diamond items with full specs
  {
    id: "d1",
    name: "Loose Diamond - 1.2ct VS1 G Excellent",
    sku: "D-001",
    retailPrice: 9500.00,
    wholesalePrice: 7000.00,
    image: "/diamond-loose-1.png",
    status: "available",
    location: "Vault",
    category: "Diamonds",
    tags: ["diamond", "loose"],
    diamondSpecs: {
      clarity: "VS1",
      color: "G",
      cut: "Excellent",
      caratWeight: 1.2,
      fluorescence: "None",
      polish: "Excellent",
      symmetry: "Very Good",
      gradingLab: "GIA",
      reportNumber: "GIA123456",
      depthPercentage: 61.5,
      tablePercentage: 57,
      measurements: { length: 6.8, width: 6.7, depth: 4.1 },
    },
  },
  {
    id: "d2",
    name: "Loose Diamond - 0.9ct VVS2 D Very Good",
    sku: "D-002",
    retailPrice: 7200.00,
    wholesalePrice: 5400.00,
    image: "/diamond-loose-2.png",
    status: "available",
    location: "Main Showroom",
    category: "Diamonds",
    tags: ["diamond", "loose"],
    diamondSpecs: {
      clarity: "VVS2",
      color: "D",
      cut: "Very Good",
      caratWeight: 0.9,
      fluorescence: "Faint",
      polish: "Very Good",
      symmetry: "Excellent",
      gradingLab: "IGI",
      reportNumber: "IGI654321",
      depthPercentage: 62.1,
      tablePercentage: 58,
      measurements: { length: 6.2, width: 6.1, depth: 3.8 },
    },
  },
]

// Filter categories
const filterCategories = [
  {
    name: "Category",
    options: [
      { value: "rings", label: "Rings" },
      { value: "necklaces", label: "Necklaces" },
      { value: "earrings", label: "Earrings" },
      { value: "bracelets", label: "Bracelets" },
    ],
  },
  {
    name: "Status",
    options: [
      { value: "available", label: "Available" },
      { value: "reserved", label: "Reserved" },
      { value: "sold", label: "Sold" },
    ],
  },
  {
    name: "Location",
    options: [
      { value: "main-showroom", label: "Main Showroom" },
      { value: "display-cases", label: "Display Cases" },
      { value: "vault", label: "Vault" },
      { value: "workshop", label: "Workshop" },
    ],
  },
  {
    name: "Stone",
    options: [
      { value: "diamond", label: "Diamond" },
      { value: "sapphire", label: "Sapphire" },
      { value: "ruby", label: "Ruby" },
      { value: "emerald", label: "Emerald" },
      { value: "pearl", label: "Pearl" },
      { value: "opal", label: "Opal" },
    ],
  },
]

export default function JewelryGridViewPage() {
  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>Jewelry Grid View | Jewelia CRM</title>
        <meta name="description" content="Responsive grid view for jewelry inventory" />
      </Head>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Jewelry Inventory</h1>
        <p className="text-muted-foreground">Responsive grid view with advanced features</p>
      </div>

      <div className="mb-4">
        <QuickFiltersBar
          categories={filterCategories}
          onFilterChange={(filters) => console.log("Filters changed:", filters)}
        />
      </div>

      <JewelryGridView
        items={jewelryItems}
        onItemClick={(item) => console.log("Clicked item:", item)}
        onItemEdit={(item) => console.log("Edit item:", item)}
        onBulkAction={(items, action) => console.log(`Bulk action ${action} on`, items)}
      />
    </div>
  )
}
