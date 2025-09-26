// Mock data for cost tracking components

export const mockCostData = {
  costCategories: [
    {
      id: "materials",
      name: "Direct Materials",
      estimatedCost: 42500,
      actualCost: 45800,
      subcategories: [
        { id: "gold", name: "Gold", cost: 22400 },
        { id: "silver", name: "Silver", cost: 8600 },
        { id: "gemstones", name: "Gemstones", cost: 12500 },
        { id: "other", name: "Other Materials", cost: 2300 },
      ],
    },
    {
      id: "labor",
      name: "Labor Hours",
      estimatedCost: 36000,
      actualCost: 38200,
      subcategories: [
        { id: "design", name: "Design", cost: 8200 },
        { id: "casting", name: "Casting", cost: 6400 },
        { id: "setting", name: "Stone Setting", cost: 12600 },
        { id: "finishing", name: "Finishing", cost: 11000 },
      ],
    },
    {
      id: "machine",
      name: "Machine Time",
      estimatedCost: 12000,
      actualCost: 11500,
      subcategories: [
        { id: "3d-printing", name: "3D Printing", cost: 4200 },
        { id: "casting-machine", name: "Casting Equipment", cost: 3800 },
        { id: "polishing", name: "Polishing Equipment", cost: 2100 },
        { id: "other-equip", name: "Other Equipment", cost: 1400 },
      ],
    },
    {
      id: "overhead",
      name: "Overhead Allocation",
      estimatedCost: 18500,
      actualCost: 19200,
      subcategories: [
        { id: "utilities", name: "Utilities", cost: 5600 },
        { id: "rent", name: "Workspace Allocation", cost: 8400 },
        { id: "insurance", name: "Insurance", cost: 2800 },
        { id: "misc", name: "Miscellaneous", cost: 2400 },
      ],
    },
    {
      id: "outsourced",
      name: "Outsourced Services",
      estimatedCost: 8500,
      actualCost: 10200,
      subcategories: [
        { id: "plating", name: "Plating", cost: 3800 },
        { id: "engraving", name: "Engraving", cost: 2400 },
        { id: "specialized", name: "Specialized Techniques", cost: 4000 },
      ],
    },
  ],
  profitability: {
    revenue: 165000,
    targetMargin: 35,
    mostProfitableCategory: {
      name: "Rings",
      margin: 42.5,
    },
  },
  trends: {
    previousPeriodCost: 120000,
    costTrend: [
      {
        title: "Material costs increasing",
        description: "Gold prices have increased by 8% over the past quarter, impacting material costs.",
        direction: "up",
      },
      {
        title: "Labor efficiency improving",
        description: "Labor costs per unit have decreased by 3.5% due to improved training and processes.",
        direction: "down",
      },
      {
        title: "Outsourced services costs rising",
        description: "Outsourced service costs have increased by 12% due to vendor price increases.",
        direction: "up",
      },
    ],
  },
}

