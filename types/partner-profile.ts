import type { Partner } from "./partner-management"

export interface ContactPerson {
  id: string
  name: string
  position: string
  email: string
  phone: string
  primaryContact: boolean
  avatar?: string
}

export interface Location {
  id: string
  name: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string
  email: string
  isPrimary: boolean
  coordinates?: {
    latitude: number
    longitude: number
  }
}

export interface BusinessHours {
  monday: string
  tuesday: string
  wednesday: string
  thursday: string
  friday: string
  saturday: string
  sunday: string
  notes?: string
}

export interface Certification {
  id: string
  name: string
  issuingBody: string
  dateIssued: string
  expiryDate: string
  documentUrl?: string
}

export interface PerformanceMetrics {
  qualityRating: number
  onTimeDelivery: number // percentage
  priceCompetitiveness: number // 1-10 scale
  communicationScore: number // 1-10 scale
  issueResolution: number // 1-10 scale
  averageResponseTime: number // hours
  lastReviewDate: string
}

export interface Equipment {
  id: string
  name: string
  type: string
  capabilities: string
  quantity: number
}

export interface Capacity {
  maxOrderSize: string
  leadTime: string
  turnaroundTime: string
  availableHours: number
  notes: string
}

export interface PortfolioItem {
  id: string
  title: string
  description: string
  imageUrl: string
  date: string
}

export interface PricingAgreement {
  id: string
  title: string
  startDate: string
  endDate: string
  terms: string
  documentUrl?: string
}

export interface PaymentTerms {
  method: string
  terms: string
  currency: string
  creditLimit?: number
  discounts?: string
}

export interface Order {
  id: string
  orderNumber: string
  date: string
  amount: number
  status: "pending" | "in-progress" | "completed" | "cancelled"
  items: number
}

export interface Document {
  id: string
  title: string
  type: string
  uploadDate: string
  fileUrl: string
  fileSize: string
}

export interface PartnerProfile extends Partner {
  contactPersons: ContactPerson[]
  locations: Location[]
  businessHours: BusinessHours
  certifications: Certification[]
  performanceMetrics: PerformanceMetrics
  equipment: Equipment[]
  capacity: Capacity
  specialExpertise: string[]
  portfolio: PortfolioItem[]
  pricingAgreements: PricingAgreement[]
  paymentTerms: PaymentTerms
  orderHistory: Order[]
  currentTasks: Order[]
  documents: Document[]
}
