export interface PurchaseOrder {
  id: string
  poNumber: string
  supplierId: string
  supplierName: string
  status: PurchaseOrderStatus
  createdAt: string
  createdBy: string
  updatedAt: string
  totalAmount: number
  currency: string
  deliveryDate: string
  deliveryAddress: Address
  deliveryInstructions?: string
  paymentTerms: string
  approvalChain: ApprovalStep[]
  lineItems: PurchaseOrderLineItem[]
  notes?: string
  attachments?: Attachment[]
  invoices?: Invoice[]
  qualityInspections?: QualityInspection[]
  deliveryTracking?: DeliveryTracking
}

export type PurchaseOrderStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "sent"
  | "acknowledged"
  | "in_production"
  | "ready_to_ship"
  | "shipped"
  | "partially_received"
  | "received"
  | "completed"
  | "cancelled"
  | "on_hold"

export interface PurchaseOrderLineItem {
  id: string
  productId?: string
  catalogItemId?: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
  totalPrice: number
  tax?: number
  deliveryDate?: string
  status: LineItemStatus
  receivedQuantity: number
  notes?: string
  customFields?: Record<string, any>
}

export type LineItemStatus = "pending" | "partially_received" | "received" | "rejected"

export interface Address {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  attention?: string
}

export interface ApprovalStep {
  id: string
  approverName: string
  approverEmail: string
  approverRole: string
  status: ApprovalStatus
  approvedAt?: string
  comments?: string
  order: number
}

export type ApprovalStatus = "pending" | "approved" | "rejected" | "skipped"

export interface Attachment {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  uploadedAt: string
  uploadedBy: string
  url: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  issueDate: string
  dueDate: string
  amount: number
  status: InvoiceStatus
  attachmentId?: string
  matchStatus: InvoiceMatchStatus
  discrepancies?: InvoiceDiscrepancy[]
}

export type InvoiceStatus = "pending" | "approved" | "paid" | "rejected"

export type InvoiceMatchStatus = "unmatched" | "partially_matched" | "matched" | "discrepancy"

export interface InvoiceDiscrepancy {
  type: "price" | "quantity" | "item" | "tax" | "other"
  description: string
  expectedValue: string
  actualValue: string
  resolved: boolean
  resolution?: string
}

export interface QualityInspection {
  id: string
  inspectionDate: string
  inspector: string
  status: "passed" | "failed" | "conditional"
  notes: string
  lineItemResults: {
    lineItemId: string
    passed: boolean
    notes?: string
    images?: string[]
  }[]
  attachments?: Attachment[]
}

export interface DeliveryTracking {
  carrier: string
  trackingNumber: string
  estimatedDelivery?: string
  status: string
  lastUpdated: string
  shipDate: string
  events: {
    date: string
    status: string
    location?: string
    description?: string
  }[]
}

export interface PurchaseOrderFilters {
  status?: PurchaseOrderStatus[]
  supplier?: string[]
  dateRange?: {
    start: string
    end: string
  }
  amountRange?: {
    min: number
    max: number
  }
  search?: string
}

export interface PurchaseOrderAnalytics {
  totalSpend: number
  poCount: number
  averagePoValue: number
  spendBySupplier: {
    supplierId: string
    supplierName: string
    amount: number
    percentage: number
  }[]
  spendByCategory: {
    category: string
    amount: number
    percentage: number
  }[]
  spendTrend: {
    period: string
    amount: number
  }[]
  statusDistribution: {
    status: PurchaseOrderStatus
    count: number
    percentage: number
  }[]
  deliveryPerformance: {
    onTime: number
    late: number
    veryLate: number
    percentageOnTime: number
  }
}
