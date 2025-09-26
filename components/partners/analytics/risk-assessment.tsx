"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ShieldAlert, TrendingDown, DollarSign, Truck, ArrowRight } from "lucide-react"

export function RiskAssessment() {
  // Mock data for risk assessment
  const riskFactors = [
    {
      id: 1,
      factor: "Supply Chain Disruption",
      riskLevel: 75,
      severity: "high",
      icon: <Truck className="h-5 w-5 text-red-500" />,
      description: "High risk of supply chain disruptions due to global shipping delays",
      partners: ["GoldCraft Suppliers", "Diamond District Gems"],
      mitigation: "Develop secondary sourcing options and increase safety stock levels",
    },
    {
      id: 2,
      factor: "Price Volatility",
      riskLevel: 60,
      severity: "medium",
      icon: <DollarSign className="h-5 w-5 text-amber-500" />,
      description: "Increasing price volatility in precious metals market",
      partners: ["GoldCraft Suppliers", "Precision Casting Co."],
      mitigation: "Implement hedging strategies and long-term contracts with price caps",
    },
    {
      id: 3,
      factor: "Quality Compliance",
      riskLevel: 45,
      severity: "medium",
      icon: <ShieldAlert className="h-5 w-5 text-amber-500" />,
      description: "Risk of non-compliance with updated quality standards",
      partners: ["Elite Craftspeople", "Master Engravers Guild"],
      mitigation: "Conduct quarterly quality audits and certification reviews",
    },
    {
      id: 4,
      factor: "Partner Financial Stability",
      riskLevel: 30,
      severity: "low",
      icon: <TrendingDown className="h-5 w-5 text-blue-500" />,
      description: "Potential financial instability with smaller partners",
      partners: ["Pearl Perfection", "Elite Craftspeople"],
      mitigation: "Monitor financial health indicators and payment patterns",
    },
  ]

  // Helper function to get risk color
  const getRiskColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-500 bg-red-50 border-red-200"
      case "medium":
        return "text-amber-500 bg-amber-50 border-amber-200"
      case "low":
        return "text-blue-500 bg-blue-50 border-blue-200"
      default:
        return "text-gray-500 bg-gray-50 border-gray-200"
    }
  }

  // Helper function to get progress color
  const getProgressColor = (riskLevel: number) => {
    if (riskLevel >= 70) return "bg-red-500"
    if (riskLevel >= 50) return "bg-amber-500"
    return "bg-blue-500"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Assessment</CardTitle>
        <CardDescription>Potential risks in partner relationships and mitigation strategies</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {riskFactors.map((risk) => (
            <div key={risk.id} className="border rounded-md p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {risk.icon}
                  <div>
                    <h3 className="font-medium">{risk.factor}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{risk.description}</p>
                  </div>
                </div>
                <Badge variant="outline" className={getRiskColor(risk.severity)}>
                  {risk.severity.charAt(0).toUpperCase() + risk.severity.slice(1)} Risk
                </Badge>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Risk Level</span>
                  <span className="font-medium">{risk.riskLevel}%</span>
                </div>
                <Progress value={risk.riskLevel} className={`h-2 [&>div]:${getProgressColor(risk.riskLevel)}`} />
              </div>

              <div className="mt-3">
                <div className="text-xs text-muted-foreground mb-1">Affected Partners:</div>
                <div className="flex flex-wrap gap-1">
                  {risk.partners.map((partner, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {partner}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                <p className="text-sm">{risk.mitigation}</p>
              </div>

              <Button variant="link" size="sm" className="mt-2 p-0 h-auto">
                View risk management plan
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
