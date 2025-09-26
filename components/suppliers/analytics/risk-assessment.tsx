"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScatterChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

interface RiskAssessmentProps {
  timeRange: string
  selectedSuppliers: string[]
  selectedCategories: string[]
}

export function RiskAssessment({ timeRange, selectedSuppliers, selectedCategories }: RiskAssessmentProps) {
  // Mock data - in a real app, this would be fetched based on the filters
  // x: dependency (higher = more dependent on supplier)
  // y: reliability (higher = more reliable)
  // z: spend volume (size of bubble)
  const data = [
    { name: "Diamond Direct", x: 65, y: 94, z: 250000 },
    { name: "Precision Casting", x: 80, y: 92, z: 180000 },
    { name: "Gem Source", x: 70, y: 89, z: 220000 },
    { name: "Master Plating", x: 55, y: 87, z: 120000 },
    { name: "Goldsmith Supplies", x: 40, y: 85, z: 90000 },
    { name: "Artisan Engraving", x: 30, y: 82, z: 70000 },
    { name: "Express Shipping", x: 50, y: 78, z: 110000 },
    { name: "Secure Logistics", x: 45, y: 84, z: 100000 },
    { name: "Craft Alliance", x: 25, y: 88, z: 60000 },
    { name: "Silver Source", x: 75, y: 76, z: 150000 },
  ]

  // Calculate high risk suppliers (high dependency, low reliability)
  const highRiskSuppliers = data.filter(supplier => supplier.x > 60 && supplier.y < 85).length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Assessment</CardTitle>
        <CardDescription>Supplier risk analysis and mitigation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-muted-foreground">High Risk Suppliers</span>
              <div className="text-2xl font-bold text-red-600">{highRiskSuppliers}</div>
            </div>
            <div className="text-right">
              <span className="text-sm text-muted-foreground">Total Assessed</span>
              <div className="text-xl font-semibold">{data.length}</div>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Dependency" 
                  domain={[0, 100]}
                  label={{ value: 'Dependency', position: 'bottom', offset: 0 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Reliability" 
                  domain={[70, 100]}
                />
                <ResponsiveContainer>
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name="Dependency" 
                      domain={[0, 100]}
                      label={{ value: 'Dependency', position: 'bottom', offset: 0 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name="Reliability" 
                      domain={[70, 100]}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default RiskAssessment;
