import type { PurchaseOrder, PurchaseOrderStatus } from "@/types/purchase-order"

export const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: "po-001",
    poNumber: "PO-2023-001",
    supplierId: "supplier-001",
    supplierName: "Diamond Direct",
    status: "approved",
    createdAt: "2023-05-10T09:30:00Z",
    createdBy: "John Smith",
    updatedAt: "2023-05-11T14:20:00Z",
    totalAmount: 12500.0,
    currency: "USD",
    deliveryDate: "2023-06-01T00:00:00Z",
    deliveryAddress: {
      street: "123 Jewelry Lane",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "USA",
      attention: "Receiving Dept",
    },
    deliveryInstructions: "Please call 30 minutes before delivery",
    paymentTerms: "Net 30",
    approvalChain: [
      {
        id: "approval-001",
        approverName: "Jane Doe",
        approverEmail: "jane.doe@jewelia.com",
        approverRole: "Purchasing Manager",
        status: "approved",
        approvedAt: "2023-05-10T15:45:00Z",
        comments: "Approved as per budget",
        order: 1,
      },
      {
        id: "approval-002",
        approverName: "Michael Johnson",
        approverEmail: "michael.johnson@jewelia.com",
        approverRole: "Finance Director",
        status: "approved",
        approvedAt: "2023-05-11T10:30:00Z",
        comments: "Approved",
        order: 2,
      },
    ],
    lineItems: [
      {
        id: "line-001",
        productId: "product-001",
        catalogItemId: "catalog-diamond-001",
        description: "Round Diamond 1ct VS1 E",
        quantity: 5,
        unit: "piece",
        unitPrice: 2000.0,
        totalPrice: 10000.0,
        tax: 500.0,
        deliveryDate: "2023-06-01T00:00:00Z",
        status: "pending",
        receivedQuantity: 0,
        notes: "Special order",
      },
      {
        id: "line-002",
        productId: "product-002",
        catalogItemId: "catalog-setting-001",
        description: "14K Gold Ring Setting",
        quantity: 10,
        unit: "piece",
        unitPrice: 200.0,
        totalPrice: 2000.0,
        tax: 100.0,
        deliveryDate: "2023-06-01T00:00:00Z",
        status: "pending",
        receivedQuantity: 0,
      },
    ],
    notes: "Priority order for upcoming collection",
    attachments: [
      {
        id: "attachment-001",
        fileName: "SpecialInstructions.pdf",
        fileType: "application/pdf",
        fileSize: 256000,
        uploadedAt: "2023-05-10T09:35:00Z",
        uploadedBy: "John Smith",
        url: "/attachments/SpecialInstructions.pdf",
      },
    ],
  },
  {
    id: "po-002",
    poNumber: "PO-2023-002",
    supplierId: "supplier-002",
    supplierName: "Goldsmith Supplies",
    status: "sent",
    createdAt: "2023-05-12T11:15:00Z",
    createdBy: "John Smith",
    updatedAt: "2023-05-12T16:40:00Z",
    totalAmount: 8750.0,
    currency: "USD",
    deliveryDate: "2023-06-15T00:00:00Z",
    deliveryAddress: {
      street: "123 Jewelry Lane",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "USA",
      attention: "Receiving Dept",
    },
    paymentTerms: "Net 45",
    approvalChain: [
      {
        id: "approval-003",
        approverName: "Jane Doe",
        approverEmail: "jane.doe@jewelia.com",
        approverRole: "Purchasing Manager",
        status: "approved",
        approvedAt: "2023-05-12T14:20:00Z",
        comments: "Approved",
        order: 1,
      },
      {
        id: "approval-004",
        approverName: "Michael Johnson",
        approverEmail: "michael.johnson@jewelia.com",
        approverRole: "Finance Director",
        status: "approved",
        approvedAt: "2023-05-12T15:45:00Z",
        comments: "Approved within budget",
        order: 2,
      },
    ],
    lineItems: [
      {
        id: "line-003",
        productId: "product-003",
        catalogItemId: "catalog-gold-001",
        description: "14K Gold Wire - 1mm",
        quantity: 100,
        unit: "meter",
        unitPrice: 45.0,
        totalPrice: 4500.0,
        tax: 225.0,
        deliveryDate: "2023-06-15T00:00:00Z",
        status: "pending",
        receivedQuantity: 0,
      },
      {
        id: "line-004",
        productId: "product-004",
        catalogItemId: "catalog-gold-002",
        description: "18K Gold Sheet - 0.5mm",
        quantity: 50,
        unit: "sheet",
        unitPrice: 80.0,
        totalPrice: 4000.0,
        tax: 200.0,
        deliveryDate: "2023-06-15T00:00:00Z",
        status: "pending",
        receivedQuantity: 0,
      },
    ],
  },
  {
    id: "po-003",
    poNumber: "PO-2023-003",
    supplierId: "supplier-003",
    supplierName: "Gem Source",
    status: "shipped",
    createdAt: "2023-04-20T10:00:00Z",
    createdBy: "Sarah Williams",
    updatedAt: "2023-05-15T09:30:00Z",
    totalAmount: 15200.0,
    currency: "USD",
    deliveryDate: "2023-05-20T00:00:00Z",
    deliveryAddress: {
      street: "123 Jewelry Lane",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "USA",
      attention: "Receiving Dept",
    },
    paymentTerms: "Net 30",
    approvalChain: [
      {
        id: "approval-005",
        approverName: "Jane Doe",
        approverEmail: "jane.doe@jewelia.com",
        approverRole: "Purchasing Manager",
        status: "approved",
        approvedAt: "2023-04-20T14:30:00Z",
        comments: "Approved",
        order: 1,
      },
      {
        id: "approval-006",
        approverName: "Michael Johnson",
        approverEmail: "michael.johnson@jewelia.com",
        approverRole: "Finance Director",
        status: "approved",
        approvedAt: "2023-04-21T09:15:00Z",
        comments: "Approved",
        order: 2,
      },
    ],
    lineItems: [
      {
        id: "line-005",
        productId: "product-005",
        catalogItemId: "catalog-sapphire-001",
        description: "Blue Sapphire - 3mm Round",
        quantity: 50,
        unit: "piece",
        unitPrice: 120.0,
        totalPrice: 6000.0,
        tax: 300.0,
        deliveryDate: "2023-05-20T00:00:00Z",
        status: "pending",
        receivedQuantity: 0,
      },
      {
        id: "line-006",
        productId: "product-006",
        catalogItemId: "catalog-ruby-001",
        description: "Ruby - 4mm Round",
        quantity: 30,
        unit: "piece",
        unitPrice: 280.0,
        totalPrice: 8400.0,
        tax: 420.0,
        deliveryDate: "2023-05-20T00:00:00Z",
        status: "pending",
        receivedQuantity: 0,
      },
    ],
    deliveryTracking: {
      carrier: "FedEx",
      trackingNumber: "FDX123456789",
      estimatedDelivery: "2023-05-19T00:00:00Z",
      status: "In Transit",
      lastUpdated: "2023-05-16T08:45:00Z",
      shipDate: "2023-05-15T00:00:00Z",
      events: [
        {
          date: "2023-05-15T14:30:00Z",
          status: "Picked Up",
          location: "Bangkok, Thailand",
          description: "Package picked up",
        },
        {
          date: "2023-05-16T08:45:00Z",
          status: "In Transit",
          location: "Singapore",
          description: "Package in transit",
        },
      ],
    },
  },
  {
    id: "po-004",
    poNumber: "PO-2023-004",
    supplierId: "supplier-004",
    supplierName: "Silver Source",
    status: "draft",
    createdAt: "2023-05-16T13:20:00Z",
    createdBy: "John Smith",
    updatedAt: "2023-05-16T13:20:00Z",
    totalAmount: 3200.0,
    currency: "USD",
    deliveryDate: "2023-06-30T00:00:00Z",
    deliveryAddress: {
      street: "123 Jewelry Lane",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "USA",
      attention: "Receiving Dept",
    },
    paymentTerms: "Net 30",
    approvalChain: [
      {
        id: "approval-007",
        approverName: "Jane Doe",
        approverEmail: "jane.doe@jewelia.com",
        approverRole: "Purchasing Manager",
        status: "pending",
        order: 1,
      },
      {
        id: "approval-008",
        approverName: "Michael Johnson",
        approverEmail: "michael.johnson@jewelia.com",
        approverRole: "Finance Director",
        status: "pending",
        order: 2,
      },
    ],
    lineItems: [
      {
        id: "line-007",
        productId: "product-007",
        catalogItemId: "catalog-silver-001",
        description: "Sterling Silver Wire - 1mm",
        quantity: 200,
        unit: "meter",
        unitPrice: 8.0,
        totalPrice: 1600.0,
        tax: 80.0,
        deliveryDate: "2023-06-30T00:00:00Z",
        status: "pending",
        receivedQuantity: 0,
      },
      {
        id: "line-008",
        productId: "product-008",
        catalogItemId: "catalog-silver-002",
        description: "Sterling Silver Sheet - 0.5mm",
        quantity: 20,
        unit: "sheet",
        unitPrice: 75.0,
        totalPrice: 1500.0,
        tax: 75.0,
        deliveryDate: "2023-06-30T00:00:00Z",
        status: "pending",
        receivedQuantity: 0,
      },
    ],
  },
  {
    id: "po-005",
    poNumber: "PO-2023-005",
    supplierId: "supplier-005",
    supplierName: "Precision Casting",
    status: "received",
    createdAt: "2023-04-05T09:00:00Z",
    createdBy: "Sarah Williams",
    updatedAt: "2023-05-02T11:30:00Z",
    totalAmount: 4800.0,
    currency: "USD",
    deliveryDate: "2023-05-01T00:00:00Z",
    deliveryAddress: {
      street: "123 Jewelry Lane",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "USA",
      attention: "Receiving Dept",
    },
    paymentTerms: "Net 30",
    approvalChain: [
      {
        id: "approval-009",
        approverName: "Jane Doe",
        approverEmail: "jane.doe@jewelia.com",
        approverRole: "Purchasing Manager",
        status: "approved",
        approvedAt: "2023-04-05T14:30:00Z",
        comments: "Approved",
        order: 1,
      },
      {
        id: "approval-010",
        approverName: "Michael Johnson",
        approverEmail: "michael.johnson@jewelia.com",
        approverRole: "Finance Director",
        status: "approved",
        approvedAt: "2023-04-06T09:15:00Z",
        comments: "Approved",
        order: 2,
      },
    ],
    lineItems: [
      {
        id: "line-009",
        productId: "product-009",
        catalogItemId: "catalog-casting-001",
        description: "Ring Casting - Model A",
        quantity: 100,
        unit: "piece",
        unitPrice: 28.0,
        totalPrice: 2800.0,
        tax: 140.0,
        deliveryDate: "2023-05-01T00:00:00Z",
        status: "received",
        receivedQuantity: 100,
      },
      {
        id: "line-010",
        productId: "product-010",
        catalogItemId: "catalog-casting-002",
        description: "Pendant Casting - Model B",
        quantity: 50,
        unit: "piece",
        unitPrice: 36.0,
        totalPrice: 1800.0,
        tax: 90.0,
        deliveryDate: "2023-05-01T00:00:00Z",
        status: "received",
        receivedQuantity: 50,
      },
    ],
    invoices: [
      {
        id: "invoice-001",
        invoiceNumber: "INV-2023-1234",
        issueDate: "2023-05-02T00:00:00Z",
        dueDate: "2023-06-01T00:00:00Z",
        amount: 4800.0,
        status: "approved",
        attachmentId: "attachment-002",
        matchStatus: "matched",
        discrepancies: [],
      },
    ],
    qualityInspections: [
      {
        id: "inspection-001",
        inspectionDate: "2023-05-02T10:00:00Z",
        inspector: "David Lee",
        status: "passed",
        notes: "All items meet quality standards",
        lineItemResults: [
          {
            lineItemId: "line-009",
            passed: true,
            notes: "Excellent quality",
          },
          {
            lineItemId: "line-010",
            passed: true,
            notes: "Good quality, minor finishing needed",
          },
        ],
      },
    ],
  },
]

