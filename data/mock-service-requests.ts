import type {
  ServiceRequest,
  ServiceType,
  ProviderMatch,
  ProgressUpdate,
  QualityCheckpoint,
  ServiceRequestFile,
  ServiceRequestSpecification,
} from "@/types/service-request"

// Helper function to create a date string relative to now
const relativeDate = (days: number): string => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

// Mock service request files
export const mockServiceRequestFiles: ServiceRequestFile[] = [
  {
    id: "file1",
    name: "ring-design.stl",
    type: "model/stl",
    size: 2500000,
    url: "/files/ring-design.stl",
    uploadedAt: relativeDate(-5),
    uploadedBy: "John Smith",
  },
  {
    id: "file2",
    name: "stone-specifications.pdf",
    type: "application/pdf",
    size: 1200000,
    url: "/files/stone-specifications.pdf",
    uploadedAt: relativeDate(-5),
    uploadedBy: "John Smith",
  },
  {
    id: "file3",
    name: "reference-image.jpg",
    type: "image/jpeg",
    size: 3500000,
    url: "/files/reference-image.jpg",
    uploadedAt: relativeDate(-5),
    uploadedBy: "John Smith",
  },
  {
    id: "file4",
    name: "engraving-text.docx",
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    size: 500000,
    url: "/files/engraving-text.docx",
    uploadedAt: relativeDate(-2),
    uploadedBy: "Sarah Johnson",
  },
  {
    id: "file5",
    name: "progress-photo-1.jpg",
    type: "image/jpeg",
    size: 2800000,
    url: "/files/progress-photo-1.jpg",
    uploadedAt: relativeDate(-1),
    uploadedBy: "Michael Gold",
  },
]

// Mock provider matches
export const mockProviderMatches: ProviderMatch[] = [
  {
    providerId: "p1",
    providerName: "Golden Suppliers Inc.",
    providerLogo: "/abstract-geometric-shapes.png",
    matchScore: 95,
    capabilities: ["casting", "polishing", "plating"],
    averageRating: 4.8,
    reviewCount: 124,
    previousTaskCount: 37,
    estimatedPrice: 450,
    estimatedTurnaround: "5-7 days",
    response: "quoted",
    quote: {
      id: "q1",
      providerId: "p1",
      providerName: "Golden Suppliers Inc.",
      amount: 450,
      currency: "USD",
      estimatedCompletionTime: relativeDate(7),
      notes: "We can complete this casting task with our premium gold alloy. The price includes polishing.",
      createdAt: relativeDate(-2),
      expiresAt: relativeDate(5),
      status: "pending",
    },
  },
  {
    providerId: "p3",
    providerName: "Precision Casting Co.",
    providerLogo: "/placeholder-jymmf.png",
    matchScore: 92,
    capabilities: ["casting", "polishing"],
    averageRating: 4.7,
    reviewCount: 98,
    previousTaskCount: 22,
    estimatedPrice: 425,
    estimatedTurnaround: "7-10 days",
    response: "quoted",
    quote: {
      id: "q2",
      providerId: "p3",
      providerName: "Precision Casting Co.",
      amount: 425,
      currency: "USD",
      estimatedCompletionTime: relativeDate(10),
      notes: "We can use our lost-wax casting process for this task. The finish will be high-quality.",
      createdAt: relativeDate(-2),
      expiresAt: relativeDate(5),
      status: "pending",
    },
  },
  {
    providerId: "p5",
    providerName: "Shine Plating Services",
    providerLogo: "/placeholder-30207.png",
    matchScore: 85,
    capabilities: ["plating", "polishing"],
    averageRating: 4.6,
    reviewCount: 76,
    previousTaskCount: 15,
    estimatedPrice: 500,
    estimatedTurnaround: "4-6 days",
    response: "need-more-info",
  },
  {
    providerId: "p10",
    providerName: "Platinum Plus",
    providerLogo: "/interconnected-purple-spheres.png",
    matchScore: 80,
    capabilities: ["casting", "polishing"],
    averageRating: 4.5,
    reviewCount: 42,
    previousTaskCount: 8,
    response: "not-interested",
  },
]

