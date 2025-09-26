"use client"

import { ResponsiveContainer, FunnelChart, Funnel, LabelList, Tooltip } from "recharts"

export function ConversionFunnelChart() {
  // In a real app, this data would come from an API call
  const data = [
    { name: "Product Views", value: 12500, fill: "#8884d8" },
    { name: "Add to Cart", value: 5600, fill: "#83a6ed" },
    { name: "Checkout Started", value: 3200, fill: "#8dd1e1" },
    { name: "Payment Info Added", value: 2400, fill: "#82ca9d" },
    { name: "Purchases", value: 1850, fill: "#a4de6c" },
  ]

  // Calculate conversion rates
  const rates = data.map((item, index) => {
    if (index === 0) return { ...item, rate: "100%" }
    const rate = ((item.value / data[index - 1].value) * 100).toFixed(1)
    return { ...item, rate: `${rate}%` }
  })

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <FunnelChart>
          <Tooltip formatter={(value, name, props) => [`${value.toLocaleString()} (${props.payload.rate})`, name]} />
          <Funnel dataKey="value" data={rates} isAnimationActive>
            <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
            <LabelList position="right" fill="#000" stroke="none" dataKey="rate" offset={100} />
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </div>
  )
}
