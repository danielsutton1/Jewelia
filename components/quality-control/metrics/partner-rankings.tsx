"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const partnerData = [
  {
    id: 1,
    name: "Diamond Direct",
    logo: "/partner-logos/diamond-direct.png",
    passRate: 92.5,
    defectRate: 7.5,
    responseTime: 1.2,
    trend: "up",
    specialties: ["Diamond Setting", "Custom Design"],
  },
  {
    id: 2,
    name: "Goldsmith Supplies",
    logo: "/partner-logos/goldsmith-supplies.png",
    passRate: 89.8,
    defectRate: 10.2,
    responseTime: 1.5,
    trend: "up",
    specialties: ["Gold Casting", "Chain Manufacturing"],
  },
  {
    id: 3,
    name: "Precision Casting",
    logo: "/partner-logos/precision-casting.png",
    passRate: 85.3,
    defectRate: 14.7,
    responseTime: 2.1,
    trend: "down",
    specialties: ["Lost Wax Casting", "Mold Making"],
  },
  {
    id: 4,
    name: "Artisan Engraving",
    logo: "/partner-logos/artisan-engraving.png",
    passRate: 94.2,
    defectRate: 5.8,
    responseTime: 1.0,
    trend: "up",
    specialties: ["Hand Engraving", "Laser Engraving"],
  },
  {
    id: 5,
    name: "Master Plating",
    logo: "/partner-logos/master-plating.png",
    passRate: 88.1,
    defectRate: 11.9,
    responseTime: 1.8,
    trend: "stable",
    specialties: ["Rhodium Plating", "Gold Plating"],
  },
  {
    id: 6,
    name: "Gem Source",
    logo: "/partner-logos/gem-source.png",
    passRate: 91.7,
    defectRate: 8.3,
    responseTime: 1.3,
    trend: "up",
    specialties: ["Gemstone Cutting", "Stone Sourcing"],
  },
  {
    id: 7,
    name: "Silver Source",
    logo: "/partner-logos/silver-source.png",
    passRate: 87.4,
    defectRate: 12.6,
    responseTime: 1.9,
    trend: "down",
    specialties: ["Silver Casting", "Chain Manufacturing"],
  },
]

export function PartnerRankings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Partner Quality Rankings</CardTitle>
        <CardDescription>Performance metrics by partner</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Partner</TableHead>
              <TableHead className="text-right">Pass Rate</TableHead>
              <TableHead className="text-right">Defect Rate</TableHead>
              <TableHead className="text-right">Response Time</TableHead>
              <TableHead>Trend</TableHead>
              <TableHead>Specialties</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partnerData
              .sort((a, b) => b.passRate - a.passRate)
              .map((partner) => (
                <TableRow key={partner.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={partner.logo || "/placeholder.svg"} alt={partner.name} />
                        <AvatarFallback>
                          {partner.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{partner.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{partner.passRate}%</TableCell>
                  <TableCell className="text-right">{partner.defectRate}%</TableCell>
                  <TableCell className="text-right">{partner.responseTime} days</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        partner.trend === "up" ? "default" : partner.trend === "down" ? "destructive" : "outline"
                      }
                    >
                      {partner.trend === "up" ? "Improving" : partner.trend === "down" ? "Declining" : "Stable"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {partner.specialties.map((specialty) => (
                        <Badge key={specialty} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