// Mock progress updates
export const mockProgressUpdates: ProgressUpdate[] = [
  {
    id: "pu1",
    timestamp: relativeDate(-5),
    status: "submitted",
    message: "Service request submitted",
    updatedBy: "John Smith",
    attachments: [],
  },
  {
    id: "pu2",
    timestamp: relativeDate(-4),
    status: "matching",
    message: "Finding suitable providers for your request",
    updatedBy: "System",
    attachments: [],
  },
  {
    id: "pu3",
    timestamp: relativeDate(-2),
    status: "quoted",
    message: "Received quotes from 2 providers",
    updatedBy: "System",
    attachments: [],
  },
  {
    id: "pu4",
    timestamp: relativeDate(-1),
    status: "assigned",
    message: "Task assigned to Golden Suppliers Inc.",
    updatedBy: "John Smith",
    attachments: [],
  },
  {
    id: "pu5",
    timestamp: relativeDate(-1),
    status: "in-progress",
    message: "Started working on the casting process. Initial wax model created.",
    updatedBy: "Michael Gold",
    attachments: [mockServiceRequestFiles[4]],
  },
]

// Mock quality checkpoints
export const mockQualityCheckpoints: QualityCheckpoint[] = [
  {
    id: "qc1",
    name: "Initial Design Review",
    description: "Review of the design files and specifications",
    status: "passed",
    checkedAt: relativeDate(-4),
    checkedBy: "Sarah Johnson",
    notes: "Design files are complete and specifications are clear",
    attachments: [],
  },
  {
    id: "qc2",
    name: "Wax Model Approval",
    description: "Review and approval of the wax model before casting",
    status: "passed",
    checkedAt: relativeDate(-1),
    checkedBy: "John Smith",
    notes: "Wax model looks good, approved for casting",
    attachments: [mockServiceRequestFiles[4]],
  },
  {
    id: "qc3",
    name: "Post-Casting Inspection",
    description: "Inspection of the cast piece for defects",
    status: "pending",
    attachments: [],
  },
  {
    id: "qc4",
    name: "Finishing Quality Check",
    description: "Inspection of the polishing and finishing work",
    status: "pending",
    attachments: [],
  },
  {
    id: "qc5",
    name: "Final Inspection",
    description: "Final quality inspection before delivery",
    status: "pending",
    attachments: [],
  },
]

// Mock specifications
export const mockSpecifications: ServiceRequestSpecification[] = [
  {
    id: "spec1",
    name: "Metal Type",
    value: "14K Yellow Gold",
  },
  {
    id: "spec2",
    name: "Weight",
    value: "15",
    unit: "grams",
  },
  {
    id: "spec3",
    name: "Ring Size",
    value: "7",
    unit: "US",
  },
  {
    id: "spec4",
    name: "Wall Thickness",
    value: "1.5",
    unit: "mm",
  },
]

