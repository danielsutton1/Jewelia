"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, Treemap, Tooltip } from "recharts"

const COLORS = ["#8dd1e1", "#82ca9d", "#ffc658", "#ff8042", "#d0211c"]

const data = [
  {
    name: "0-30 Days",
    children: [
      { name: "Rings", size: 42000 },
      { name: "Necklaces", size: 35000 },
      { name: "Earrings", size: 28000 },
      { name: "Bracelets", size: 22000 },
      { name: "Watches", size: 38000 },
    ],
  },
  {
    name: "31-60 Days",
    children: [
      { name: "Rings", size: 35000 },
      { name: "Necklaces", size: 28000 },
      { name: "Earrings", size: 22000 },
      { name: "Bracelets", size: 18000 },
      { name: "Watches", size: 32000 },
    ],
  },
  {
    name: "61-90 Days",
    children: [
      { name: "Rings", size: 28000 },
      { name: "Necklaces", size: 22000 },
      { name: "Earrings", size: 18000 },
      { name: "Bracelets", size: 15000 },
      { name: "Watches", size: 25000 },
    ],
  },
  {
    name: "91-180 Days",
    children: [
      { name: "Rings", size: 22000 },
      { name: "Necklaces", size: 18000 },
      { name: "Earrings", size: 15000 },
      { name: "Bracelets", size: 12000 },
      { name: "Watches", size: 20000 },
    ],
  },
  {
    name: "181+ Days",
    children: [
      { name: "Rings", size: 18000 },
      { name: "Necklaces", size: 15000 },
      { name: "Earrings", size: 12000 },
      { name: "Bracelets", size: 10000 },
      { name: "Watches", size: 16000 },
    ],
  },
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-2 border rounded shadow-sm">
        <p className="font-medium">{`${data.name} (${data.parent})`}</p>
        <p className="text-sm">{`Value: $${data.size.toLocaleString()}`}</p>
      </div>
    )
  }
  return null
}

const CustomContent = ({ root, depth, x, y, width, height, index, payload, colors, rank, name }: any) => {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill:
            depth === 1
              ? COLORS[Math.floor((index / root.children.length) * COLORS.length)]
              : "rgba(255,255,255,0.5)",
          stroke: "#fff",
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
      />
      {depth === 1 && width > 50 && height > 20 && (
        <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={12}>
          {name}
        </text>
      )}
    </g>
  )
}

export function AgingInventoryHeatmap() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aging Inventory Heatmap</CardTitle>
        <CardDescription>Distribution of inventory value by age and category</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={data}
              dataKey="size"
              stroke="#fff"
              fill="#8884d8"
              content={<CustomContent />}
            >
              <Tooltip content={<CustomTooltip />} />
            </Treemap>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
