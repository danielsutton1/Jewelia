"use client"

import { useState } from "react"
import type { PartnerProfile } from "@/types/partner-profile"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Wrench, Gauge, Lightbulb, ImageIcon } from "lucide-react"
import Image from "next/image"

interface CapabilitiesProps {
  partner: PartnerProfile
}

export function Capabilities({ partner }: CapabilitiesProps) {
  const [activeTab, setActiveTab] = useState("services")

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold flex items-center">
              <Wrench className="mr-2 h-5 w-5" />
              Capabilities
            </CardTitle>
            <CardDescription>Services, equipment, capacity, and expertise</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="services" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="capacity">Capacity</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {partner.specialties.map((specialty) => {
                  const specialtyName = specialty
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")

                  return (
                    <Badge key={specialty} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {specialtyName}
                    </Badge>
                  )
                })}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Special Expertise</h3>
              <ul className="space-y-2">
                {partner.specialExpertise.map((expertise, index) => (
                  <li key={index} className="flex items-start">
                    <Lightbulb className="w-4 h-4 text-amber-500 mr-2 mt-0.5" />
                    <span>{expertise}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="equipment">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {partner.equipment.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <Badge variant="outline" className="mt-1">
                          {item.type}
                        </Badge>
                      </div>
                      <div className="bg-gray-100 px-2 py-1 rounded text-sm">Qty: {item.quantity}</div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{item.capabilities}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="capacity">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Maximum Order Size</h3>
                  <p className="mt-1">{partner.capacity.maxOrderSize}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Lead Time</h3>
                  <p className="mt-1">{partner.capacity.leadTime}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Turnaround Time</h3>
                  <p className="mt-1">{partner.capacity.turnaroundTime}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Available Hours</h3>
                  <div className="mt-1 flex items-center">
                    <Gauge className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-lg font-medium">{partner.capacity.availableHours} hours/week</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Notes</h3>
                  <p className="mt-1 text-sm">{partner.capacity.notes}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="portfolio">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {partner.portfolio.map((item) => (
                <div key={item.id} className="border rounded-lg overflow-hidden">
                  <div className="relative h-48 w-full">
                    <Image src={item.imageUrl || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    <p className="text-xs text-gray-400 mt-2">{new Date(item.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {partner.portfolio.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-8 text-gray-500">
                  <ImageIcon className="w-12 h-12 mb-2 text-gray-300" />
                  <p>No portfolio items available</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