// Mock service requests
export const mockServiceRequests: ServiceRequest[] = [
  {
    id: "sr1",
    title: "Custom Ring Casting",
    serviceType: "casting",
    description: "Need casting service for a custom designed ring. The design is complete and ready for production.",
    specifications: mockSpecifications,
    materialProvision: "client-provided",
    materialDetails: "Will provide 16g of 14K yellow gold",
    dueDate: relativeDate(14),
    budgetRange: {
      min: 400,
      max: 600,
      currency: "USD",
    },
    files: mockServiceRequestFiles.slice(0, 3),
    status: "in-progress",
    createdAt: relativeDate(-5),
    createdBy: "John Smith",
    updatedAt: relativeDate(-1),
    providerMatches: mockProviderMatches,
    assignedProviderId: "p1",
    assignedProviderName: "Golden Suppliers Inc.",
    progressUpdates: mockProgressUpdates,
    qualityCheckpoints: mockQualityCheckpoints,
    priority: "medium",
    tags: ["wedding", "custom", "rush"],
  },
  {
    id: "sr2",
    title: "Pendant Engraving",
    serviceType: "engraving",
    description: "Need engraving service for a silver pendant. The text and design are provided in the attached files.",
    specifications: [
      {
        id: "spec5",
        name: "Engraving Type",
        value: "Hand Engraving",
      },
      {
        id: "spec6",
        name: "Material",
        value: "Sterling Silver",
      },
      {
        id: "spec7",
        name: "Depth",
        value: "0.5",
        unit: "mm",
      },
    ],
    materialProvision: "client-provided",
    materialDetails: "Will provide the silver pendant",
    dueDate: relativeDate(10),
    budgetRange: {
      min: 100,
      max: 200,
      currency: "USD",
    },
    files: [mockServiceRequestFiles[3]],
    status: "submitted",
    createdAt: relativeDate(-2),
    createdBy: "Sarah Johnson",
    updatedAt: relativeDate(-2),
    providerMatches: [],
    progressUpdates: [
      {
        id: "pu6",
        timestamp: relativeDate(-2),
        status: "submitted",
        message: "Service request submitted",
        updatedBy: "Sarah Johnson",
        attachments: [],
      },
    ],
    qualityCheckpoints: [],
    priority: "low",
    tags: ["gift", "personalized"],
  },
  {
    id: "sr3",
    title: "Diamond Setting for Engagement Ring",
    serviceType: "stone-setting",
    description: "Need professional setting of a 1.2 carat diamond in a platinum engagement ring.",
    specifications: [
      {
        id: "spec8",
        name: "Stone Type",
        value: "Diamond",
      },
      {
        id: "spec9",
        name: "Stone Size",
        value: "1.2",
        unit: "carat",
      },
      {
        id: "spec10",
        name: "Setting Type",
        value: "Prong Setting",
      },
      {
        id: "spec11",
        name: "Metal",
        value: "Platinum",
      },
    ],
    materialProvision: "mixed",
    materialDetails: "Will provide the diamond, need the setting to be created",
    dueDate: relativeDate(21),
    budgetRange: {
      min: 300,
      max: 500,
      currency: "USD",
    },
    files: [],
    status: "draft",
    createdAt: relativeDate(-1),
    createdBy: "Robert Johnson",
    updatedAt: relativeDate(-1),
    providerMatches: [],
    progressUpdates: [],
    qualityCheckpoints: [],
    priority: "high",
    tags: ["engagement", "diamond", "premium"],
  },
]

// Get service type label
export const getServiceTypeLabel = (type: ServiceType): string => {
  const labels: Record<ServiceType, string> = {
    casting: "Casting",
    "stone-setting": "Stone Setting",
    engraving: "Engraving",
    polishing: "Polishing",
    plating: "Plating",
    repair: "Repair",
    "custom-design": "Custom Design",
    appraisal: "Appraisal",
    "cad-modeling": "CAD Modeling",
    "3d-printing": "3D Printing",
  }

  return labels[type] || type
}

// Get status label and color
export const getStatusInfo = (status: string): { label: string; color: string } => {
  const statusMap: Record<string, { label: string; color: string }> = {
    draft: { label: "Draft", color: "bg-gray-100 text-gray-800" },
    submitted: { label: "Submitted", color: "bg-blue-100 text-blue-800" },
    matching: { label: "Finding Providers", color: "bg-purple-100 text-purple-800" },
    quoted: { label: "Quotes Received", color: "bg-yellow-100 text-yellow-800" },
    assigned: { label: "Provider Assigned", color: "bg-indigo-100 text-indigo-800" },
    "in-progress": { label: "In Progress", color: "bg-orange-100 text-orange-800" },
    "quality-check": { label: "Quality Check", color: "bg-teal-100 text-teal-800" },
    completed: { label: "Completed", color: "bg-green-100 text-green-800" },
    cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
  }

  return statusMap[status] || { label: status, color: "bg-gray-100 text-gray-800" }
}

// Get material provision label
export const getMaterialProvisionLabel = (provision: string): string => {
  const labels: Record<string, string> = {
    "client-provided": "Client Provided",
    "provider-sourced": "Provider Sourced",
    mixed: "Mixed (Client & Provider)",
  }

  return labels[provision] || provision
}

// Get priority label and color
export const getPriorityInfo = (priority: string): { label: string; color: string } => {
  const priorityMap: Record<string, { label: string; color: string }> = {
    low: { label: "Low", color: "bg-green-100 text-green-800" },
    medium: { label: "Medium", color: "bg-blue-100 text-blue-800" },
    high: { label: "High", color: "bg-orange-100 text-orange-800" },
    urgent: { label: "Urgent", color: "bg-red-100 text-red-800" },
  }

  return priorityMap[priority] || { label: priority, color: "bg-gray-100 text-gray-800" }
}
