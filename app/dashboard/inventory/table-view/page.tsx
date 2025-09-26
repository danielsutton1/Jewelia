"use client"

import Head from "next/head"
import { InventoryTable } from "@/components/inventory/inventory-table"

// Sample data
const inventoryData = [
  {
    id: "1",
    image: "/sparkling-diamond-ring.png",
    sku: "DR-0001",
    name: "Diamond Solitaire Ring",
    category: "Rings",
    metal: "White Gold",
    purity: "18K",
    primaryStone: "Diamond",
    weight: 4.2,
    cost: 1200,
    price: 2499,
    location: "Showcase A",
    status: "available" as const,
  },
  {
    id: "2",
    image: "/sapphire-pendant.png",
    sku: "SP-0002",
    name: "Sapphire Pendant",
    category: "Pendants",
    metal: "Yellow Gold",
    purity: "14K",
    primaryStone: "Sapphire",
    weight: 3.5,
    cost: 850,
    price: 1799,
    location: "Showcase B",
    status: "reserved" as const,
  },
  {
    id: "3",
    image: "/pearl-earrings.png",
    sku: "PE-0003",
    name: "Pearl Drop Earrings",
    category: "Earrings",
    metal: "Sterling Silver",
    purity: "925",
    primaryStone: "Pearl",
    weight: 2.8,
    cost: 320,
    price: 699,
    location: "Showcase C",
    status: "sold" as const,
  },
  {
    id: "4",
    image: "/gold-necklace.png",
    sku: "GN-0004",
    name: "Gold Chain Necklace",
    category: "Necklaces",
    metal: "Yellow Gold",
    purity: "18K",
    primaryStone: "",
    weight: 12.5,
    cost: 1800,
    price: 3599,
    location: "Safe",
    status: "available" as const,
  },
  {
    id: "5",
    image: "/emerald-bracelet.png",
    sku: "EB-0005",
    name: "Emerald Tennis Bracelet",
    category: "Bracelets",
    metal: "White Gold",
    purity: "14K",
    primaryStone: "Emerald",
    weight: 8.3,
    cost: 2200,
    price: 4599,
    location: "Safe",
    status: "available" as const,
  },
  {
    id: "6",
    image: "/silver-earrings.png",
    sku: "SE-0006",
    name: "Silver Hoop Earrings",
    category: "Earrings",
    metal: "Sterling Silver",
    purity: "925",
    primaryStone: "",
    weight: 3.1,
    cost: 120,
    price: 299,
    location: "Showcase D",
    status: "available" as const,
  },
  {
    id: "7",
    image: "/pearl-necklace.png",
    sku: "PN-0007",
    name: "Pearl Strand Necklace",
    category: "Necklaces",
    metal: "White Gold",
    purity: "14K",
    primaryStone: "Pearl",
    weight: 18.5,
    cost: 1500,
    price: 3299,
    location: "Showcase B",
    status: "reserved" as const,
  },
  {
    id: "8",
    image: "/sparkling-diamond-necklace.png",
    sku: "DN-0008",
    name: "Diamond Tennis Necklace",
    category: "Necklaces",
    metal: "White Gold",
    purity: "18K",
    primaryStone: "Diamond",
    weight: 22.7,
    cost: 8500,
    price: 18999,
    location: "Vault",
    status: "available" as const,
  },
  {
    id: "9",
    image: "/placeholder-cxzmn.png",
    sku: "RR-0009",
    name: "Ruby Cocktail Ring",
    category: "Rings",
    metal: "Rose Gold",
    purity: "14K",
    primaryStone: "Ruby",
    weight: 5.8,
    cost: 1800,
    price: 3799,
    location: "Showcase A",
    status: "available" as const,
  },
  {
    id: "10",
    image: "/placeholder-oc67l.png",
    sku: "TB-0010",
    name: "Topaz Bangle",
    category: "Bracelets",
    metal: "Yellow Gold",
    purity: "18K",
    primaryStone: "Topaz",
    weight: 15.2,
    cost: 2200,
    price: 4599,
    location: "Showcase C",
    status: "sold" as const,
  },
  {
    id: "11",
    image: "/placeholder-zjy0g.png",
    sku: "AE-0011",
    name: "Amethyst Stud Earrings",
    category: "Earrings",
    metal: "White Gold",
    purity: "14K",
    primaryStone: "Amethyst",
    weight: 2.4,
    cost: 480,
    price: 999,
    location: "Showcase D",
    status: "available" as const,
  },
  {
    id: "12",
    image: "/placeholder-sqtld.png",
    sku: "OP-0012",
    name: "Opal Pendant",
    category: "Pendants",
    metal: "Rose Gold",
    purity: "14K",
    primaryStone: "Opal",
    weight: 3.7,
    cost: 750,
    price: 1599,
    location: "Showcase B",
    status: "available" as const,
  },
]

export default function InventoryTablePage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Head>
        <title>Inventory Table | Jewelia CRM</title>
        <meta name="description" content="Detailed inventory management table" />
      </Head>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Inventory Table</h1>
      </div>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <InventoryTable
            data={inventoryData}
            onView={(item) => console.log("View", item)}
            onEdit={(item) => console.log("Edit", item)}
            onDelete={(item) => console.log("Delete", item)}
          />
        </div>
      </div>
    </div>
  )
}
