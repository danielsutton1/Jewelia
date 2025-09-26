export type WorkstationType =
  | "design"
  | "casting"
  | "stone-setting"
  | "polishing"
  | "engraving"
  | "quality-control"
  | "packaging"

export type EquipmentType =
  | "3d-printer"
  | "casting-machine"
  | "laser-welder"
  | "polishing-machine"
  | "microscope"
  | "engraving-machine"
  | "ultrasonic-cleaner"

export type StorageType = "materials" | "tools" | "finished-products" | "work-in-progress"

export type SafetyZoneType = "emergency-exit" | "fire-extinguisher" | "first-aid" | "eye-wash"

export interface WorkstationItem {
  id: string
  type: WorkstationType
  name: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  rotation: number
  assignedCraftspeople: string[]
  assignedEquipment: string[]
  currentProjects: string[]
  isActive: boolean
}

export interface EquipmentItem {
  id: string
  type: EquipmentType
  name: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  rotation: number
  assignedWorkstation: string | null
  isInUse: boolean
  maintenanceStatus: "good" | "needs-maintenance" | "out-of-order"
}

export interface StorageItem {
  id: string
  type: StorageType
  name: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  rotation: number
  contents: string[]
  capacityUsed: number
  totalCapacity: number
}

export interface SafetyZoneItem {
  id: string
  type: SafetyZoneType
  name: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  rotation: number
  lastInspected: string
  status: "good" | "needs-attention" | "critical"
}

export interface CraftspersonItem {
  id: string
  name: string
  specialties: WorkstationType[]
  assignedWorkstation: string | null
  currentProject: string | null
  efficiency: number
  availability: "available" | "busy" | "off-duty"
}

export interface ProjectItem {
  id: string
  name: string
  type: string
  assignedWorkstation: string | null
  assignedCraftspeople: string[]
  status: "not-started" | "in-progress" | "on-hold" | "completed"
  priority: "low" | "medium" | "high" | "urgent"
  deadline: string
  completionPercentage: number
}

export interface WorkshopData {
  workstations: WorkstationItem[]
  equipment: EquipmentItem[]
  storage: StorageItem[]
  safetyZones: SafetyZoneItem[]
  craftspeople: CraftspersonItem[]
  projects: ProjectItem[]
  workshopDimensions: { width: number; height: number }
}

