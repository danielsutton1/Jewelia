// Types for our resource assignment data
export interface Skill {
  name: string
  level: number // 1-3, representing proficiency
}

export interface Absence {
  id: string
  startDate: string
  endDate: string
  reason: string
}

export interface Craftsperson {
  id: string
  name: string
  skills: Skill[]
  currentWorkload: number // 0-100%
  efficiencyRating: number // 0-100%
  qualityRating: number // 0-100%
  onLeave: boolean
  absences?: Absence[]
  assignedOrders: string[] // IDs of assigned work orders
}

export interface WorkOrder {
  id: string
  itemDescription: string
  requiredSkill: string
  priority: "high" | "medium" | "low"
  dueDate: string
  estimatedHours: number
  workloadImpact: number // How much this adds to a craftsperson's workload (0-100)
  assignedTo: string | null
  assignedToName: string | null
}

// Sample data generators
export function generateSampleWorkOrders(count: number): WorkOrder[] {
  const skills = ["Design/CAD", "Wax/3D Print", "Casting", "Stone Setting", "Polishing", "Quality Control"]
  const priorities = ["high", "medium", "low"]
  const itemDescriptions = [
    "Diamond Engagement Ring",
    "Gold Wedding Band",
    "Pearl Necklace",
    "Sapphire Earrings",
    "Emerald Bracelet",
    "Ruby Pendant",
    "Silver Cufflinks",
    "Platinum Watch",
    "Topaz Brooch",
    "Amethyst Anklet",
    "Opal Ring",
    "Jade Bangle",
    "Citrine Necklace",
  ]

  const orders: WorkOrder[] = []

  for (let i = 0; i < count; i++) {
    const orderNumber = `WO-${String(1000 + i).padStart(4, "0")}`
    const randomSkill = skills[Math.floor(Math.random() * skills.length)]

    // Generate a random due date between now and 30 days in the future
    // With some orders being overdue
    const dueDate = new Date()
    const daysOffset = Math.floor(Math.random() * 40) - 5 // -5 to 35 days
    dueDate.setDate(dueDate.getDate() + daysOffset)

    // Assign priority based on due date
    let priority: "high" | "medium" | "low" = "medium"
    if (daysOffset < 0) {
      priority = "high"
    } else if (daysOffset > 14) {
      priority = "low"
    }

    // Random priority override for some items
    if (Math.random() < 0.2) {
      priority = priorities[Math.floor(Math.random() * priorities.length)] as "high" | "medium" | "low"
    }

    // Random estimated hours (2-20)
    const estimatedHours = Math.floor(Math.random() * 18) + 2

    // Calculate workload impact based on estimated hours
    // Assuming a full workload is about 40 hours per week
    const workloadImpact = Math.min(100, Math.round((estimatedHours / 40) * 100))

    orders.push({
      id: orderNumber,
      itemDescription: itemDescriptions[Math.floor(Math.random() * itemDescriptions.length)],
      requiredSkill: randomSkill,
      priority,
      dueDate: dueDate.toISOString(),
      estimatedHours,
      workloadImpact,
      assignedTo: null,
      assignedToName: null,
    })
  }

  return orders
}

export function generateSampleCraftspeople(count: number): Craftsperson[] {
  const names = [
    "Michael Chen",
    "Sophia Rodriguez",
    "David Kim",
    "Emma Johnson",
    "James Wilson",
    "Olivia Martinez",
    "William Taylor",
    "Ava Thompson",
    "Alexander Davis",
    "Isabella Garcia",
    "Ethan Brown",
    "Mia Miller",
    "Benjamin White",
    "Charlotte Lee",
    "Daniel Harris",
  ]

  const skillNames = ["Design/CAD", "Wax/3D Print", "Casting", "Stone Setting", "Polishing", "Quality Control"]

  const craftspeople: Craftsperson[] = []

  for (let i = 0; i < count; i++) {
    // Generate 2-4 random skills
    const skillCount = Math.floor(Math.random() * 3) + 2
    const skills: Skill[] = []
    const availableSkills = [...skillNames]

    for (let j = 0; j < skillCount; j++) {
      if (availableSkills.length === 0) break

      const randomIndex = Math.floor(Math.random() * availableSkills.length)
      const skillName = availableSkills[randomIndex]
      availableSkills.splice(randomIndex, 1)

      skills.push({
        name: skillName,
        level: Math.floor(Math.random() * 3) + 1, // 1-3
      })
    }

    // Random workload (0-100%)
    const currentWorkload = Math.floor(Math.random() * 100)

    // Random efficiency and quality ratings (60-100%)
    const efficiencyRating = Math.floor(Math.random() * 40) + 60
    const qualityRating = Math.floor(Math.random() * 40) + 60

    // Random chance of being on leave
    const onLeave = Math.random() < 0.2

    // Generate absences if on leave
    let absences: Absence[] | undefined
    if (onLeave) {
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(startDate.getDate() + Math.floor(Math.random() * 14) + 1) // 1-14 days

      absences = [
        {
          id: `absence-${i}-1`,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          reason: Math.random() < 0.7 ? "Vacation" : "Sick Leave",
        },
      ]
    }

    craftspeople.push({
      id: `craftsperson-${i}`,
      name: names[i % names.length],
      skills,
      currentWorkload,
      efficiencyRating,
      qualityRating,
      onLeave,
      absences,
      assignedOrders: [],
    })
  }

  return craftspeople
}
