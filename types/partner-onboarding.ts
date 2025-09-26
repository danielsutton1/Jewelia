export type OnboardingStep =
  | "basic-information"
  | "capabilities-assessment"
  | "agreement-setup"
  | "system-access"
  | "review"

export interface OnboardingProgress {
  currentStep: OnboardingStep
  completedSteps: OnboardingStep[]
  startedAt: Date
  lastUpdated: Date
}

export interface BasicInformation {
  companyName: string
  legalName: string
  businessType: string
  yearEstablished: number
  website: string
  description: string
  logo?: File | string
  address: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  primaryContact: {
    name: string
    position: string
    email: string
    phone: string
    extension?: string
  }
  taxInformation: {
    taxId: string
    vatNumber?: string
    taxExempt: boolean
    taxDocuments?: File[] | string[]
  }
  bankingDetails: {
    accountName: string
    accountNumber: string
    routingNumber: string
    bankName: string
    bankAddress: string
    swiftCode?: string
    iban?: string
  }
}

export interface ServiceCapability {
  id: string
  name: string
  description: string
  available: boolean
  experienceYears: number
  capacity: string
  turnaroundTime: string
  notes?: string
}

export interface Equipment {
  id: string
  name: string
  type: string
  brand: string
  model: string
  quantity: number
  capabilities: string
  notes?: string
}

export interface Certification {
  id: string
  name: string
  issuingBody: string
  dateIssued: string
  expiryDate: string
  document?: File | string
  verified: boolean
}

export interface SampleWork {
  id: string
  title: string
  description: string
  image?: File | string
  date: string
  tags: string[]
}

export interface CapabilitiesAssessment {
  services: ServiceCapability[]
  equipment: Equipment[]
  certifications: Certification[]
  sampleWork: SampleWork[]
  specialties: string[]
  additionalNotes?: string
}

export interface PricingItem {
  id: string
  service: string
  unit: string
  basePrice: number
  volumeDiscounts: {
    quantity: number
    price: number
  }[]
  notes?: string
}

export interface SlaItem {
  id: string
  category: string
  metric: string
  target: string
  penalty?: string
}

export interface AgreementSetup {
  termsAccepted: boolean
  termsNotes?: string
  pricingStructure: PricingItem[]
  paymentTerms: {
    paymentMethod: string
    paymentDue: string
    earlyPaymentDiscount?: string
    latePaymentPenalty?: string
  }
  slaItems: SlaItem[]
  contractSigned: boolean
  contractDocument?: File | string
  contractSignedDate?: string
}

export interface SystemAccess {
  portalCredentialsCreated: boolean
  username?: string
  apiAccessRequired: boolean
  apiKeyGenerated: boolean
  apiKey?: string
  trainingCompleted: boolean
  trainingMaterials: {
    id: string
    title: string
    type: string
    accessed: boolean
    completed: boolean
  }[]
  additionalAccess?: string
}

export interface PartnerOnboarding {
  id: string
  partnerId?: string
  progress: OnboardingProgress
  basicInformation: Partial<BasicInformation>
  capabilitiesAssessment: Partial<CapabilitiesAssessment>
  agreementSetup: Partial<AgreementSetup>
  systemAccess: Partial<SystemAccess>
  notes: string[]
  status: "draft" | "in-progress" | "pending-review" | "approved" | "rejected"
  createdBy: string
  createdAt: Date
  updatedAt: Date
}
