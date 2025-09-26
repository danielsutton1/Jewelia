"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, DollarSign, CheckCircle, BarChart } from "lucide-react"

export function PerformanceTracking() {
  return (
    <Tabs defaultValue="response">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="response">
          <Clock className="h-4 w-4 mr-2" />
          Response
        </TabsTrigger>
        <TabsTrigger value="availability">
          <CheckCircle className="h-4 w-4 mr-2" />
          Availability
        </TabsTrigger>
        <TabsTrigger value="pricing">
          <DollarSign className="h-4 w-4 mr-2" />
          Pricing
        </TabsTrigger>
        <TabsTrigger value="history">
          <BarChart className="h-4 w-4 mr-2" />
          History
        </TabsTrigger>
      </TabsList>

      <TabsContent value="response" className="pt-4">
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>GoldRush Materials</div>
                <div className="font-medium text-green-600">1.2 hours avg</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: "90%" }}></div>
              </div>

              <div className="flex justify-between items-center">
                <div>Diamond Direct</div>
                <div className="font-medium text-amber-600">3.5 hours avg</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-amber-600 h-2.5 rounded-full" style={{ width: "70%" }}></div>
              </div>

              <div className="flex justify-between items-center">
                <div>FastCast Metals</div>
                <div className="font-medium text-green-600">2.1 hours avg</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: "85%" }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="availability" className="pt-4">
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>Emergency Suppliers</div>
                <div className="font-medium text-green-600">85% Available</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: "85%" }}></div>
              </div>

              <div className="flex justify-between items-center">
                <div>Rush Service Providers</div>
                <div className="font-medium text-amber-600">65% Available</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-amber-600 h-2.5 rounded-full" style={{ width: "65%" }}></div>
              </div>

              <div className="flex justify-between items-center">
                <div>Overflow Capacity</div>
                <div className="font-medium text-green-600">75% Available</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: "75%" }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="pricing" className="pt-4">
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>GoldRush Materials</div>
                <div className="font-medium">+15% Premium</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "15%" }}></div>
              </div>

              <div className="flex justify-between items-center">
                <div>Express Jewelry Finishing</div>
                <div className="font-medium">+30% Premium</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "30%" }}></div>
              </div>

              <div className="flex justify-between items-center">
                <div>Artisan Workshop Collective</div>
                <div className="font-medium">+10% Premium</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "10%" }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="history" className="pt-4">
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>Quality Rating</div>
                <div className="font-medium text-green-600">4.7/5 Average</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: "94%" }}></div>
              </div>

              <div className="flex justify-between items-center">
                <div>On-Time Delivery</div>
                <div className="font-medium text-amber-600">88%</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-amber-600 h-2.5 rounded-full" style={{ width: "88%" }}></div>
              </div>

              <div className="flex justify-between items-center">
                <div>Issue Resolution</div>
                <div className="font-medium text-green-600">92%</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: "92%" }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
