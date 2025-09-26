"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Zap, Send, CheckSquare, UserPlus } from "lucide-react"

export function QuickActivation() {
  return (
    <Tabs defaultValue="request">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="request">
          <Zap className="h-4 w-4 mr-2" />
          One-Click
        </TabsTrigger>
        <TabsTrigger value="broadcast">
          <Send className="h-4 w-4 mr-2" />
          Broadcast
        </TabsTrigger>
        <TabsTrigger value="capacity">
          <CheckSquare className="h-4 w-4 mr-2" />
          Capacity
        </TabsTrigger>
        <TabsTrigger value="onboarding">
          <UserPlus className="h-4 w-4 mr-2" />
          Onboarding
        </TabsTrigger>
      </TabsList>

      <TabsContent value="request" className="pt-4">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select material" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="platinum">Platinum</SelectItem>
                <SelectItem value="diamonds">Diamonds</SelectItem>
                <SelectItem value="gemstones">Gemstones</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Critical (2-4 hours)</SelectItem>
                <SelectItem value="urgent">Urgent (Same day)</SelectItem>
                <SelectItem value="high">High (24 hours)</SelectItem>
                <SelectItem value="standard">Standard (2-3 days)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full">Send Emergency Request</Button>
        </div>
      </TabsContent>

      <TabsContent value="broadcast" className="pt-4">
        <div className="space-y-4">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select partner group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Backup Partners</SelectItem>
              <SelectItem value="emergency">Emergency Suppliers</SelectItem>
              <SelectItem value="rush">Rush Service Providers</SelectItem>
              <SelectItem value="overflow">Overflow Capacity</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select message template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="material-shortage">Material Shortage</SelectItem>
              <SelectItem value="production-delay">Production Delay</SelectItem>
              <SelectItem value="capacity-needed">Capacity Needed</SelectItem>
              <SelectItem value="rush-order">Rush Order</SelectItem>
            </SelectContent>
          </Select>

          <Button className="w-full">Broadcast Message</Button>
        </div>
      </TabsContent>

      <TabsContent value="capacity" className="pt-4">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="casting">Casting</SelectItem>
                <SelectItem value="setting">Stone Setting</SelectItem>
                <SelectItem value="polishing">Polishing</SelectItem>
                <SelectItem value="plating">Plating</SelectItem>
                <SelectItem value="engraving">Engraving</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="24h">Next 24 hours</SelectItem>
                <SelectItem value="week">This week</SelectItem>
                <SelectItem value="month">This month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full">Check Available Capacity</Button>
        </div>
      </TabsContent>

      <TabsContent value="onboarding" className="pt-4">
        <div className="space-y-4">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select partner type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="emergency">Emergency Supplier</SelectItem>
              <SelectItem value="rush">Rush Service Provider</SelectItem>
              <SelectItem value="overflow">Overflow Capacity</SelectItem>
            </SelectContent>
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Button className="w-full">Start Express Onboarding</Button>
            <Button variant="outline" className="w-full">
              Send Invitation
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}
