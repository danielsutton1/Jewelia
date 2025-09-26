export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  price: number;
  cost: number;
  quantity: number;
  metal_type: string | null;
  metal_purity: string | null;
  weight_grams: number | null;
  gemstone_type: string | null;
  gemstone_carat: number | null;
  gemstone_quality: string | null;
  brand: string | null;
  photo_urls: string[];
  specifications: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type AssetStatus =
  | "available"
  | "reserved"
  | "in_production"
  | "with_partner"
  | "quality_control"
  | "awaiting_shipment"
  | "shipped"
  | "consignment"
  | "repair"
  | "missing"
  | "delayed"
  | "urgent"
  | "checked_out"

export interface Asset {
  id: string
  name: string
  type: "diamond" | "finished_product" | "semi_mount" | "raw_material"
  sku: string
  value: number
  currentLocation: string
  locationId: string
  status: AssetStatus
  assignedTo?: string
  checkedOutBy?: string
  checkedOutDate?: string
  expectedReturnDate?: string
  lastActivity: string
  history: AssetActivity[]
}

export interface AssetActivity {
  id: string
  action: "check_in" | "check_out" | "transfer" | "status_change" | "report_missing"
  timestamp: string
  employee: string
  fromLocation?: string
  toLocation: string
  notes?: string
}

export interface Location {
  id: string
  name: string
  type: 'vault' | 'showroom' | 'design' | 'casting' | 'setting' | 'polishing' | 'quality_control' | 'finishing' | 'packaging' | 'shipping' | 'gem_setter' | 'engraver' | 'plater' | 'stone_supplier' | 'repair_shop' | 'consignment' | 'customer_location'
  category: 'internal' | 'external' | 'storage' | 'display'
  priority?: 'high' | 'medium' | 'low'
}

export interface Employee {
  id: string
  name: string
  type: "internal" | "external"
  role: string
  department?: string
  company?: string
  contact?: string
}

export interface Assignment {
  id: string
  assignmentNumber: string
  assignedTo: Employee
  assets: Asset[]
  assignmentType: "internal" | "external"
  purpose: string
  notes?: string
  assignedDate: Date
  expectedReturnDate: Date
  status: "assigned" | "in_progress" | "completed" | "overdue"
  qrCode: string
  pickupQrCode?: string
} 