export const mockWorkOrderCosts = [
  {
    id: "WO-1001",
    description: "Diamond Engagement Ring",
    status: "completed",
    revenue: 28500,
    costs: [
      { categoryId: "materials", estimatedCost: 8200, actualCost: 8600 },
      { categoryId: "labor", estimatedCost: 5400, actualCost: 5200 },
      { categoryId: "machine", estimatedCost: 1200, actualCost: 1150 },
      { categoryId: "overhead", estimatedCost: 2100, actualCost: 2100 },
      { categoryId: "outsourced", estimatedCost: 800, actualCost: 950 },
    ],
  },
  {
    id: "WO-1002",
    description: "Gold Wedding Band Set",
    status: "completed",
    revenue: 12500,
    costs: [
      { categoryId: "materials", estimatedCost: 4500, actualCost: 4800 },
      { categoryId: "labor", estimatedCost: 2200, actualCost: 2400 },
      { categoryId: "machine", estimatedCost: 800, actualCost: 750 },
      { categoryId: "overhead", estimatedCost: 1200, actualCost: 1200 },
      { categoryId: "outsourced", estimatedCost: 0, actualCost: 0 },
    ],
  },
  {
    id: "WO-1003",
    description: "Sapphire Pendant",
    status: "completed",
    revenue: 18200,
    costs: [
      { categoryId: "materials", estimatedCost: 6200, actualCost: 6800 },
      { categoryId: "labor", estimatedCost: 3600, actualCost: 3500 },
      { categoryId: "machine", estimatedCost: 900, actualCost: 850 },
      { categoryId: "overhead", estimatedCost: 1500, actualCost: 1500 },
      { categoryId: "outsourced", estimatedCost: 600, actualCost: 700 },
    ],
  },
  {
    id: "WO-1004",
    description: "Pearl Earrings",
    status: "completed",
    revenue: 8500,
    costs: [
      { categoryId: "materials", estimatedCost: 2800, actualCost: 2750 },
      { categoryId: "labor", estimatedCost: 2100, actualCost: 2300 },
      { categoryId: "machine", estimatedCost: 500, actualCost: 480 },
      { categoryId: "overhead", estimatedCost: 900, actualCost: 900 },
      { categoryId: "outsourced", estimatedCost: 0, actualCost: 0 },
    ],
  },
  {
    id: "WO-1005",
    description: "Custom Emerald Bracelet",
    status: "completed",
    revenue: 32000,
    costs: [
      { categoryId: "materials", estimatedCost: 9800, actualCost: 10600 },
      { categoryId: "labor", estimatedCost: 7200, actualCost: 7800 },
      { categoryId: "machine", estimatedCost: 1800, actualCost: 1700 },
      { categoryId: "overhead", estimatedCost: 2400, actualCost: 2400 },
      { categoryId: "outsourced", estimatedCost: 1200, actualCost: 1500 },
    ],
  },
  {
    id: "WO-1006",
    description: "Ruby Anniversary Ring",
    status: "in-progress",
    revenue: 22500,
    costs: [
      { categoryId: "materials", estimatedCost: 7500, actualCost: 8100 },
      { categoryId: "labor", estimatedCost: 4800, actualCost: 5100 },
      { categoryId: "machine", estimatedCost: 1200, actualCost: 1150 },
      { categoryId: "overhead", estimatedCost: 1800, actualCost: 1800 },
      { categoryId: "outsourced", estimatedCost: 900, actualCost: 1100 },
    ],
  },
  {
    id: "WO-1007",
    description: "Silver Chain Necklace",
    status: "in-progress",
    revenue: 5800,
    costs: [
      { categoryId: "materials", estimatedCost: 1800, actualCost: 1950 },
      { categoryId: "labor", estimatedCost: 1500, actualCost: 1600 },
      { categoryId: "machine", estimatedCost: 400, actualCost: 380 },
      { categoryId: "overhead", estimatedCost: 700, actualCost: 700 },
      { categoryId: "outsourced", estimatedCost: 0, actualCost: 0 },
    ],
  },
  {
    id: "WO-1008",
    description: "Diamond Tennis Bracelet",
    status: "in-progress",
    revenue: 42000,
    costs: [
      { categoryId: "materials", estimatedCost: 12500, actualCost: 13200 },
      { categoryId: "labor", estimatedCost: 8400, actualCost: 8700 },
      { categoryId: "machine", estimatedCost: 2100, actualCost: 2050 },
      { categoryId: "overhead", estimatedCost: 3200, actualCost: 3200 },
      { categoryId: "outsourced", estimatedCost: 1600, actualCost: 1800 },
    ],
  },
]

export const mockProfitabilityData = {
  overallMargin: 32.5,
  targetMargin: 35,
  marginTrend: -1.2,
  mostProfitableCategory: {
    name: "Rings",
    margin: 42.5,
  },
  categoryMargins: [
    { id: "rings", name: "Rings", margin: 42.5, revenue: 63000 },
    { id: "necklaces", name: "Necklaces", margin: 38.2, revenue: 24000 },
    { id: "bracelets", name: "Bracelets", margin: 32.8, revenue: 74000 },
    { id: "earrings", name: "Earrings", margin: 30.5, revenue: 8500 },
    { id: "custom", name: "Custom Pieces", margin: 28.4, revenue: 32000 },
  ],
  trends: [
    {
      title: "Ring margins improving",
      description: "Engagement ring margins have increased by 3.2% due to more efficient stone setting processes.",
      direction: "up",
    },
    {
      title: "Custom piece margins declining",
      description: "Custom jewelry margins have declined by 5.2% due to increased material costs and labor time.",
      direction: "down",
    },
    {
      title: "Bracelet production efficiency gains",
      description: "Production efficiency for bracelets has improved, increasing margins by 2.1%.",
      direction: "up",
    },
  ],
}
