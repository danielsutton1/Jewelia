// Types for our production data
export interface StageHistory {
  stage: string
  enteredAt: string
  exitedAt?: string
}

export interface WorkOrder {
  id: string
  orderNumber: string
  customerName: string
  itemDescription: string
  currentStage: string
  dueDate: string
  priority: "high" | "medium" | "low"
  assignedTo: string
  timeInStage: number // hours
  progress: number // percentage
  notes?: string
  stageHistory?: StageHistory[]
}

export interface ProductionStage {
  id: string
  name: string
  wipLimit: number
}

// Sample data generator
export function generateSampleWorkOrders(count: number): WorkOrder[] {
  const stages = ["design", "wax", "casting", "setting", "polishing", "qc", "ready"]
  const priorities = ["high", "medium", "low"]
  const craftspeople = [
    "Michael Chen",
    "Sophia Rodriguez",
    "David Kim",
    "Emma Johnson",
    "James Wilson",
    "Olivia Martinez",
    "William Taylor",
    "Ava Thompson",
  ]

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
    "Garnet Earrings",
    "Aquamarine Pendant",
  ]

  const orders: WorkOrder[] = []

  for (let i = 0; i < count; i++) {
    const orderNumber = `JO-${String(1000 + i).padStart(4, "0")}`
    const randomStageIndex = Math.floor(Math.random() * stages.length)
    const currentStage = stages[randomStageIndex]

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

    // Random time in stage (1-72 hours)
    const timeInStage = Math.floor(Math.random() * 72) + 1

    // Random progress percentage based on current stage
    const baseProgress = (randomStageIndex / (stages.length - 1)) * 100
    const randomVariation = Math.floor(Math.random() * 20) - 10 // -10 to +10
    const progress = Math.min(100, Math.max(0, Math.round(baseProgress + randomVariation)))

    // Generate stage history
    const stageHistory: StageHistory[] = []
    for (let j = 0; j <= randomStageIndex; j++) {
      const enteredDate = new Date()
      enteredDate.setDate(enteredDate.getDate() - (randomStageIndex - j + 1))

      const exitedDate = j < randomStageIndex ? new Date() : undefined
      if (exitedDate) {
        exitedDate.setDate(exitedDate.getDate() - (randomStageIndex - j))
      }

      stageHistory.push({
        stage: stages[j],
        enteredAt: enteredDate.toISOString(),
        exitedAt: exitedDate?.toISOString(),
      })
    }

    orders.push({
      id: `order-${i}`,
      orderNumber,
      customerName: `Customer ${i + 1}`,
      itemDescription: itemDescriptions[Math.floor(Math.random() * itemDescriptions.length)],
      currentStage,
      dueDate: dueDate.toISOString(),
      priority,
      assignedTo: craftspeople[Math.floor(Math.random() * craftspeople.length)],
      timeInStage,
      progress,
      notes: Math.random() > 0.7 ? "Customer requested rush delivery" : undefined,
      stageHistory,
    })
  }

  return orders
}
