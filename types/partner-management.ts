export type PartnerCategory =
  | "supplier-metals"
  | "supplier-stones"
  | "supplier-findings"
  | "service-casting"
  | "service-engraving"
  | "service-plating"
  | "contractor"
  | "shipping"

export type PartnerSpecialty =
  | "casting"
  | "stone-setter"
  | "polisher"
  | "cad-designer"
  | "appraiser"
  | "consignment-partner"
  | "gold"
  | "silver"
  | "platinum"
  | "diamonds"
  | "gemstones"
  | "pearls"
  | "chains"
  | "clasps"
  | "settings"
  | "lost-wax-casting"
  | "hand-engraving"
  | "machine-engraving"
  | "rhodium-plating"
  | "gold-plating"
  | "stone-setting"
  | "polishing"
  | "domestic-shipping"
  | "international-shipping"
  | "express-shipping"
  | "custom-packaging"
  | "all"

export interface Partner {
  id: string
  name: string
  logo: string
  category: PartnerCategory[]
  specialties: PartnerSpecialty[]
  contactName: string
  email: string
  phone: string
  address: string
  website: string
  rating: number
  recentOrderCount: number
  responseTime: number // in hours
  notes: string
  createdAt: string
  updatedAt: string
  followers?: number
  description?: string
}

export interface PartnerFilterState {
  search: string
  categories: PartnerCategory[]
  specialties: PartnerSpecialty[]
  minRating: number
  maxResponseTime: number | null
}