export const mockWorkshopData: WorkshopData = {
  workstations: [
    {
      id: "ws-1",
      type: "design",
      name: "Design Station 1",
      position: { x: 50, y: 50 },
      size: { width: 120, height: 80 },
      rotation: 0,
      assignedCraftspeople: ["cp-1"],
      assignedEquipment: ["eq-1"],
      currentProjects: ["proj-1"],
      isActive: true,
    },
    {
      id: "ws-2",
      type: "casting",
      name: "Casting Station",
      position: { x: 200, y: 50 },
      size: { width: 150, height: 100 },
      rotation: 0,
      assignedCraftspeople: ["cp-2"],
      assignedEquipment: ["eq-2"],
      currentProjects: ["proj-2"],
      isActive: true,
    },
    {
      id: "ws-3",
      type: "stone-setting",
      name: "Stone Setting Station",
      position: { x: 50, y: 200 },
      size: { width: 100, height: 80 },
      rotation: 0,
      assignedCraftspeople: ["cp-3"],
      assignedEquipment: ["eq-3"],
      currentProjects: ["proj-3"],
      isActive: false,
    },
    {
      id: "ws-4",
      type: "polishing",
      name: "Polishing Station",
      position: { x: 200, y: 200 },
      size: { width: 120, height: 80 },
      rotation: 0,
      assignedCraftspeople: ["cp-4"],
      assignedEquipment: ["eq-4"],
      currentProjects: [],
      isActive: true,
    },
    {
      id: "ws-5",
      type: "quality-control",
      name: "QC Station",
      position: { x: 350, y: 50 },
      size: { width: 100, height: 80 },
      rotation: 0,
      assignedCraftspeople: ["cp-5"],
      assignedEquipment: ["eq-5"],
      currentProjects: ["proj-4"],
      isActive: true,
    },
  ],
  equipment: [
    {
      id: "eq-1",
      type: "3d-printer",
      name: "Formlabs Form 3",
      position: { x: 100, y: 70 },
      size: { width: 40, height: 40 },
      rotation: 0,
      assignedWorkstation: "ws-1",
      isInUse: true,
      maintenanceStatus: "good",
    },
    {
      id: "eq-2",
      type: "casting-machine",
      name: "Vacuum Casting Machine",
      position: { x: 250, y: 70 },
      size: { width: 50, height: 50 },
      rotation: 0,
      assignedWorkstation: "ws-2",
      isInUse: true,
      maintenanceStatus: "good",
    },
    {
      id: "eq-3",
      type: "microscope",
      name: "Setting Microscope",
      position: { x: 80, y: 220 },
      size: { width: 30, height: 30 },
      rotation: 0,
      assignedWorkstation: "ws-3",
      isInUse: false,
      maintenanceStatus: "good",
    },
    {
      id: "eq-4",
      type: "polishing-machine",
      name: "Polishing Machine",
      position: { x: 230, y: 220 },
      size: { width: 40, height: 40 },
      rotation: 0,
      assignedWorkstation: "ws-4",
      isInUse: true,
      maintenanceStatus: "needs-maintenance",
    },
    {
      id: "eq-5",
      type: "microscope",
      name: "QC Microscope",
      position: { x: 380, y: 70 },
      size: { width: 30, height: 30 },
      rotation: 0,
      assignedWorkstation: "ws-5",
      isInUse: true,
      maintenanceStatus: "good",
    },
    {
      id: "eq-6",
      type: "laser-welder",
      name: "Laser Welder",
      position: { x: 350, y: 200 },
      size: { width: 40, height: 40 },
      rotation: 0,
      assignedWorkstation: null,
      isInUse: false,
      maintenanceStatus: "good",
    },
    {
      id: "eq-7",
      type: "ultrasonic-cleaner",
      name: "Ultrasonic Cleaner",
      position: { x: 400, y: 200 },
      size: { width: 30, height: 30 },
      rotation: 0,
      assignedWorkstation: null,
      isInUse: false,
      maintenanceStatus: "good",
    },
  ],
  storage: [
    {
      id: "st-1",
      type: "materials",
      name: "Materials Storage",
      position: { x: 50, y: 350 },
      size: { width: 100, height: 60 },
      rotation: 0,
      contents: ["Gold", "Silver", "Platinum", "Gemstones"],
      capacityUsed: 70,
      totalCapacity: 100,
    },
    {
      id: "st-2",
      type: "tools",
      name: "Tools Cabinet",
      position: { x: 200, y: 350 },
      size: { width: 80, height: 40 },
      rotation: 0,
      contents: ["Hand Tools", "Specialty Tools", "Spare Parts"],
      capacityUsed: 60,
      totalCapacity: 100,
    },
    {
      id: "st-3",
      type: "finished-products",
      name: "Finished Products Safe",
      position: { x: 350, y: 350 },
      size: { width: 60, height: 60 },
      rotation: 0,
      contents: ["Completed Orders", "Display Items"],
      capacityUsed: 40,
      totalCapacity: 100,
    },
  ],
  safetyZones: [
    {
      id: "sz-1",
      type: "emergency-exit",
      name: "Emergency Exit",
      position: { x: 450, y: 50 },
      size: { width: 40, height: 80 },
      rotation: 0,
      lastInspected: "2023-04-15",
      status: "good",
    },
    {
      id: "sz-2",
      type: "fire-extinguisher",
      name: "Fire Extinguisher 1",
      position: { x: 450, y: 200 },
      size: { width: 20, height: 40 },
      rotation: 0,
      lastInspected: "2023-04-15",
      status: "good",
    },
    {
      id: "sz-3",
      type: "first-aid",
      name: "First Aid Kit",
      position: { x: 450, y: 300 },
      size: { width: 30, height: 30 },
      rotation: 0,
      lastInspected: "2023-04-15",
      status: "needs-attention",
    },
    {
      id: "sz-4",
      type: "eye-wash",
      name: "Eye Wash Station",
      position: { x: 450, y: 350 },
      size: { width: 30, height: 30 },
      rotation: 0,
      lastInspected: "2023-04-15",
      status: "good",
    },
  ],
  craftspeople: [
    {
      id: "cp-1",
      name: "Emma Johnson",
      specialties: ["design"],
      assignedWorkstation: "ws-1",
      currentProject: "proj-1",
      efficiency: 95,
      availability: "busy",
    },
    {
      id: "cp-2",
      name: "Michael Chen",
      specialties: ["casting"],
      assignedWorkstation: "ws-2",
      currentProject: "proj-2",
      efficiency: 90,
      availability: "busy",
    },
    {
      id: "cp-3",
      name: "Sophia Rodriguez",
      specialties: ["stone-setting"],
      assignedWorkstation: "ws-3",
      currentProject: "proj-3",
      efficiency: 98,
      availability: "off-duty",
    },
    {
      id: "cp-4",
      name: "James Wilson",
      specialties: ["polishing"],
      assignedWorkstation: "ws-4",
      currentProject: null,
      efficiency: 85,
      availability: "available",
    },
    {
      id: "cp-5",
      name: "Olivia Kim",
      specialties: ["quality-control"],
      assignedWorkstation: "ws-5",
      currentProject: "proj-4",
      efficiency: 92,
      availability: "busy",
    },
    {
      id: "cp-6",
      name: "David Martinez",
      specialties: ["engraving", "polishing"],
      assignedWorkstation: null,
      currentProject: null,
      efficiency: 88,
      availability: "available",
    },
    {
      id: "cp-7",
      name: "Ava Thompson",
      specialties: ["design", "stone-setting"],
      assignedWorkstation: null,
      currentProject: null,
      efficiency: 94,
      availability: "off-duty",
    },
  ],
  projects: [
    {
      id: "proj-1",
      name: "Custom Diamond Ring",
      type: "Custom Order",
      assignedWorkstation: "ws-1",
      assignedCraftspeople: ["cp-1"],
      status: "in-progress",
      priority: "high",
      deadline: "2023-05-15",
      completionPercentage: 30,
    },
    {
      id: "proj-2",
      name: "Gold Bracelet Batch",
      type: "Production Batch",
      assignedWorkstation: "ws-2",
      assignedCraftspeople: ["cp-2"],
      status: "in-progress",
      priority: "medium",
      deadline: "2023-05-20",
      completionPercentage: 45,
    },
    {
      id: "proj-3",
      name: "Emerald Earrings",
      type: "Custom Order",
      assignedWorkstation: "ws-3",
      assignedCraftspeople: ["cp-3"],
      status: "on-hold",
      priority: "medium",
      deadline: "2023-05-25",
      completionPercentage: 60,
    },
    {
      id: "proj-4",
      name: "Sapphire Pendant",
      type: "Custom Order",
      assignedWorkstation: "ws-5",
      assignedCraftspeople: ["cp-5"],
      status: "in-progress",
      priority: "urgent",
      deadline: "2023-05-10",
      completionPercentage: 85,
    },
    {
      id: "proj-5",
      name: "Silver Chain Batch",
      type: "Production Batch",
      assignedWorkstation: null,
      assignedCraftspeople: [],
      status: "not-started",
      priority: "low",
      deadline: "2023-06-01",
      completionPercentage: 0,
    },
  ],
  workshopDimensions: { width: 500, height: 450 },
}