export const getStatusColor = (status: PurchaseOrderStatus): string => {
  const statusColors: Record<PurchaseOrderStatus, string> = {
    draft: "bg-gray-200 text-gray-800",
    pending_approval: "bg-blue-100 text-blue-800",
    approved: "bg-green-100 text-green-800",
    sent: "bg-purple-100 text-purple-800",
    acknowledged: "bg-indigo-100 text-indigo-800",
    in_production: "bg-yellow-100 text-yellow-800",
    ready_to_ship: "bg-orange-100 text-orange-800",
    shipped: "bg-cyan-100 text-cyan-800",
    partially_received: "bg-teal-100 text-teal-800",
    received: "bg-emerald-100 text-emerald-800",
    completed: "bg-green-200 text-green-900",
    cancelled: "bg-red-100 text-red-800",
    on_hold: "bg-amber-100 text-amber-800",
  }

  return statusColors[status] || "bg-gray-100 text-gray-800"
}

export const getStatusLabel = (status: PurchaseOrderStatus): string => {
  const statusLabels: Record<PurchaseOrderStatus, string> = {
    draft: "Draft",
    pending_approval: "Pending Approval",
    approved: "Approved",
    sent: "Sent to Supplier",
    acknowledged: "Acknowledged",
    in_production: "In Production",
    ready_to_ship: "Ready to Ship",
    shipped: "Shipped",
    partially_received: "Partially Received",
    received: "Received",
    completed: "Completed",
    cancelled: "Cancelled",
    on_hold: "On Hold",
  }

  return statusLabels[status] || status
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
    status: string
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

export const mockPurchaseOrderAnalytics: PurchaseOrderAnalytics = {
  totalSpend: 44450.0,
  poCount: 5,
  averagePoValue: 8890.0,
  spendBySupplier: [
    {
      supplierId: "supplier-001",
      supplierName: "Diamond Direct",
      amount: 12500.0,
      percentage: 28.12,
    },
    {
      supplierId: "supplier-002",
      supplierName: "Goldsmith Supplies",
      amount: 8750.0,
      percentage: 19.68,
    },
    {
      supplierId: "supplier-003",
      supplierName: "Gem Source",
      amount: 15200.0,
      percentage: 34.2,
    },
    {
      supplierId: "supplier-004",
      supplierName: "Silver Source",
      amount: 3200.0,
      percentage: 7.2,
    },
    {
      supplierId: "supplier-005",
      supplierName: "Precision Casting",
      amount: 4800.0,
      percentage: 10.8,
    },
  ],
  spendByCategory: [
    {
      category: "Gemstones",
      amount: 20400.0,
      percentage: 45.89,
    },
    {
      category: "Precious Metals",
      amount: 16450.0,
      percentage: 37.01,
    },
    {
      category: "Findings",
      amount: 2800.0,
      percentage: 6.3,
    },
    {
      category: "Castings",
      amount: 4800.0,
      percentage: 10.8,
    },
  ],
  spendTrend: [
    {
      period: "Jan 2023",
      amount: 32000.0,
    },
    {
      period: "Feb 2023",
      amount: 28500.0,
    },
    {
      period: "Mar 2023",
      amount: 35200.0,
    },
    {
      period: "Apr 2023",
      amount: 20000.0,
    },
    {
      period: "May 2023",
      amount: 24450.0,
    },
  ],
  statusDistribution: [
    {
      status: "draft",
      count: 1,
      percentage: 20,
    },
    {
      status: "approved",
      count: 1,
      percentage: 20,
    },
    {
      status: "sent",
      count: 1,
      percentage: 20,
    },
    {
      status: "shipped",
      count: 1,
      percentage: 20,
    },
    {
      status: "received",
      count: 1,
      percentage: 20,
    },
  ],
  deliveryPerformance: {
    onTime: 3,
    late: 1,
    veryLate: 0,
    percentageOnTime: 75,
  },
}
